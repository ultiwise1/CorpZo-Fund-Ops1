"""Multi-channel notification delivery: in-app + email (Emergent Resend) + WhatsApp (Twilio)."""
from __future__ import annotations
import os, re, ipaddress, logging, uuid, asyncio
from datetime import datetime, timezone
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from typing import Optional
import httpx

log = logging.getLogger("notify")

EMAIL_BASE_URL = "https://integrations.emergentagent.com"


def _cfg():
    return {
        "email_key": os.environ.get("EMERGENT_EMAIL_KEY"),
        "email_from_name": os.environ.get("EMAIL_FROM_NAME", "CorpZo Debt CRM"),
        "email_reply_to": os.environ.get("EMAIL_REPLY_TO"),
        "twilio_sid": os.environ.get("TWILIO_ACCOUNT_SID"),
        "twilio_token": os.environ.get("TWILIO_AUTH_TOKEN"),
        "twilio_from": os.environ.get("TWILIO_WHATSAPP_FROM"),
    }


# ------------------ Email safety gate (from Resend playbook) ------------------
_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = (
    "reply with your password", "reply with the code", "send your password", "cvv",
    "send us your password", "enter your password below", "confirm your card number",
    "your full card number", "seed phrase", "recovery phrase", "verify your card",
    "social security number", "confirm your bank details",
)
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []
    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []
    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)
    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} ≠ real link host {real!r} (G3)")


async def send_email(to: str, subject: str, html: str) -> Optional[str]:
    cfg = _cfg()
    if not cfg["email_key"] or not to:
        log.warning(f"[EMAIL SANDBOX] {to} · {subject}")
        return None
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": cfg["email_from_name"]}
    if cfg["email_reply_to"]:
        payload["contact_email"] = cfg["email_reply_to"]
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(f"{EMAIL_BASE_URL}/api/v1/email/send",
                             headers={"X-Email-Key": cfg["email_key"]}, json=payload)
        r.raise_for_status()
        return r.json().get("id")
    except Exception as e:
        log.error(f"Email send failed to {to}: {e}")
        return None


async def send_whatsapp(mobile: str, text: str) -> Optional[str]:
    """Twilio WhatsApp — gracefully degrades to sandbox log if creds are missing."""
    cfg = _cfg()
    if not (cfg["twilio_sid"] and cfg["twilio_token"] and cfg["twilio_from"]) or not mobile:
        log.info(f"[WHATSAPP SANDBOX] +{mobile} · {text[:80]}")
        return None
    mobile = mobile.strip()
    if not mobile.startswith("+"):
        mobile = "+91" + mobile.lstrip("0")
    to = f"whatsapp:{mobile}"
    try:
        auth = (cfg["twilio_sid"], cfg["twilio_token"])
        url = f"https://api.twilio.com/2010-04-01/Accounts/{cfg['twilio_sid']}/Messages.json"
        data = {"From": cfg["twilio_from"], "To": to, "Body": text}
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(url, data=data, auth=auth)
        if r.status_code >= 400:
            log.error(f"WhatsApp send {r.status_code}: {r.text[:200]}")
            return None
        return r.json().get("sid")
    except Exception as e:
        log.error(f"WhatsApp send failed to {mobile}: {e}")
        return None


async def notify(db, user_id: str, title: str, body: str = "", link: Optional[str] = None,
                 kind: str = "info", email: Optional[str] = None, mobile: Optional[str] = None,
                 send_email_too: bool = True, send_whatsapp_too: bool = True) -> None:
    """Fan out: in-app + email + WhatsApp. Non-blocking; each channel is best-effort."""
    doc = {
        "notification_id": f"notif_{uuid.uuid4().hex[:10]}",
        "user_id": user_id, "title": title, "body": body, "link": link, "kind": kind,
        "read": False, "created_at": datetime.now(timezone.utc).isoformat(),
        "channels": {"in_app": True, "email": False, "whatsapp": False},
    }
    await db.notifications.insert_one(doc)

    async def _email():
        if not (send_email_too and email): return
        try:
            html = _build_email_html(title, body, link)
            eid = await send_email(email, title, html)
            if eid:
                await db.notifications.update_one({"notification_id": doc["notification_id"]},
                                                  {"$set": {"channels.email": True, "email_id": eid}})
        except Exception as e:
            log.warning(f"email side-channel failed: {e}")

    async def _wa():
        if not (send_whatsapp_too and mobile): return
        try:
            msg = f"CorpZo · {title}\n{body}"
            if link: msg += f"\nOpen: {link}"
            sid = await send_whatsapp(mobile, msg[:1500])
            if sid:
                await db.notifications.update_one({"notification_id": doc["notification_id"]},
                                                  {"$set": {"channels.whatsapp": True, "whatsapp_sid": sid}})
        except Exception as e:
            log.warning(f"whatsapp side-channel failed: {e}")

    # fire-and-forget; never let a slow send block the caller
    asyncio.create_task(_email())
    asyncio.create_task(_wa())


def _build_email_html(title: str, body: str, link: Optional[str]) -> str:
    safe_title = escape(title)
    safe_body = escape(body).replace("\n", "<br>")
    cta = ""
    if link and link.startswith("https://"):
        cta = (f'<p style="margin:20px 0"><a href="{link}" '
               f'style="background:#0b1220;color:#fff;padding:10px 18px;border-radius:6px;'
               f'text-decoration:none;font-family:Arial,sans-serif;font-size:14px">Open in CorpZo</a></p>')
    from_name = _cfg()["email_from_name"]
    return (
        f'<table role="presentation" width="100%" style="background:#f6f7fb;padding:24px 0">'
        f'<tr><td align="center">'
        f'<table role="presentation" width="560" cellpadding="0" cellspacing="0" '
        f'style="background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;'
        f'font-family:Arial,sans-serif">'
        f'<tr><td style="padding:20px 24px;background:#0b1220;color:#fff">'
        f'<div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#f59e0b">CorpZo · Debt CRM</div>'
        f'<div style="font-size:20px;font-weight:600;margin-top:4px">{safe_title}</div></td></tr>'
        f'<tr><td style="padding:24px;color:#0f172a;font-size:14px;line-height:1.55">{safe_body}{cta}</td></tr>'
        f'<tr><td style="padding:16px 24px;border-top:1px solid #e5e7eb;color:#64748b;font-size:11.5px">'
        f'Sent by {escape(from_name)}. We never ask for your password or card details by email.</td></tr>'
        f'</table></td></tr></table>'
    )
