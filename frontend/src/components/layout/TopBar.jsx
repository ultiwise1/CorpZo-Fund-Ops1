import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import { api } from "@/lib/api";
import { humanize } from "@/lib/format";

export default function TopBar({ title, breadcrumbs = [], actions }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [res, setRes] = useState(null);
  const nav = useNavigate();
  const boxRef = useRef();

  useEffect(() => {
    if (!q || q.length < 2) { setRes(null); return; }
    const t = setTimeout(async () => {
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(q)}`);
        setRes(data);
        setOpen(true);
      } catch { /* ignore */ }
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const h = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, []);

  const go = (path) => { setOpen(false); setQ(""); nav(path); };

  return (
    <div className="h-14 border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-6" data-testid="topbar">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {breadcrumbs.map((b, i) => (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && <span className="text-slate-300">/</span>}
            <span className={i === breadcrumbs.length - 1 ? "text-slate-900 font-medium" : ""}>{b}</span>
          </span>
        ))}
        {title && !breadcrumbs.length && <span className="text-slate-900 font-medium">{title}</span>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-96" ref={boxRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15}/>
          <input
            data-testid="global-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search leads, clients, cases, applications, partners…"
            className="w-full h-9 pl-9 pr-3 text-sm bg-slate-100/70 hover:bg-slate-100 border border-transparent focus:border-slate-300 focus:bg-white rounded-md outline-none"
          />
          {open && res && (
            <div className="absolute top-11 left-0 right-0 bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden max-h-[65vh] overflow-y-auto z-50" data-testid="search-results">
              {Object.entries(res).map(([k, arr]) => arr?.length ? (
                <div key={k}>
                  <div className="px-3 py-1.5 text-[10.5px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-100 font-semibold">{humanize(k)}</div>
                  {arr.map((it) => {
                    const path = k === "leads" ? `/leads/${it.lead_uid}` :
                                 k === "clients" ? `/clients/${it.client_uid}` :
                                 k === "cases" ? `/cases/${it.case_uid}` :
                                 k === "applications" ? `/applications` :
                                 k === "partners" ? `/channel-partners` : "#";
                    const uid = it.lead_uid || it.client_uid || it.case_uid || it.application_uid || it.channel_code;
                    return (
                      <button key={uid} onClick={() => go(path)}
                              className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between border-b border-slate-100 last:border-0">
                        <div>
                          <div className="text-sm text-slate-900">{it.name || it.company || it.channel_code || uid}</div>
                          {it.mobile && <div className="text-xs text-slate-500">{it.mobile}{it.email && ` • ${it.email}`}</div>}
                        </div>
                        <div className="text-xs mono text-slate-400">{uid}</div>
                      </button>
                    );
                  })}
                </div>
              ) : null)}
              {!Object.values(res).some(a => a?.length) && (
                <div className="p-6 text-center text-sm text-slate-500">No results for "{q}"</div>
              )}
            </div>
          )}
        </div>
        <button className="w-9 h-9 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300" data-testid="notifications-btn">
          <Bell size={16}/>
        </button>
        {actions}
      </div>
    </div>
  );
}
