import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { humanize, pillClass, fmtDate } from "@/lib/format";

export default function Queries() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    api.get("/cases").then(async r => {
      const all = [];
      for (const c of r.data) {
        const { data } = await api.get(`/lender-queries?case_uid=${c.case_uid}`);
        all.push(...(data || []));
      }
      setRows(all);
    });
  }, []);
  return (
    <div className="space-y-4" data-testid="queries-page">
      <h1 className="font-display text-2xl font-semibold">Lender Queries</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>Case</th><th>Application</th><th>Query</th><th>Raised by</th><th>Due</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(q => (
              <tr key={q.query_id}>
                <td className="mono text-xs">{q.case_uid}</td>
                <td className="mono text-xs">{q.application_uid}</td>
                <td className="text-sm">{q.query_text}</td>
                <td>{humanize(q.raised_by)}</td>
                <td className="text-xs">{fmtDate(q.due_date)}</td>
                <td><span className={`pill ${pillClass(q.status)}`}>{humanize(q.status)}</span></td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No open queries.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
