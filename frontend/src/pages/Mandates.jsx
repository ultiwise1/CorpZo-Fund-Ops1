import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize, pillClass, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Mandates() {
  const [rows, setRows] = useState([]);
  const load = () => api.get("/mandates").then(r => setRows(r.data));
  useEffect(() => { load(); }, []);
  const advance = async (m) => {
    const map = {draft:"internal_approval", internal_approval:"sent", sent:"signed", signed:"verified", verified:"active"};
    const next = map[m.status] || m.status;
    await api.patch(`/mandates/${m.mandate_uid}`, { status: next });
    toast.success(`Mandate → ${humanize(next)}`); load();
  };
  return (
    <div className="space-y-4" data-testid="mandates-page">
      <h1 className="font-display text-2xl font-semibold">Mandates</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>UID</th><th>Client</th><th>Case</th><th>Scope</th><th className="num-cell">Upfront</th><th>Success%</th><th>Status</th><th>Signed</th><th></th></tr></thead>
          <tbody>
            {rows.map(m => (
              <tr key={m.mandate_uid}>
                <td className="mono text-xs">{m.mandate_uid}</td>
                <td className="mono text-xs">{m.client_uid}</td>
                <td className="mono text-xs">{m.case_uid}</td>
                <td className="text-sm">{m.scope}</td>
                <td className="num-cell">{inr(m.upfront_fee)}</td>
                <td className="num-cell">{m.success_fee_pct}%</td>
                <td><span className={`pill ${pillClass(m.status)}`}>{humanize(m.status)}</span></td>
                <td className="text-xs">{fmtDate(m.signed_at)}</td>
                <td>{m.status !== "active" && <Button size="sm" variant="outline" onClick={()=>advance(m)} data-testid={`advance-${m.mandate_uid}`}>Advance</Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
