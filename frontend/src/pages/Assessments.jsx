import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Assessments() {
  const [cases, setCases] = useState([]);
  useEffect(() => { api.get("/cases").then(r => setCases(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="assessments-page">
      <h1 className="font-display text-2xl font-semibold">Credit Assessments (CAM-Lite)</h1>
      <p className="text-sm text-slate-500">Prepare and view case-level credit snapshots. Full CAM opens inside each case.</p>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>Case</th><th>Client</th><th>Product</th><th>Stage</th><th>Docs</th><th></th></tr></thead>
          <tbody>
            {cases.map(c => (
              <tr key={c.case_uid}>
                <td className="mono text-xs">{c.case_uid}</td>
                <td className="mono text-xs">{c.client_uid}</td>
                <td>{c.product}</td>
                <td>{c.stage}</td>
                <td className="num-cell">{c.documentation_pct}%</td>
                <td><a className="text-orange-600 text-xs hover:underline" href={`/cases/${c.case_uid}`}>Open case →</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
