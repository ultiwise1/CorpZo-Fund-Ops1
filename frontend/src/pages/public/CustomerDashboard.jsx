import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { inr, humanize, pillClass, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Landmark, Upload, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function CustomerDashboard({ user }) {
  const [data, setData] = useState(null);
  const nav = useNavigate();
  useEffect(() => { api.get("/customer/me").then(r => setData(r.data)); }, []);
  const logout = async () => { try { await api.post("/auth/logout"); } catch {}; nav("/"); window.location.reload(); };
  if (!data) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>;

  const uploadDoc = async (e, caseUid, clientUid) => {
    const f = e.target.files[0]; if (!f) return;
    const fd = new FormData();
    fd.append("file", f); fd.append("client_uid", clientUid); fd.append("case_uid", caseUid);
    fd.append("category", "Customer Upload"); fd.append("doc_type", f.name);
    try { await api.post("/documents/upload", fd); toast.success("Uploaded"); }
    catch { toast.error("Upload failed — please contact your RM"); }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]" data-testid="customer-dashboard">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#0B1F3A]/10 shadow-[0_1px_0_rgba(15,61,46,0.03)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-display text-lg font-bold text-[#0B1F3A]"><Landmark size={22} className="text-[#1B3A6B]"/>CORPZO</a>
          <div className="flex items-center gap-3">
            <div className="text-sm text-[#0B1F3A]/70 hidden sm:block">Hi, <span className="font-semibold text-[#0B1F3A]">{user.name?.split(" ")[0]}</span></div>
            <Button size="sm" variant="ghost" onClick={logout} className="text-[#0B1F3A]/70 hover:text-[#0B1F3A]"><LogOut size={14} className="mr-1"/>Sign out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#0B1F3A]">Your applications</h1>
          <p className="text-[#0B1F3A]/60 text-sm mt-1">Every enquiry, application and disbursal you've made with CorpZo — in one view.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Stat label="Enquiries" v={data.leads.length}/>
          <Stat label="Active cases" v={data.cases.length}/>
          <Stat label="Total sanctioned" v={inr(data.cases.reduce((s,c)=>s+(c.sanctioned_amount||0),0))}/>
        </div>

        <div className="bg-white border border-[#0B1F3A]/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#0B1F3A]/10 bg-[#F2F5FA]"><h3 className="font-display text-lg font-bold text-[#0B1F3A]">Recent enquiries</h3></div>
          <table className="w-full dense-table">
            <thead><tr><th>Reference</th><th>Product</th><th className="num-cell">Amount</th><th>Stage</th><th>Priority</th><th>Received</th></tr></thead>
            <tbody>
              {data.leads.map(l => (
                <tr key={l.lead_uid}>
                  <td className="mono text-xs">{l.lead_uid}</td>
                  <td>{humanize(l.product)}</td>
                  <td className="num-cell">{inr(l.approx_requirement)}</td>
                  <td><span className={`pill ${pillClass(l.stage)}`}>{humanize(l.stage)}</span></td>
                  <td><span className={`pill ${pillClass(l.priority)}`}>{humanize(l.priority)}</span></td>
                  <td className="text-xs">{fmtDate(l.created_at)}</td>
                </tr>
              ))}
              {data.leads.length===0 && <tr><td colSpan={6} className="p-8 text-center text-[#0B1F3A]/55">No enquiries yet. <a href="/products" className="text-[#FF6B4E] hover:underline font-semibold">Explore products →</a></td></tr>}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-[#0B1F3A]/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#0B1F3A]/10 bg-[#F2F5FA]"><h3 className="font-display text-lg font-bold text-[#0B1F3A]">Your cases</h3></div>
          {data.cases.length === 0 ? (
            <div className="p-8 text-center text-[#0B1F3A]/55 text-sm">Cases appear here once your enquiry qualifies. Your RM will call you shortly.</div>
          ) : (
            <div className="divide-y divide-[#0B1F3A]/8">
              {data.cases.map(c => (
                <div key={c.case_uid} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs mono text-[#0B1F3A]/50">{c.case_uid}</div>
                      <div className="font-display text-lg text-[#0B1F3A] font-bold">{humanize(c.product)}</div>
                      <div className="text-sm text-[#0B1F3A]/55 mt-1">{c.purpose || "No purpose captured"} · Tenure {c.tenure_months}m</div>
                    </div>
                    <span className={`pill ${pillClass(c.stage)}`}>{humanize(c.stage)}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    <Fact k="Requested" v={inr(c.requirement)}/>
                    <Fact k="Sanctioned" v={inr(c.sanctioned_amount)}/>
                    <Fact k="Disbursed" v={inr(c.disbursed_amount)}/>
                    <Fact k="Docs" v={`${c.documentation_pct}%`}/>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <label className="inline-flex items-center gap-2 text-xs px-3 py-1.5 border border-[#0B1F3A]/15 rounded-md hover:border-[#FF6B4E] hover:text-[#FF6B4E] cursor-pointer font-semibold text-[#0B1F3A]/70">
                      <Upload size={13}/>Upload document
                      <input type="file" className="hidden" onChange={e=>uploadDoc(e, c.case_uid, c.client_uid)} data-testid={`customer-upload-${c.case_uid}`}/>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, v }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-4">
    <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold">{label}</div>
    <div className="font-display text-2xl font-bold text-[#0B1F3A] num mt-1">{v}</div>
  </div>;
}
function Fact({ k, v }) {
  return <div><div className="text-[10.5px] uppercase tracking-widest text-[#0B1F3A]/50 font-bold">{k}</div><div className="font-display text-base text-[#0B1F3A] num font-bold">{v}</div></div>;
}
