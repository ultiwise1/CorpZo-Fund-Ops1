import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize } from "@/lib/format";

export default function Lenders() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/lenders").then(r => setRows(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="lenders-page">
      <h1 className="font-display text-2xl font-semibold">Lender Master</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="max-h-[75vh] overflow-auto">
          <table className="w-full dense-table" data-testid="lenders-table">
            <thead><tr><th>Lender</th><th>Type</th><th>Products</th><th className="num-cell">Min Ticket</th><th className="num-cell">Max Ticket</th><th>ROI</th><th>Score min</th><th>TAT</th></tr></thead>
            <tbody>
              {rows.map(l => (
                <tr key={l.lender_id}>
                  <td><div className="font-medium">{l.name}</div><div className="text-xs text-slate-500">{l.rm_name}</div></td>
                  <td>{humanize(l.lender_type)}</td>
                  <td className="text-xs">{l.products?.slice(0,3).map(humanize).join(", ")}{l.products?.length>3 && "…"}</td>
                  <td className="num-cell">{inr(l.ticket_size_min)}</td>
                  <td className="num-cell">{inr(l.ticket_size_max)}</td>
                  <td className="num-cell">{l.roi_min}-{l.roi_max}%</td>
                  <td className="num-cell">{l.min_bureau_score}</td>
                  <td className="num-cell">{l.tat_days}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
