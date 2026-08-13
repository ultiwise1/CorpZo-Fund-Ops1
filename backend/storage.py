"""Emergent Object Storage helper."""
import os
import requests
import logging

log = logging.getLogger("storage")


def _base():
    return (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"


def _url():
    return _base().rstrip("/") + "/objstore/api/v1/storage"

APP_NAME = os.environ.get("APP_NAME", "corpzo-crm")

_storage_key: str | None = None


def init_storage(force: bool = False) -> str | None:
    global _storage_key
    if _storage_key and not force:
        return _storage_key
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        log.warning("EMERGENT_LLM_KEY not configured; storage disabled")
        return None
    try:
        resp = requests.post(f"{_url()}/init", json={"emergent_key": key}, timeout=30)
        resp.raise_for_status()
        _storage_key = resp.json()["storage_key"]
        return _storage_key
    except Exception as e:
        log.error(f"Storage init failed: {e}")
        return None


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        return {"path": path, "size": len(data), "etag": "sandbox"}
    resp = requests.put(
        f"{_url()}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    if resp.status_code == 404:
        init_storage(force=True)
        key = _storage_key
        resp = requests.put(
            f"{_url()}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    resp = requests.get(
        f"{_url()}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    if resp.status_code == 404:
        init_storage(force=True)
        key = _storage_key
        resp = requests.get(
            f"{_url()}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=60,
        )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")
