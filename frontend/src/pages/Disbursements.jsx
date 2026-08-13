import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, fmtDate } from "@/lib/format";
import { useNavigate } from "react-router-dom";

export default function Disbursements() {
  const [rows, setRows] = useState([]);
  const nav = useNavigate();
  useEffect(() => { api.get("/disbursements").then(r => setRows(r.data)); }, []);
  const total = rows.reduce((s,x)=>s+(x.amount||0),0);
  return (
    <div className="space-y-4" data-testid="disbursements-page">
      <div className="flex justify-between items-end">
        <h1 className="font-display text-2xl font-semibold">Disbursements</h1>
        <div className="text-sm text-slate-500">Total disbursed: <span className="font-semibold num text-slate-900">{inr(total)}</span></div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>UID</th><th>Case</th><th>Lender</th><th className="num-cell">Amount</th><th>Tranche</th><th>Reference</th><th>Date</th></tr></thead>
          <tbody>
            {rows.map(d => (
              <tr key={d.disbursement_uid} onClick={()=>nav(`/cases/${d.case_uid}`)} className="cursor-pointer">
                <td className="mono text-xs">{d.disbursement_uid}</td>
                <td className="mono text-xs">{d.case_uid}</td>
                <td>{d.lender_id?.replace("lender_","").toUpperCase()}</td>
                <td className="num-cell font-semibold">{inr(d.amount)}</td>
                <td className="num-cell">#{d.tranche_no}</td>
                <td className="mono text-xs">{d.reference}</td>
                <td className="text-xs">{fmtDate(d.disbursement_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
