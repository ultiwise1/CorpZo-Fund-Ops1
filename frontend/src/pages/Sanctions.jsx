import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, pillClass, humanize, fmtDate } from "@/lib/format";
import { useNavigate } from "react-router-dom";

export default function Sanctions() {
  const [rows, setRows] = useState([]);
  const nav = useNavigate();
  useEffect(() => { api.get("/sanctions").then(r => setRows(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="sanctions-page">
      <h1 className="font-display text-2xl font-semibold">Sanctions</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>UID</th><th>Case</th><th>Lender</th><th className="num-cell">Amount</th><th>ROI</th><th>Tenure</th><th>EMI</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {rows.map(s => (
              <tr key={s.sanction_uid} onClick={()=>nav(`/cases/${s.case_uid}`)} className="cursor-pointer">
                <td className="mono text-xs">{s.sanction_uid}</td>
                <td className="mono text-xs">{s.case_uid}</td>
                <td>{s.lender_id?.replace("lender_","").toUpperCase()}</td>
                <td className="num-cell font-semibold">{inr(s.sanction_amount)}</td>
                <td className="num-cell">{s.roi}%</td>
                <td className="num-cell">{s.tenure_months}m</td>
                <td className="num-cell">{inr(s.emi)}</td>
                <td><span className={`pill ${pillClass(s.status)}`}>{humanize(s.status)}</span></td>
                <td className="text-xs">{fmtDate(s.sanction_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
