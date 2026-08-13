import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize, fmtDate } from "@/lib/format";

export default function Employees() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/employees").then(r => setRows(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="employees-page">
      <h1 className="font-display text-2xl font-semibold">Employees & Targets</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>UID</th><th>Name</th><th>Role</th><th>Joined</th><th>Multiplier</th><th className="num-cell">CTC/mo</th><th className="num-cell">Revenue Tgt</th><th className="num-cell">Disb Tgt</th></tr></thead>
          <tbody>
            {rows.map(e => (
              <tr key={e.employee_uid}>
                <td className="mono text-xs">{e.employee_uid}</td>
                <td><div className="font-medium">{e.name}</div><div className="text-xs text-slate-500">{e.email}</div></td>
                <td>{humanize(e.role)}</td>
                <td className="text-xs">{fmtDate(e.joining_date)}</td>
                <td className="num-cell"><span className={`pill ${e.target_multiplier<3?"pill-amber":"pill-green"}`}>{e.target_multiplier}x</span></td>
                <td className="num-cell">{inr(e.ctc_monthly)}</td>
                <td className="num-cell">{inr(e.revenue_target)}</td>
                <td className="num-cell">{inr(e.disbursement_target)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
