import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { humanize, fmtDateTime } from "@/lib/format";
import { ShieldCheck } from "lucide-react";

export default function Bureau() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    // pull all bureau checks by aggregating from cases
    api.get("/cases").then(async r => {
      const all = [];
      for (const c of r.data) {
        const { data } = await api.get(`/cases/${c.case_uid}`);
        all.push(...(data.bureau || []).map(b => ({ ...b, case_uid: c.case_uid })));
      }
      setRows(all);
    });
  }, []);
  return (
    <div className="space-y-4" data-testid="bureau-page">
      <div className="flex justify-between items-center">
        <h1 className="font-display text-2xl font-semibold">Bureau Checks</h1>
        <span className="pill pill-amber">Sandbox integrations active</span>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>Case</th><th>Provider</th><th className="num-cell">Score</th><th className="num-cell">Accounts</th><th className="num-cell">Enquiries</th><th>DPD</th><th>Reference</th><th>Pulled</th></tr></thead>
          <tbody>
            {rows.map(b => (
              <tr key={b.bureau_id}>
                <td className="mono text-xs">{b.case_uid}</td>
                <td className="uppercase">{b.provider}</td>
                <td className="num-cell font-semibold">{b.score}</td>
                <td className="num-cell">{b.accounts}</td>
                <td className="num-cell">{b.enquiries}</td>
                <td className="num-cell">{b.dpd_current}</td>
                <td className="mono text-xs">{b.reference_number}</td>
                <td className="text-xs">{fmtDateTime(b.pulled_at)}</td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={8} className="p-8 text-center text-slate-500">Pull a bureau report from any Case → Bureau tab (Sandbox).</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
