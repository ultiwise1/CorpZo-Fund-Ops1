import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { inr, humanize, pillClass, fmtDate, fmtDateTime } from "@/lib/format";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function ClientDetail() {
  const { uid } = useParams();
  const [d, setD] = useState(null);
  const nav = useNavigate();
  useEffect(() => { api.get(`/clients/${uid}`).then(r => setD(r.data)); }, [uid]);
  if (!d) return <div className="text-slate-500">Loading…</div>;
  const c = d.client;
  const totalReq = d.cases.reduce((s,x)=>s+(x.requirement||0), 0);
  const totalSanc = d.cases.reduce((s,x)=>s+(x.sanctioned_amount||0), 0);
  const totalDisb = d.cases.reduce((s,x)=>s+(x.disbursed_amount||0), 0);

  return (
    <div className="space-y-4" data-testid="client-detail-page">
      <div>
        <div className="text-xs mono text-slate-500">{c.client_uid}</div>
        <h1 className="font-display text-2xl font-semibold">{c.name}</h1>
        <div className="text-sm text-slate-500">{c.company} · {c.city}, {c.state} · {humanize(c.borrower_type)}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total Requested" value={inr(totalReq)}/>
        <Stat label="Total Sanctioned" value={inr(totalSanc)}/>
        <Stat label="Total Disbursed" value={inr(totalDisb)}/>
        <Stat label="Active Cases" value={d.cases.length}/>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="grid grid-cols-4 gap-3 text-sm">
          <Field label="PAN" value={c.pan}/>
          <Field label="CIN" value={c.cin}/>
          <Field label="GSTIN" value={c.gstin}/>
          <Field label="Mobile" value={c.mobile}/>
          <Field label="Email" value={c.email}/>
          <Field label="Industry" value={c.industry}/>
          <Field label="Constitution" value={c.constitution}/>
          <Field label="Incorporation" value={fmtDate(c.incorporation_date)}/>
        </div>
      </div>

      <Tabs defaultValue="cases">
        <TabsList>
          <TabsTrigger value="cases" data-testid="tab-cases">Cases ({d.cases.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({d.documents.length})</TabsTrigger>
          <TabsTrigger value="invoices">Invoices ({d.invoices.length})</TabsTrigger>
          <TabsTrigger value="mandates">Mandates ({d.mandates.length})</TabsTrigger>
          <TabsTrigger value="activity">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="cases">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full dense-table">
              <thead><tr><th>Case</th><th>Product</th><th className="num-cell">Requirement</th><th className="num-cell">Sanctioned</th><th className="num-cell">Disbursed</th><th>Stage</th></tr></thead>
              <tbody>
                {d.cases.map(k => (
                  <tr key={k.case_uid} onClick={()=>nav(`/cases/${k.case_uid}`)} className="cursor-pointer">
                    <td className="mono text-xs">{k.case_uid}</td>
                    <td>{humanize(k.product)}</td>
                    <td className="num-cell">{inr(k.requirement)}</td>
                    <td className="num-cell">{inr(k.sanctioned_amount)}</td>
                    <td className="num-cell">{inr(k.disbursed_amount)}</td>
                    <td><span className={`pill ${pillClass(k.stage)}`}>{humanize(k.stage)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="documents">
          <SimpleTable rows={d.documents} cols={[["original_filename","File"],["category","Category"],["doc_type","Type"],["version","Ver"],["status","Status",true]]}/>
        </TabsContent>
        <TabsContent value="invoices">
          <SimpleTable rows={d.invoices} cols={[["invoice_uid","UID"],["amount","Amount",false,"inr"],["status","Status",true],["due_date","Due","date"]]}/>
        </TabsContent>
        <TabsContent value="mandates">
          <SimpleTable rows={d.mandates} cols={[["mandate_uid","UID"],["scope","Scope"],["upfront_fee","Upfront",false,"inr"],["success_fee_pct","Success %"],["status","Status",true]]}/>
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

function Stat({ label, value }) {
  return <div className="bg-white border border-slate-200 rounded-lg p-4">
    <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
    <div className="text-xl font-display font-semibold mt-1 num">{value}</div>
  </div>;
}
function Field({ label, value }) {
  return <div><div className="text-xs text-slate-500">{label}</div><div className="mono text-sm">{value || "-"}</div></div>;
}
function SimpleTable({ rows, cols }) {
  return <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
    <table className="w-full dense-table">
      <thead><tr>{cols.map(c => <th key={c[0]} className={c[3]==='inr'?'num-cell':''}>{c[1]}</th>)}</tr></thead>
      <tbody>
        {rows.map((r,i) => <tr key={i}>{cols.map(c => {
          let v = r[c[0]];
          if (c[3]==='inr') v = inr(v);
          else if (c[3]==='date') v = fmtDate(v);
          if (c[2]) return <td key={c[0]}><span className={`pill ${pillClass(r[c[0]])}`}>{humanize(v)}</span></td>;
          return <td key={c[0]} className={c[3]==='inr'?'num-cell num':''}>{v || "-"}</td>;
        })}</tr>)}
        {rows.length===0 && <tr><td colSpan={cols.length} className="p-6 text-center text-slate-500">No data</td></tr>}
      </tbody>
    </table>
  </div>;
}
