import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize, pillClass, fmtDate } from "@/lib/format";
import { useNavigate } from "react-router-dom";

export default function Applications() {
  const [rows, setRows] = useState([]);
  const nav = useNavigate();
  useEffect(() => { api.get("/applications").then(r => setRows(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="applications-page">
      <h1 className="font-display text-2xl font-semibold">Lender Applications</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="max-h-[75vh] overflow-auto">
          <table className="w-full dense-table">
            <thead><tr><th>UID</th><th>Case</th><th>Lender</th><th className="num-cell">Amount</th><th className="num-cell">Sanctioned</th><th>Status</th><th>Submitted</th></tr></thead>
            <tbody>
              {rows.map(a => (
                <tr key={a.application_uid} onClick={()=>nav(`/cases/${a.case_uid}`)} className="cursor-pointer">
                  <td className="mono text-xs">{a.application_uid}</td>
                  <td className="mono text-xs">{a.case_uid}</td>
                  <td>{a.lender_id?.replace("lender_","").toUpperCase()}</td>
                  <td className="num-cell">{inr(a.amount_requested)}</td>
                  <td className="num-cell">{inr(a.sanction_amount)}</td>
                  <td><span className={`pill ${pillClass(a.status)}`}>{humanize(a.status)}</span></td>
                  <td className="text-xs">{fmtDate(a.submission_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
