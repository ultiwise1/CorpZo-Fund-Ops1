import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { humanize, pillClass, fmtDateTime } from "@/lib/format";

export default function Documents() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/documents").then(r => setRows(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="documents-page">
      <h1 className="font-display text-2xl font-semibold">Documents</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>File</th><th>Client</th><th>Case</th><th>Category</th><th>Type</th><th>Ver</th><th>Status</th><th>Uploaded</th></tr></thead>
          <tbody>
            {rows.map(d => (
              <tr key={d.document_id}>
                <td>{d.original_filename}</td>
                <td className="mono text-xs">{d.client_uid}</td>
                <td className="mono text-xs">{d.case_uid}</td>
                <td>{d.category}</td>
                <td>{d.doc_type}</td>
                <td className="num-cell">v{d.version}</td>
                <td><span className={`pill ${pillClass(d.status)}`}>{humanize(d.status)}</span></td>
                <td className="text-xs">{fmtDateTime(d.uploaded_at)}</td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={8} className="p-8 text-center text-slate-500">No documents. Upload from a Case → Documents tab.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
