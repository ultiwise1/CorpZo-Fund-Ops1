import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize, pillClass, fmtDate } from "@/lib/format";
import PartnerSidebar from "@/components/layout/PartnerSidebar";
import TopBar from "@/components/layout/TopBar";
import { Routes, Route, Navigate } from "react-router-dom";

function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [cases, setCases] = useState([]);
  const [comm, setComm] = useState([]);
  useEffect(() => {
    api.get("/leads").then(r => setLeads(r.data));
    api.get("/cases").then(r => setCases(r.data));
    api.get("/cp-commissions").then(r => setComm(r.data));
  }, []);
  const totalDisb = cases.filter(c => c.disbursed_amount > 0).reduce((s,c)=>s+c.disbursed_amount,0);
  const totalPayable = comm.reduce((s,c)=>s+(c.payable_amount||0),0);
  const paid = comm.filter(c=>c.status==="paid").reduce((s,c)=>s+(c.payable_amount||0),0);
  return (
    <div className="space-y-4" data-testid="partner-dashboard">
      <h1 className="font-display text-2xl font-semibold">Welcome</h1>
      <p className="text-sm text-slate-500">Snapshot of your referrals and commissions with CorpZo.</p>
      <div className="grid grid-cols-4 gap-3">
        <Stat label="My Referrals" v={leads.length}/>
        <Stat label="Active Cases" v={cases.length}/>
        <Stat label="Total Disbursed" v={inr(totalDisb)}/>
        <Stat label="Commission (payable)" v={inr(totalPayable - paid)}/>
      </div>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-display font-semibold">Recent cases</div>
        <table className="w-full dense-table">
          <thead><tr><th>Case</th><th>Product</th><th className="num-cell">Requested</th><th className="num-cell">Sanctioned</th><th className="num-cell">Disbursed</th><th>Stage</th></tr></thead>
          <tbody>
            {cases.slice(0,10).map(c => (
              <tr key={c.case_uid}>
                <td className="mono text-xs">{c.case_uid}</td>
                <td>{humanize(c.product)}</td>
                <td className="num-cell">{inr(c.requirement)}</td>
                <td className="num-cell">{inr(c.sanctioned_amount)}</td>
                <td className="num-cell">{inr(c.disbursed_amount)}</td>
                <td><span className={`pill ${pillClass(c.stage)}`}>{humanize(c.stage)}</span></td>
              </tr>
            ))}
            {cases.length===0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No referrals yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PartnerCases() {
  const [cases, setCases] = useState([]);
  useEffect(() => { api.get("/cases").then(r => setCases(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="partner-cases">
      <h1 className="font-display text-2xl font-semibold">My Referrals</h1>
      <p className="text-sm text-slate-500">You see status only — internal credit notes are not shared per CorpZo policy.</p>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>Case</th><th>Client</th><th>Product</th><th className="num-cell">Requested</th><th className="num-cell">Sanctioned</th><th className="num-cell">Disbursed</th><th>Stage</th></tr></thead>
          <tbody>
            {cases.map(c => (
              <tr key={c.case_uid}>
                <td className="mono text-xs">{c.case_uid}</td>
                <td className="mono text-xs">{c.client_uid}</td>
                <td>{humanize(c.product)}</td>
                <td className="num-cell">{inr(c.requirement)}</td>
                <td className="num-cell">{inr(c.sanctioned_amount)}</td>
                <td className="num-cell">{inr(c.disbursed_amount)}</td>
                <td><span className={`pill ${pillClass(c.stage)}`}>{humanize(c.stage)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PartnerCommissions() {
  const [rows, setRows] = useState([]);
  useEffect(() => { api.get("/cp-commissions").then(r => setRows(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="partner-commissions">
      <h1 className="font-display text-2xl font-semibold">My Commissions</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>Case</th><th className="num-cell">Disbursement</th><th className="num-cell">Commission</th><th className="num-cell">TDS</th><th className="num-cell">Payable</th><th>Status</th><th>Paid on</th></tr></thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.commission_id}>
                <td className="mono text-xs">{c.case_uid}</td>
                <td className="num-cell">{inr(c.disbursement_amount)}</td>
                <td className="num-cell">{inr(c.commission_amount)}</td>
                <td className="num-cell">{inr(c.tds_amount)}</td>
                <td className="num-cell font-semibold">{inr(c.payable_amount)}</td>
                <td><span className={`pill ${pillClass(c.status)}`}>{humanize(c.status)}</span></td>
                <td className="text-xs">{fmtDate(c.paid_on)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, v }) {
  return <div className="bg-white border border-slate-200 rounded-lg p-4"><div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div><div className="text-xl font-display font-semibold mt-1 num">{v}</div></div>;
}

export default function PartnerPortal({ user }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <PartnerSidebar user={user}/>
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar breadcrumbs={["Partner", "Portal"]}/>
        <main className="flex-1 p-6" data-testid="partner-page">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace/>}/>
            <Route path="dashboard" element={<Dashboard/>}/>
            <Route path="cases" element={<PartnerCases/>}/>
            <Route path="commissions" element={<PartnerCommissions/>}/>
            <Route path="*" element={<Navigate to="dashboard" replace/>}/>
          </Routes>
        </main>
      </div>
    </div>
  );
}
