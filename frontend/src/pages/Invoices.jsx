import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize, pillClass, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Invoices() {
  const [rows, setRows] = useState([]);
  const load = () => api.get("/invoices").then(r => setRows(r.data));
  useEffect(() => { load(); }, []);
  const collect = async (inv) => {
    const target = inv.total_amount ?? inv.amount;
    const outstanding = Math.max(0, target - (inv.paid_amount ?? 0));
    await api.post("/payments", { invoice_uid: inv.invoice_uid, client_uid: inv.client_uid, amount: outstanding || target, mode: "neft", reference: `TXN${Date.now()}` });
    toast.success("Payment recorded"); load();
  };
  return (
    <div className="space-y-4" data-testid="invoices-page">
      <h1 className="font-display text-2xl font-semibold">Invoices</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>UID</th><th>Client</th><th>Case</th><th className="num-cell">Amount</th><th className="num-cell">Total (incl. GST)</th><th>GST</th><th>TDS</th><th>Status</th><th>Due</th><th></th></tr></thead>
          <tbody>
            {rows.map(i => (
              <tr key={i.invoice_uid}>
                <td className="mono text-xs">{i.invoice_uid}</td>
                <td className="mono text-xs">{i.client_uid}</td>
                <td className="mono text-xs">{i.case_uid}</td>
                <td className="num-cell font-semibold">{inr(i.amount)}</td>
                <td className="num-cell num">{inr(i.total_amount ?? i.amount)}</td>
                <td className="num-cell">{i.gst_pct}%</td>
                <td className="num-cell">{i.tds_pct}%</td>
                <td><span className={`pill ${pillClass(i.status)}`}>{humanize(i.status)}</span></td>
                <td className="text-xs">{fmtDate(i.due_date)}</td>
                <td>{i.status !== "paid" && <Button size="sm" variant="outline" onClick={()=>collect(i)} data-testid={`mark-paid-${i.invoice_uid}`}>Mark Paid</Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
