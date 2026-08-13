import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { inr, timeAgo } from "@/lib/format";

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState("");
  const nav = useNavigate();

  const load = async () => {
    const params = q ? `?q=${encodeURIComponent(q)}` : "";
    const { data } = await api.get(`/clients${params}`);
    setClients(data);
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4" data-testid="clients-page">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-slate-500">Every borrower — corporate and individual.</p>
        </div>
        <input placeholder="Search PAN, GSTIN, CIN, name…" className="w-80 h-9 px-3 text-sm border border-slate-200 rounded-md" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} data-testid="client-search"/>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full dense-table" data-testid="clients-table">
            <thead><tr><th>UID</th><th>Client</th><th>PAN / CIN</th><th>City</th><th>Industry</th><th>Constitution</th><th>Created</th></tr></thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.client_uid} className="cursor-pointer" onClick={()=>nav(`/clients/${c.client_uid}`)} data-testid={`client-row-${c.client_uid}`}>
                  <td className="mono text-xs">{c.client_uid}</td>
                  <td><div className="font-medium">{c.name}</div><div className="text-xs text-slate-500">{c.company}</div></td>
                  <td className="mono text-xs">{c.pan}<div>{c.cin}</div></td>
                  <td>{c.city}</td>
                  <td>{c.industry}</td>
                  <td>{c.constitution}</td>
                  <td className="text-xs text-slate-500">{timeAgo(c.created_at)}</td>
                </tr>
              ))}
              {clients.length===0 && <tr><td colSpan={7} className="p-8 text-center text-slate-500">No clients.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
