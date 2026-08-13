import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { inr, humanize, pillClass, fmtDate, fmtDateTime, STAGES } from "@/lib/format";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Download, ShieldCheck, Plus, FileSignature } from "lucide-react";
import CAM from "@/pages/CAM";

export default function CaseDetail() {
  const { uid } = useParams();
  const [d, setD] = useState(null);
  const [lenders, setLenders] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [appOpen, setAppOpen] = useState(false);
  const [sancOpen, setSancOpen] = useState(false);
  const [disbOpen, setDisbOpen] = useState(false);
  const [selApp, setSelApp] = useState(null);
  const [selSanc, setSelSanc] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadMeta, setUploadMeta] = useState({ category: "KYC", doc_type: "PAN Card" });
  const fileRef = useRef();

  const load = async () => {
    const { data } = await api.get(`/cases/${uid}`); setD(data);
    const { data: sug } = await api.get(`/lenders/suggest/${uid}`); setSuggested(sug);
  };
  useEffect(() => { load(); api.get("/lenders").then(r => setLenders(r.data)); }, [uid]);

  const changeStage = async (s) => { await api.patch(`/cases/${uid}`, { stage: s }); toast.success("Stage updated"); load(); };

  const uploadDoc = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const fd = new FormData();
    fd.append("file", f); fd.append("client_uid", d.client.client_uid); fd.append("case_uid", uid);
    fd.append("category", uploadMeta.category); fd.append("doc_type", uploadMeta.doc_type);
    try { await api.post("/documents/upload", fd); toast.success("Uploaded"); setUploadOpen(false); load(); }
    catch { toast.error("Upload failed"); }
  };

  const pullBureau = async () => {
    try { await api.post(`/cases/${uid}/bureau`, { provider: "cibil", consent: true }); toast.success("Bureau pulled (sandbox)"); load(); }
    catch (e) { toast.error("Failed"); }
  };

  const createApplication = async (lender_id) => {
    await api.post("/applications", { case_uid: uid, lender_id, amount_requested: d.case.requirement });
    toast.success("Application created"); setAppOpen(false); load();
  };

  const recordSanction = async (form) => {
    await api.post("/sanctions", {
      application_uid: form.application_uid, case_uid: uid,
      lender_id: form.lender_id, sanction_amount: Number(form.sanction_amount),
      roi: Number(form.roi), tenure_months: Number(form.tenure), emi: Number(form.sanction_amount)*0.0125,
      status: "accepted",
    });
    toast.success("Sanction recorded"); setSancOpen(false); setSelApp(null); load();
  };

  const recordDisbursement = async (form) => {
    await api.post("/disbursements", {
      case_uid: uid, sanction_uid: form.sanction_uid, amount: Number(form.amount),
      reference: form.reference, destination: form.destination,
    });
    toast.success("Disbursement recorded"); setDisbOpen(false); setSelSanc(null); load();
  };

  if (!d) return <div className="text-slate-500">Loading…</div>;
  const c = d.case;

  return (
    <div className="space-y-4" data-testid="case-detail-page">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs mono text-slate-500">{c.case_uid} · Client {c.client_uid}</div>
          <h1 className="font-display text-2xl font-semibold">{d.client?.name}</h1>
          <div className="text-sm text-slate-500">{humanize(c.product)} · Tenure {c.tenure_months}m · ROI {c.expected_roi}%</div>
        </div>
        <div className="w-56">
          <Label className="text-xs">Stage</Label>
          <Select value={c.stage} onValueChange={changeStage}>
            <SelectTrigger data-testid="case-stage-select"><SelectValue/></SelectTrigger>
            <SelectContent className="max-h-64">{STAGES.map(s => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Stat label="Requested" v={inr(c.requirement)}/>
        <Stat label="Sanctioned" v={inr(c.sanctioned_amount)}/>
        <Stat label="Disbursed" v={inr(c.disbursed_amount)}/>
        <Stat label="Doc completeness" v={`${c.documentation_pct}%`}/>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="pd" data-testid="tab-pd">PD ({d.pds.length})</TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents">Documents ({d.documents.length})</TabsTrigger>
          <TabsTrigger value="bureau" data-testid="tab-bureau">Bureau ({d.bureau.length})</TabsTrigger>
          <TabsTrigger value="applications" data-testid="tab-applications">Applications ({d.applications.length})</TabsTrigger>
          <TabsTrigger value="cam" data-testid="tab-cam">CAM</TabsTrigger>
          <TabsTrigger value="queries" data-testid="tab-queries">Queries ({d.queries.length})</TabsTrigger>
          <TabsTrigger value="sanctions" data-testid="tab-sanctions">Sanctions ({d.sanctions.length})</TabsTrigger>
          <TabsTrigger value="disbursements" data-testid="tab-disbursements">Disbursements ({d.disbursements.length})</TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-display text-sm font-semibold mb-3">Case</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <F k="Purpose" v={c.purpose}/>
                <F k="Security" v={c.security}/>
                <F k="Geography" v={c.geography}/>
                <F k="Urgency" v={humanize(c.urgency)}/>
                <F k="Sales owner" v={c.sales_owner}/>
                <F k="Credit owner" v={c.credit_owner}/>
                <F k="Expected closure" v={fmtDate(c.expected_closure)}/>
                <F k="Channel partner" v={c.channel_partner_uid || "Direct"}/>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="font-display text-sm font-semibold mb-3">Suggested lenders</h3>
              <div className="space-y-1.5">
                {suggested.slice(0,6).map(({ lender, score }) => (
                  <div key={lender.lender_id} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100">
                    <div>
                      <div className="font-medium">{lender.name}</div>
                      <div className="text-xs text-slate-500">{humanize(lender.lender_type)} · {inr(lender.ticket_size_min)}–{inr(lender.ticket_size_max)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`pill ${score>70?"pill-green":score>40?"pill-amber":"pill-red"}`}>{score}</span>
                      <Button size="sm" variant="outline" onClick={()=>createApplication(lender.lender_id)}>Apply</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pd">
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            {d.pds.map(p => (
              <div key={p.pd_id} className="border border-slate-200 rounded-md p-3">
                <div className="flex justify-between mb-2">
                  <div className="font-medium text-sm">{humanize(p.template)} PD · v{p.version}</div>
                  <div className="text-xs text-slate-500">{fmtDateTime(p.conducted_on)}</div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  {Object.entries(p.data).map(([k,v]) => (
                    <div key={k}><div className="text-xs text-slate-500">{humanize(k)}</div>
                    <div className="num font-medium">{typeof v==='number' && k.includes('turnover')||k.includes('net_worth')||k.includes('debt')||k.includes('balance') ? inr(v) : v}</div></div>
                  ))}
                </div>
              </div>
            ))}
            {d.pds.length===0 && <div className="text-sm text-slate-500">No PD recorded yet.</div>}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="flex justify-end mb-2 gap-2 items-center">
            <input ref={fileRef} type="file" onChange={uploadDoc} className="hidden"/>
            <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
              <DialogTrigger asChild>
                <Button size="sm" data-testid="upload-doc-btn"><Upload size={14} className="mr-1"/>Upload</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Upload document</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3 py-2">
                  <div><Label>Category</Label>
                    <Select value={uploadMeta.category} onValueChange={v=>setUploadMeta({...uploadMeta, category: v})}>
                      <SelectTrigger data-testid="upload-category-select"><SelectValue/></SelectTrigger>
                      <SelectContent>{["KYC","Corporate","Financial","Banking","GST/Tax","Existing Loans","Security/Collateral","Legal","Lender","Sanction","Mandate","Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Type</Label>
                    <Input value={uploadMeta.doc_type} onChange={e=>setUploadMeta({...uploadMeta, doc_type: e.target.value})} placeholder="e.g. PAN Card, GST return" data-testid="upload-doctype-input"/></div>
                  <div className="col-span-2">
                    <Button className="w-full" onClick={()=>fileRef.current?.click()} data-testid="upload-choose-file-btn">Choose file &amp; upload</Button>
                    <p className="text-xs text-slate-500 mt-2">Version chain is scoped by client × case × doc type — reuploading the same Type creates v2, v3, etc.</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full dense-table">
              <thead><tr><th>File</th><th>Category</th><th>Type</th><th>Ver</th><th>Status</th><th>Uploaded</th><th></th></tr></thead>
              <tbody>
                {d.documents.map(dc => (
                  <tr key={dc.document_id}>
                    <td>{dc.original_filename}</td><td>{dc.category}</td><td>{dc.doc_type}</td>
                    <td className="num-cell">v{dc.version}</td>
                    <td><span className={`pill ${pillClass(dc.status)}`}>{humanize(dc.status)}</span></td>
                    <td className="text-xs text-slate-500">{fmtDateTime(dc.uploaded_at)}</td>
                    <td><Button size="sm" variant="ghost" onClick={()=>window.open(`${api.defaults.baseURL}/documents/${dc.document_id}/download`,'_blank')}><Download size={13}/></Button></td>
                  </tr>
                ))}
                {d.documents.length===0 && <tr><td colSpan={7} className="p-6 text-center text-slate-500">No documents.</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="bureau">
          <div className="flex justify-end mb-2">
            <Button size="sm" onClick={pullBureau} data-testid="pull-bureau-btn"><ShieldCheck size={14} className="mr-1"/>Pull CIBIL (Sandbox)</Button>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full dense-table">
              <thead><tr><th>Provider</th><th className="num-cell">Score</th><th>Accounts</th><th>Enquiries</th><th>DPD</th><th className="num-cell">Overdue</th><th>Pulled</th><th>Mode</th></tr></thead>
              <tbody>
                {d.bureau.map(b => (
                  <tr key={b.bureau_id}>
                    <td className="uppercase">{b.provider}</td>
                    <td className="num-cell text-lg font-semibold text-slate-900">{b.score}</td>
                    <td className="num-cell">{b.accounts}</td>
                    <td className="num-cell">{b.enquiries}</td>
                    <td className="num-cell">{b.dpd_current}</td>
                    <td className="num-cell">{inr(b.overdue_amount)}</td>
                    <td className="text-xs">{fmtDateTime(b.pulled_at)}</td>
                    <td><span className="pill pill-amber">Sandbox</span></td>
                  </tr>
                ))}
                {d.bureau.length===0 && <tr><td colSpan={8} className="p-6 text-center text-slate-500">No bureau reports.</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <div className="flex justify-end mb-2">
            <Dialog open={appOpen} onOpenChange={setAppOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus size={14} className="mr-1"/>New application</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Choose lender</DialogTitle></DialogHeader>
                <div className="max-h-72 overflow-y-auto">
                  {lenders.map(l => (
                    <div key={l.lender_id} className="flex justify-between items-center py-2 border-b">
                      <div><div className="font-medium">{l.name}</div><div className="text-xs text-slate-500">{humanize(l.lender_type)}</div></div>
                      <Button size="sm" variant="outline" onClick={()=>createApplication(l.lender_id)}>Apply</Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full dense-table">
              <thead><tr><th>UID</th><th>Lender</th><th className="num-cell">Amount</th><th className="num-cell">Sanctioned</th><th>ROI</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {d.applications.map(a => (
                  <tr key={a.application_uid}>
                    <td className="mono text-xs">{a.application_uid}</td>
                    <td>{a.lender_id?.replace("lender_","").toUpperCase()}</td>
                    <td className="num-cell">{inr(a.amount_requested)}</td>
                    <td className="num-cell">{inr(a.sanction_amount)}</td>
                    <td className="num-cell">{a.roi||"-"}</td>
                    <td><span className={`pill ${pillClass(a.status)}`}>{humanize(a.status)}</span></td>
                    <td>
                      {a.status !== 'sanctioned' && a.status !== 'rejected' &&
                        <Dialog open={sancOpen && selApp?.application_uid===a.application_uid}
                                onOpenChange={(o)=>{ setSancOpen(o); if(!o) setSelApp(null); }}>
                          <DialogTrigger asChild><Button size="sm" variant="outline" onClick={()=>{ setSelApp(a); setSancOpen(true); }} data-testid={`sanction-btn-${a.application_uid}`}><FileSignature size={13} className="mr-1"/>Sanction</Button></DialogTrigger>
                          <SanctionForm app={selApp||a} onSubmit={recordSanction}/>
                        </Dialog>}
                    </td>
                  </tr>
                ))}
                {d.applications.length===0 && <tr><td colSpan={7} className="p-6 text-center text-slate-500">No applications.</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="queries">
          <SimpleList rows={d.queries} render={q => (
            <div key={q.query_id} className="p-3 border-b">
              <div className="flex justify-between mb-1"><div className="font-medium text-sm">{q.query_text}</div><span className={`pill ${pillClass(q.status)}`}>{humanize(q.status)}</span></div>
              <div className="text-xs text-slate-500">Raised by {q.raised_by} · Due {fmtDate(q.due_date)}</div>
            </div>
          )} empty="No lender queries."/>
        </TabsContent>

        <TabsContent value="cam">
          <CAM caseData={d} onSaved={load}/>
        </TabsContent>

        <TabsContent value="sanctions">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full dense-table">
              <thead><tr><th>UID</th><th>Lender</th><th className="num-cell">Amount</th><th className="num-cell">ROI</th><th>Tenure</th><th className="num-cell">EMI</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {d.sanctions.map(s => (
                  <tr key={s.sanction_uid}>
                    <td className="mono text-xs">{s.sanction_uid}</td>
                    <td>{s.lender_id?.replace("lender_","").toUpperCase()}</td>
                    <td className="num-cell">{inr(s.sanction_amount)}</td>
                    <td className="num-cell">{s.roi}%</td>
                    <td className="num-cell">{s.tenure_months}m</td>
                    <td className="num-cell">{inr(s.emi)}</td>
                    <td><span className={`pill ${pillClass(s.status)}`}>{humanize(s.status)}</span></td>
                    <td>
                      <Dialog open={disbOpen && selSanc?.sanction_uid===s.sanction_uid}
                              onOpenChange={(o)=>{ setDisbOpen(o); if(!o) setSelSanc(null); }}>
                        <DialogTrigger asChild><Button size="sm" variant="outline" onClick={()=>{ setSelSanc(s); setDisbOpen(true); }} data-testid={`disburse-btn-${s.sanction_uid}`}>Disburse</Button></DialogTrigger>
                        <DisburseForm sanction={selSanc||s} onSubmit={recordDisbursement}/>
                      </Dialog>
                    </td>
                  </tr>
                ))}
                {d.sanctions.length===0 && <tr><td colSpan={8} className="p-6 text-center text-slate-500">No sanctions.</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="disbursements">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full dense-table">
              <thead><tr><th>UID</th><th>Tranche</th><th className="num-cell">Amount</th><th>Reference</th><th>Destination</th><th>Date</th></tr></thead>
              <tbody>
                {d.disbursements.map(x => (
                  <tr key={x.disbursement_uid}>
                    <td className="mono text-xs">{x.disbursement_uid}</td>
                    <td className="num-cell">#{x.tranche_no}</td>
                    <td className="num-cell font-semibold">{inr(x.amount)}</td>
                    <td className="mono text-xs">{x.reference}</td>
                    <td className="text-xs">{x.destination}</td>
                    <td className="text-xs">{fmtDateTime(x.disbursement_date)}</td>
                  </tr>
                ))}
                {d.disbursements.length===0 && <tr><td colSpan={6} className="p-6 text-center text-slate-500">No disbursements.</td></tr>}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="bg-white border border-slate-200 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
            {d.activities.map(a => (
              <div key={a.activity_id} className="flex gap-3 pb-3 mb-3 border-b border-slate-100 last:border-0">
                <div className="w-1.5 h-1.5 mt-2 rounded-full bg-orange-500 shrink-0"/>
                <div className="flex-1">
                  <div className="text-sm">{a.summary}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{a.author_name} · {fmtDateTime(a.created_at)}</div>
                </div>
                <span className={`pill ${pillClass(a.kind)}`}>{humanize(a.kind)}</span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, v }) {
  return <div className="bg-white border border-slate-200 rounded-lg p-4"><div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div><div className="text-xl font-display font-semibold mt-1 num">{v}</div></div>;
}
function F({ k, v }) { return <div><div className="text-xs text-slate-500">{k}</div><div className="font-medium">{v || "-"}</div></div>; }
function SimpleList({ rows, render, empty }) {
  return <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
    {rows.map(render)}
    {rows.length===0 && <div className="p-6 text-center text-slate-500 text-sm">{empty}</div>}
  </div>;
}

function SanctionForm({ app, onSubmit }) {
  const [f, setF] = useState({ sanction_amount: app.amount_requested, roi: 11.0, tenure: 60 });
  return <DialogContent>
    <DialogHeader><DialogTitle>Record sanction — {app.lender_id?.replace("lender_","").toUpperCase()}</DialogTitle></DialogHeader>
    <div className="grid grid-cols-2 gap-3 py-2">
      <div><Label>Amount</Label><Input type="number" value={f.sanction_amount} onChange={e=>setF({...f,sanction_amount:e.target.value})}/></div>
      <div><Label>ROI %</Label><Input type="number" step="0.01" value={f.roi} onChange={e=>setF({...f,roi:e.target.value})}/></div>
      <div><Label>Tenure (months)</Label><Input type="number" value={f.tenure} onChange={e=>setF({...f,tenure:e.target.value})}/></div>
    </div>
    <DialogFooter><Button onClick={()=>onSubmit({...f, application_uid: app.application_uid, lender_id: app.lender_id})}>Save Sanction</Button></DialogFooter>
  </DialogContent>;
}

function DisburseForm({ sanction, onSubmit }) {
  const [f, setF] = useState({ amount: sanction.sanction_amount, reference: "", destination: "" });
  return <DialogContent>
    <DialogHeader><DialogTitle>Record disbursement</DialogTitle></DialogHeader>
    <div className="grid grid-cols-2 gap-3 py-2">
      <div><Label>Amount</Label><Input type="number" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></div>
      <div><Label>UTR / Reference</Label><Input value={f.reference} onChange={e=>setF({...f,reference:e.target.value})}/></div>
      <div className="col-span-2"><Label>Destination</Label><Input value={f.destination} onChange={e=>setF({...f,destination:e.target.value})}/></div>
    </div>
    <DialogFooter><Button onClick={()=>onSubmit({...f, sanction_uid: sanction.sanction_uid})}>Save Disbursement</Button></DialogFooter>
  </DialogContent>;
}
