import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, fmtDateTime } from "@/lib/format";

export default function Payments() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/payments").then(r => setRows(r.data)); }, []);
  const total = rows.reduce((s,x)=>s+(x.amount||0),0);
  return (
    <div className="space-y-4" data-testid="payments-page">
      <div className="flex justify-between items-end">
        <h1 className="font-display text-2xl font-semibold">Payments received</h1>
        <div className="text-sm text-slate-500">Total collected: <span className="font-semibold num text-slate-900">{inr(total)}</span></div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>UID</th><th>Invoice</th><th>Client</th><th className="num-cell">Amount</th><th>Mode</th><th>Reference</th><th>Received on</th></tr></thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.payment_uid}>
                <td className="mono text-xs">{p.payment_uid}</td>
                <td className="mono text-xs">{p.invoice_uid}</td>
                <td className="mono text-xs">{p.client_uid}</td>
                <td className="num-cell font-semibold">{inr(p.amount)}</td>
                <td className="uppercase text-xs">{p.mode}</td>
                <td className="mono text-xs">{p.reference}</td>
                <td className="text-xs">{fmtDateTime(p.received_on)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
