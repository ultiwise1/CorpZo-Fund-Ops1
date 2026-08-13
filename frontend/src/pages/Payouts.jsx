import { useEffect, useState } from "react";
import { api, API_BASE } from "@/lib/api";
import { inr, humanize, pillClass, fmtDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download, Play, CheckCircle2 } from "lucide-react";

export default function Payouts() {
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);
  const load = () => api.get("/payouts").then(r => setRows(r.data)).catch(()=>toast.error("Finance access only"));
  useEffect(() => { load(); }, []);
  const runNow = async () => {
    setRunning(true);
    try { const { data } = await api.post("/payouts/run-now"); toast.success(`Batch ${data.batch_id} ready — ₹${(data.total_amount||0).toLocaleString('en-IN')}`); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Run failed"); }
    finally { setRunning(false); }
  };
  const markPaid = async (b) => {
    if (!window.confirm(`Mark ${b.batch_id} as PAID? This closes all commissions and incentives in the batch.`)) return;
    try { await api.post(`/payouts/${b.batch_id}/mark-paid`); toast.success("Batch marked paid"); load(); }
    catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };
  const total = rows.reduce((s,r)=>s+(r.total_amount||0),0);
  const paid = rows.filter(r=>r.status==="paid").reduce((s,r)=>s+(r.total_amount||0),0);

  return (
    <div className="space-y-4" data-testid="payouts-page">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Monthly Payouts</h1>
          <p className="text-sm text-slate-500">Package every approved CP commission and employee incentive into a single Finance-ready batch (auto every month · manual on demand).</p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700" disabled={running} onClick={runNow} data-testid="run-payout-btn">
          <Play size={14} className="mr-1"/>{running ? "Running…" : "Run payout batch now"}
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Batches" v={rows.length}/>
        <Stat label="Total (all-time)" v={inr(total)}/>
        <Stat label="Paid" v={inr(paid)}/>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>Batch</th><th>Period</th><th className="num-cell">CP items</th><th className="num-cell">Incentives</th><th className="num-cell">CP Total</th><th className="num-cell">Incentive Total</th><th className="num-cell">Grand Total</th><th>Status</th><th>Created</th><th></th></tr></thead>
          <tbody>
            {rows.map(b => (
              <tr key={b.batch_id}>
                <td className="mono text-xs">{b.batch_id}</td>
                <td className="mono text-xs">{b.period}</td>
                <td className="num-cell">{b.cp_count}</td>
                <td className="num-cell">{b.incentive_count}</td>
                <td className="num-cell">{inr(b.cp_total)}</td>
                <td className="num-cell">{inr(b.incentive_total)}</td>
                <td className="num-cell font-semibold">{inr(b.total_amount)}</td>
                <td><span className={`pill ${pillClass(b.status)}`}>{humanize(b.status)}</span></td>
                <td className="text-xs">{fmtDateTime(b.created_at)}</td>
                <td className="flex gap-2">
                  <a className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-orange-600" href={`${API_BASE}/payouts/${b.batch_id}/csv`} target="_blank" rel="noreferrer" data-testid={`download-csv-${b.batch_id}`}><Download size={13}/>CSV</a>
                  {b.status !== "paid" && <Button size="sm" variant="outline" onClick={()=>markPaid(b)} data-testid={`markpaid-${b.batch_id}`}><CheckCircle2 size={13} className="mr-1"/>Mark paid</Button>}
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={10} className="p-8 text-center text-slate-500">No payout batches yet. Click <b>Run payout batch now</b> above to package the current cycle.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, v }) {
  return <div className="bg-white border border-slate-200 rounded-lg p-4">
    <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
    <div className="text-xl font-display font-semibold mt-1 num">{v}</div>
  </div>;
}
