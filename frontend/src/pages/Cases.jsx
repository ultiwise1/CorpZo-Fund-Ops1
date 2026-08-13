import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { inr, humanize, pillClass, timeAgo, STAGES } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [stage, setStage] = useState("");
  const nav = useNavigate();
  const load = async () => {
    const p = new URLSearchParams(); if (stage) p.set("stage", stage);
    const { data } = await api.get(`/cases?${p.toString()}`); setCases(data);
  };
  useEffect(() => { load(); }, [stage]);

  return (
    <div className="space-y-4" data-testid="cases-page">
      <div className="flex justify-between items-end">
        <div><h1 className="font-display text-2xl font-semibold">Cases</h1><p className="text-sm text-slate-500">Every debt case in the funnel.</p></div>
        <div className="w-56">
          <Select value={stage} onValueChange={v=>setStage(v==='all'?'':v)}>
            <SelectTrigger><SelectValue placeholder="All stages"/></SelectTrigger>
            <SelectContent><SelectItem value="all">All stages</SelectItem>{STAGES.map(s => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full dense-table" data-testid="cases-table">
            <thead><tr><th>UID</th><th>Client</th><th>Product</th><th className="num-cell">Requested</th><th className="num-cell">Sanctioned</th><th className="num-cell">Disbursed</th><th>Stage</th><th>Docs</th><th>Created</th></tr></thead>
            <tbody>
              {cases.map(c => (
                <tr key={c.case_uid} onClick={()=>nav(`/cases/${c.case_uid}`)} className="cursor-pointer" data-testid={`case-row-${c.case_uid}`}>
                  <td className="mono text-xs">{c.case_uid}</td>
                  <td className="mono text-xs">{c.client_uid}</td>
                  <td>{humanize(c.product)}</td>
                  <td className="num-cell">{inr(c.requirement)}</td>
                  <td className="num-cell">{inr(c.sanctioned_amount)}</td>
                  <td className="num-cell">{inr(c.disbursed_amount)}</td>
                  <td><span className={`pill ${pillClass(c.stage)}`}>{humanize(c.stage)}</span></td>
                  <td className="num-cell">{c.documentation_pct}%</td>
                  <td className="text-xs text-slate-500">{timeAgo(c.created_at)}</td>
                </tr>
              ))}
              {cases.length===0 && <tr><td colSpan={9} className="p-8 text-center text-slate-500">No cases.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
