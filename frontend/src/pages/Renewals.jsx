import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize, pillClass, fmtDate } from "@/lib/format";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const bucketColors = { "30": "pill-red", "60": "pill-amber", "90": "pill-blue", "180": "pill-slate" };

export default function Renewals() {
  const [rows, setRows] = useState([]);
  const nav = useNavigate();
  useEffect(() => { api.get("/renewals").then(r => setRows(r.data)); }, []);
  const grouped = { "30": [], "60": [], "90": [], "180": [] };
  rows.forEach(r => grouped[r.bucket]?.push(r));

  return (
    <div className="space-y-4" data-testid="renewals-page">
      <div>
        <h1 className="font-display text-2xl font-semibold">Renewal Radar</h1>
        <p className="text-sm text-slate-500">Every disbursed borrower with a loan maturing in the next 6 months — surface refinance and top-up opportunity before revenue leaks.</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {["30","60","90","180"].map(b => (
          <div key={b} className={`bg-white border border-slate-200 rounded-lg p-4 ${b==="30"?"border-red-200":""}`} data-testid={`bucket-${b}`}>
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">≤ {b} days</div>
              {b === "30" && <AlertTriangle size={16} className="text-red-500"/>}
            </div>
            <div className="text-2xl font-display font-semibold mt-1 num">{grouped[b]?.length || 0}</div>
            <div className="text-xs text-slate-500 num">{inr(grouped[b]?.reduce((s,r)=>s+(r.disbursed_amount||0),0) || 0)}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="max-h-[65vh] overflow-auto">
          <table className="w-full dense-table">
            <thead><tr><th>Bucket</th><th>Case</th><th>Client</th><th>Product</th><th className="num-cell">Disbursed</th><th>ROI</th><th>Maturity</th><th className="num-cell">Days</th><th>RM</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.case_uid} onClick={()=>nav(`/cases/${r.case_uid}`)} className="cursor-pointer">
                  <td><span className={`pill ${bucketColors[r.bucket]}`}>≤ {r.bucket}d</span></td>
                  <td className="mono text-xs">{r.case_uid}</td>
                  <td><div className="font-medium">{r.client_name}</div><div className="text-xs text-slate-500">{r.company}</div></td>
                  <td>{humanize(r.product)}</td>
                  <td className="num-cell font-semibold">{inr(r.disbursed_amount)}</td>
                  <td className="num-cell">{r.roi}%</td>
                  <td className="text-xs">{fmtDate(r.maturity_date)}</td>
                  <td className="num-cell">{r.days_to_maturity}</td>
                  <td className="mono text-xs">{r.rm}</td>
                </tr>
              ))}
              {rows.length===0 && <tr><td colSpan={9} className="p-8 text-center text-slate-500">No renewals in the next 6 months. Disburse a case to see it here.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
