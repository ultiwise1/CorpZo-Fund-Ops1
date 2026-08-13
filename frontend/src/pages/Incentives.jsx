import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize, pillClass } from "@/lib/format";

export default function Incentives() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/incentives").then(r => setRows(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="incentives-page">
      <h1 className="font-display text-2xl font-semibold">Incentives</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>Employee</th><th>Period</th><th className="num-cell">Disbursement</th><th className="num-cell">Collected</th><th className="num-cell">Calculated</th><th className="num-cell">Override</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(x => (
              <tr key={x.incentive_id}>
                <td className="mono text-xs">{x.employee_uid}</td>
                <td className="mono text-xs">{x.period}</td>
                <td className="num-cell">{inr(x.disbursement_amount)}</td>
                <td className="num-cell">{inr(x.revenue_collected)}</td>
                <td className="num-cell font-semibold">{inr(x.calculated_amount)}</td>
                <td className="num-cell">{x.override_amount ? inr(x.override_amount) : "-"}</td>
                <td><span className={`pill ${pillClass(x.status)}`}>{humanize(x.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
