import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize } from "@/lib/format";

export default function Reports() {
  const [daily, setDaily] = useState([]);
  const [pipe, setPipe] = useState([]);
  useEffect(() => {
    api.get("/reports/daily").then(r => setDaily(r.data));
    api.get("/reports/pipeline").then(r => setPipe(r.data));
  }, []);
  return (
    <div className="space-y-6" data-testid="reports-page">
      <h1 className="font-display text-2xl font-semibold">Reports</h1>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-display font-semibold">Daily Sales Report</div>
        <table className="w-full dense-table">
          <thead><tr><th>Employee</th><th>Role</th><th className="num-cell">Leads today</th><th className="num-cell">Cases today</th><th className="num-cell">Activities</th></tr></thead>
          <tbody>
            {daily.map(d => (
              <tr key={d.employee_uid}>
                <td><div className="font-medium">{d.name}</div><div className="text-xs mono text-slate-500">{d.employee_uid}</div></td>
                <td>{humanize(d.role)}</td>
                <td className="num-cell">{d.leads_assigned}</td>
                <td className="num-cell">{d.cases_created}</td>
                <td className="num-cell">{d.activities}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-display font-semibold">Pipeline by Stage</div>
        <table className="w-full dense-table">
          <thead><tr><th>Stage</th><th className="num-cell">Count</th><th className="num-cell">Requested</th><th className="num-cell">Sanctioned</th><th className="num-cell">Disbursed</th></tr></thead>
          <tbody>
            {pipe.map(p => (
              <tr key={p.stage}>
                <td>{humanize(p.stage)}</td>
                <td className="num-cell">{p.count}</td>
                <td className="num-cell">{inr(p.requested)}</td>
                <td className="num-cell">{inr(p.sanctioned)}</td>
                <td className="num-cell">{inr(p.disbursed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
