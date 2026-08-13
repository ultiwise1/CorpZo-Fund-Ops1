import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { humanize } from "@/lib/format";

export default function ChannelPartners() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/channel-partners").then(r => setRows(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="partners-page">
      <h1 className="font-display text-2xl font-semibold">Channel Partners</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>Code</th><th>Name</th><th>Entity</th><th>PAN</th><th>City</th><th>Products</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.partner_uid}>
                <td className="mono text-xs">{p.channel_code}</td>
                <td><div className="font-medium">{p.name}</div><div className="text-xs text-slate-500">{p.mobile}</div></td>
                <td className="text-xs">{p.entity_name}</td>
                <td className="mono text-xs">{p.pan}</td>
                <td>{p.city}</td>
                <td className="text-xs">{p.products?.map(humanize).join(", ")}</td>
                <td><span className="pill pill-green">{humanize(p.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
