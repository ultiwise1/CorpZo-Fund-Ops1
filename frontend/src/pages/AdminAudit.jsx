import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { humanize, fmtDateTime } from "@/lib/format";

export default function AdminAudit() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/audit-logs").then(r => setRows(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="admin-audit-page">
      <h1 className="font-display text-2xl font-semibold">Audit Log</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="max-h-[75vh] overflow-auto">
          <table className="w-full dense-table">
            <thead><tr><th>Time</th><th>Actor</th><th>Entity</th><th>Action</th></tr></thead>
            <tbody>
              {rows.map(a => (
                <tr key={a.audit_id}>
                  <td className="text-xs mono">{fmtDateTime(a.at)}</td>
                  <td>{a.actor_name}</td>
                  <td><span className="pill pill-slate">{humanize(a.entity_type)}</span> <span className="mono text-xs ml-1">{a.entity_id}</span></td>
                  <td className="text-xs">{humanize(a.action)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
