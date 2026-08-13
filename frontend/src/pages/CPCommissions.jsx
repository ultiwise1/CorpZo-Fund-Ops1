import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize, pillClass } from "@/lib/format";

export default function CPCommissions() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/cp-commissions").then(r => setRows(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="cp-commissions-page">
      <h1 className="font-display text-2xl font-semibold">Channel Partner Commissions</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>Partner</th><th>Case</th><th className="num-cell">Disbursement</th><th className="num-cell">Commission</th><th className="num-cell">TDS</th><th className="num-cell">Payable</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.commission_id}>
                <td className="mono text-xs">{c.partner_uid}</td>
                <td className="mono text-xs">{c.case_uid}</td>
                <td className="num-cell">{inr(c.disbursement_amount)}</td>
                <td className="num-cell">{inr(c.commission_amount)}</td>
                <td className="num-cell">{inr(c.tds_amount)}</td>
                <td className="num-cell font-semibold">{inr(c.payable_amount)}</td>
                <td><span className={`pill ${pillClass(c.status)}`}>{humanize(c.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
