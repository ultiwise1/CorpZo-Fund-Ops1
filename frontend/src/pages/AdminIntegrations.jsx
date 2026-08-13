import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { humanize } from "@/lib/format";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

const statusIcon = (s) => {
  if (s === "connected") return <CheckCircle2 size={16} className="text-emerald-600"/>;
  if (s === "sandbox") return <AlertCircle size={16} className="text-amber-500"/>;
  return <Circle size={16} className="text-slate-300"/>;
};

export default function AdminIntegrations() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/integrations").then(r => setRows(r.data)); }, []);
  const grouped = rows.reduce((a,i)=>{ (a[i.category] ||= []).push(i); return a; }, {});

  return (
    <div className="space-y-4" data-testid="admin-integrations-page">
      <h1 className="font-display text-2xl font-semibold">Integrations</h1>
      <p className="text-sm text-slate-500 max-w-2xl">Bureau, eSign, payments and messaging are wired via sandbox adapters. Connect production credentials from Settings without changing workflows.</p>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">{humanize(cat)}</div>
          {items.map(i => (
            <div key={i.key} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-3">
                {statusIcon(i.status)}
                <div>
                  <div className="font-medium text-sm">{i.name}</div>
                  <div className="text-xs text-slate-500">{humanize(i.status)}</div>
                </div>
              </div>
              <button className="text-xs text-orange-600 font-medium hover:underline">Configure →</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
