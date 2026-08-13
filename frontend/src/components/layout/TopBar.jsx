import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Command as CmdIcon } from "lucide-react";
import { api } from "@/lib/api";
import { humanize } from "@/lib/format";

// group meta: label + route builder + result renderer
const GROUP_META = {
  leads:         { label: "Leads",         route: it => `/leads/${it.lead_uid}`,             uid: it => it.lead_uid,        badge: "#FF6B4E" },
  clients:       { label: "Clients",       route: it => `/clients/${it.client_uid}`,         uid: it => it.client_uid,      badge: "#3287D6" },
  cases:         { label: "Cases",         route: it => `/cases/${it.case_uid}`,             uid: it => it.case_uid,        badge: "#8B5CF6" },
  applications:  { label: "Applications",  route: () => `/applications`,                     uid: it => it.application_uid, badge: "#D89B00" },
  sanctions:     { label: "Sanctions",     route: () => `/sanctions`,                        uid: it => it.sanction_uid,    badge: "#E85A3D" },
  disbursements: { label: "Disbursements", route: () => `/disbursements`,                    uid: it => it.disbursement_uid,badge: "#0B1F3A" },
  invoices:      { label: "Invoices",      route: () => `/invoices`,                         uid: it => it.invoice_uid,     badge: "#B58900" },
  tasks:         { label: "Tasks",         route: () => `/tasks`,                            uid: it => it.task_uid,        badge: "#E24A6B" },
  partners:      { label: "Partners",      route: () => `/channel-partners`,                 uid: it => it.channel_code || it.partner_uid, badge: "#B23B8A" },
};
const ORDER = ["leads","clients","cases","applications","sanctions","disbursements","invoices","tasks","partners"];

export default function TopBar({ title, breadcrumbs = [], actions }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const nav = useNavigate();
  const boxRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (!q || q.length < 2) { setRes(null); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`);
        setRes(data); setOpen(true); setFocusIdx(0);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const clickHandler = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    const keyHandler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", clickHandler);
    document.addEventListener("keydown", keyHandler);
    return () => { document.removeEventListener("click", clickHandler); document.removeEventListener("keydown", keyHandler); };
  }, []);

  // flatten for keyboard navigation
  const flat = ORDER.flatMap(k => (res?.[k] || []).map(it => ({ group: k, item: it })));

  const onKey = (e) => {
    if (!open || !flat.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setFocusIdx(i => Math.min(flat.length-1, i+1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFocusIdx(i => Math.max(0, i-1)); }
    if (e.key === "Enter" && flat[focusIdx]) {
      const { group, item } = flat[focusIdx];
      const route = GROUP_META[group].route(item);
      setOpen(false); setQ(""); nav(route);
    }
  };

  const go = (path) => { setOpen(false); setQ(""); nav(path); };

  return (
    <div className="h-14 border-b border-[#0B1F3A]/10 bg-white/85 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-6" data-testid="topbar">
      <div className="flex items-center gap-2 text-sm text-[#0B1F3A]/60">
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-[#0B1F3A]/25">/</span>}
            <span className={i === breadcrumbs.length - 1 ? "text-[#0B1F3A] font-semibold" : ""}>{b}</span>
          </span>
        ))}
        {title && !breadcrumbs.length && <span className="text-[#0B1F3A] font-semibold">{title}</span>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-[440px]" ref={boxRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0B1F3A]/40" size={15}/>
          <input
            ref={inputRef}
            data-testid="global-search"
            value={q}
            onFocus={() => q.length >= 2 && setOpen(true)}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search UID, name, PAN, GSTIN, mobile, email…"
            className="w-full h-9 pl-9 pr-16 text-sm bg-[#0B1F3A]/5 hover:bg-[#0B1F3A]/8 border border-transparent focus:border-[#FF6B4E]/50 focus:bg-white rounded-md outline-none text-[#0B1F3A] placeholder:text-[#0B1F3A]/40"
          />
          <kbd className="hidden md:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 text-[10px] font-mono text-[#0B1F3A]/40 bg-white border border-[#0B1F3A]/10 rounded px-1.5 py-0.5">
            <CmdIcon size={9}/>K
          </kbd>
          {open && (
            <div className="absolute top-11 left-0 right-0 bg-white border border-[#0B1F3A]/10 shadow-2xl rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto z-50" data-testid="search-results">
              {loading && <div className="p-4 text-center text-xs text-[#0B1F3A]/50">Searching…</div>}
              {!loading && res && !flat.length && (
                <div className="p-8 text-center">
                  <div className="text-sm text-[#0B1F3A]/70">No matches for <span className="font-semibold text-[#0B1F3A]">&quot;{q}&quot;</span></div>
                  <div className="text-xs text-[#0B1F3A]/50 mt-1">Try a UID, PAN, GSTIN, mobile or partial name.</div>
                </div>
              )}
              {!loading && res && flat.length > 0 && (
                <div>
                  {ORDER.map(gk => {
                    const arr = res[gk] || [];
                    if (!arr.length) return null;
                    const meta = GROUP_META[gk];
                    return (
                      <div key={gk}>
                        <div className="px-3 py-1.5 text-[10.5px] uppercase tracking-wider text-[#0B1F3A]/60 bg-[#F2F5FA] border-b border-[#0B1F3A]/8 font-bold flex items-center justify-between">
                          <span>{meta.label}</span>
                          <span className="text-[9px] text-[#0B1F3A]/40">{arr.length}</span>
                        </div>
                        {arr.map((it) => {
                          const uid = meta.uid(it);
                          const flatIdx = flat.findIndex(f => f.group === gk && meta.uid(f.item) === uid);
                          const active = flatIdx === focusIdx;
                          return (
                            <button key={uid} onClick={() => go(meta.route(it))}
                              onMouseEnter={() => setFocusIdx(flatIdx)}
                              className={`w-full text-left px-3 py-2 flex items-center justify-between border-b border-[#0B1F3A]/6 last:border-0 transition ${active?"bg-[#FF6B4E]/10":"hover:bg-[#F2F5FA]"}`}>
                              <div className="min-w-0 flex-1">
                                <div className="text-sm text-[#0B1F3A] font-medium truncate">
                                  {it.name || it.company || it.title || it.purpose || uid}
                                </div>
                                <div className="text-xs text-[#0B1F3A]/55 truncate">
                                  {[it.mobile, it.email, it.pan, it.gstin, it.cin, it.stage, it.status]
                                    .filter(Boolean).slice(0,3).join(" · ")}
                                </div>
                              </div>
                              <div className="ml-3 flex items-center gap-2 shrink-0">
                                <span className="mono text-[11px] text-[#0B1F3A]/70">{uid}</span>
                                <span className="w-1.5 h-1.5 rounded-full" style={{background: meta.badge}}/>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                  <div className="px-3 py-2 text-[10.5px] text-[#0B1F3A]/45 bg-[#F2F5FA] border-t border-[#0B1F3A]/8 flex items-center justify-between">
                    <span>↑↓ navigate · ↵ open · esc close</span>
                    <span>{flat.length} result{flat.length===1?"":"s"}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <button className="w-9 h-9 rounded-md border border-[#0B1F3A]/10 flex items-center justify-center text-[#0B1F3A]/60 hover:text-[#0B1F3A] hover:border-[#FF6B4E]/40" data-testid="notifications-btn">
          <Bell size={16}/>
        </button>
        {actions}
      </div>
    </div>
  );
}
