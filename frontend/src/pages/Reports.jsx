import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Reports() {
  const [daily, setDaily] = useState([]);
  const [pipe, setPipe] = useState([]);
  const [opps, setOpps] = useState([]);
  useEffect(() => {
    api.get("/reports/daily").then(r => setDaily(r.data));
    api.get("/reports/pipeline").then(r => setPipe(r.data));
    api.get("/opportunities?status=open").then(r => setOpps(r.data));
  }, []);

  const openReport = (fmt) => window.open(`${api.defaults.baseURL}/reports/weekly.${fmt}`, "_blank");

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F3D2E]">Reports</h1>
          <p className="text-sm text-[#0F3D2E]/60 mt-1">Sales & pipeline snapshots, exportable in one click.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#0F3D2E]/15 text-[#0F3D2E] hover:bg-[#F1F7F3]" onClick={()=>openReport("xlsx")} data-testid="export-weekly-xlsx-btn">
            <FileSpreadsheet size={14} className="mr-1.5 text-[#0F8B6B]"/>Weekly Excel
          </Button>
          <Button className="bg-[#1F5B4A] hover:bg-[#0F3D2E] text-white" onClick={()=>openReport("pdf")} data-testid="export-weekly-pdf-btn">
            <FileText size={14} className="mr-1.5"/>Weekly PDF
          </Button>
        </div>
      </div>

      {/* Advisory opportunities banner */}
      <div className="bg-gradient-to-r from-[#FFF3D6] via-white to-[#E0F5EC] border border-[#FFD84D]/50 rounded-xl p-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10.5px] uppercase tracking-widest text-[#8A6600] font-bold">Open advisory pipeline</div>
          <div className="font-display text-xl font-bold text-[#0F3D2E]">{opps.length} opportunities · {inr(opps.reduce((s,r)=>s+(r.estimated_fee||0),0))}</div>
          <div className="text-xs text-[#0F3D2E]/60">Missing docs on live cases converted into billable CorpZo services.</div>
        </div>
        <Link to="/opportunities">
          <Button className="bg-[#0F3D2E] hover:bg-[#1F5B4A] text-white" data-testid="report-open-opportunities-btn">Open board<ArrowUpRight size={14} className="ml-1"/></Button>
        </Link>
      </div>

      <div className="bg-white border border-[#0F3D2E]/10 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#0F3D2E]/10 font-display font-bold text-[#0F3D2E]">Daily Sales Report</div>
        <table className="w-full dense-table">
          <thead><tr><th>Employee</th><th>Role</th><th className="num-cell">Leads today</th><th className="num-cell">Cases today</th><th className="num-cell">Activities</th></tr></thead>
          <tbody>
            {daily.map(d => (
              <tr key={d.employee_uid}>
                <td><div className="font-medium">{d.name}</div><div className="text-xs mono text-[#0F3D2E]/50">{d.employee_uid}</div></td>
                <td>{humanize(d.role)}</td>
                <td className="num-cell">{d.leads_assigned}</td>
                <td className="num-cell">{d.cases_created}</td>
                <td className="num-cell">{d.activities}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-[#0F3D2E]/10 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#0F3D2E]/10 font-display font-bold text-[#0F3D2E]">Pipeline by Stage</div>
        <table className="w-full dense-table">
          <thead><tr><th>Stage</th><th className="num-cell">Count</th><th className="num-cell">Requested</th><th className="num-cell">Sanctioned</th><th className="num-cell">Disbursed</th></tr></thead>
          <tbody>
            {pipe.map(p => (
              <tr key={p.stage}>
                <td>{humanize(p.stage)}</td>
                <td className="num-cell">{p.count}</td>
                <td className="num-cell">{inr(p.requested)}</td>
                <td className="num-cell">{inr(p.sanctioned)}</td>
                <td className="num-cell">{inr(p.disbursed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
