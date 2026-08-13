import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { humanize, pillClass, inr, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";

const FLAG_TONES = { green: "bg-emerald-50 border-emerald-200 text-emerald-800",
                     amber: "bg-amber-50 border-amber-200 text-amber-800",
                     red: "bg-red-50 border-red-200 text-red-800" };

export default function CAM({ caseData, onSaved }) {
  const { case: c, client, bureau } = caseData;
  const latestBureau = bureau?.[0];
  const [f, setF] = useState({
    overview: { turnover: "", vintage_years: "", industry: client?.industry || "" },
    financials: { revenue_fy23: "", revenue_fy24: "", ebitda_pct: "", pat_pct: "", net_worth: "" },
    banking: { avg_balance: "", monthly_credits: "", cheque_returns: 0, cash_deposits_pct: "" },
    ratios: { current: "", debt_equity: "", tol_tnw: "", debt_ebitda: "", dscr: "", foir: "" },
    positives: "",
    concerns: "",
    flags: [],
    indicative_eligibility: c?.requirement || 0,
    analyst_comments: "",
    recommendation: "",
  });
  const [flagForm, setFlagForm] = useState({ level: "green", title: "" });

  useEffect(() => {
    api.get(`/cases/${c.case_uid}`).then(r => {
      const a = r.data.assessment;
      if (a) setF({
        overview: a.overview || f.overview,
        financials: a.financials || f.financials,
        banking: a.banking || f.banking,
        ratios: a.ratios || f.ratios,
        positives: (a.positives || []).join("\n"),
        concerns: (a.concerns || []).join("\n"),
        flags: a.flags || [],
        indicative_eligibility: a.indicative_eligibility || 0,
        analyst_comments: a.analyst_comments || "",
        recommendation: a.recommendation || "",
      });
    });
    // eslint-disable-next-line
  }, [c.case_uid]);

  const addFlag = () => {
    if (!flagForm.title.trim()) return;
    setF({...f, flags: [...f.flags, { ...flagForm, id: Date.now() }] });
    setFlagForm({ level: "green", title: "" });
  };
  const removeFlag = (id) => setF({...f, flags: f.flags.filter(x => x.id !== id) });

  const save = async () => {
    const payload = {
      overview: f.overview, financials: f.financials, banking: f.banking, ratios: f.ratios,
      positives: f.positives.split("\n").map(s=>s.trim()).filter(Boolean),
      concerns: f.concerns.split("\n").map(s=>s.trim()).filter(Boolean),
      flags: f.flags,
      indicative_eligibility: Number(f.indicative_eligibility) || 0,
      analyst_comments: f.analyst_comments,
      recommendation: f.recommendation,
    };
    try {
      await api.post(`/cases/${c.case_uid}/assessment`, payload);
      toast.success("Assessment saved");
      onSaved?.();
    } catch { toast.error("Save failed"); }
  };

  const bureauScore = latestBureau?.score;
  const bureauTone = bureauScore >= 750 ? "green" : bureauScore >= 700 ? "amber" : "red";

  return (
    <div className="space-y-4" data-testid="cam-form">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div><h3 className="font-display font-semibold text-base">Credit Assessment (CAM-Lite)</h3><p className="text-xs text-slate-500">All fields save to a single, versioned credit snapshot. Final recommendation must be attributable.</p></div>
          <Button className="bg-slate-900 hover:bg-slate-800" onClick={save} data-testid="cam-save-btn"><FileText size={14} className="mr-1"/>Save Assessment</Button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Snapshot label="Requested" v={inr(c.requirement)}/>
          <Snapshot label="Product" v={humanize(c.product)}/>
          <Snapshot label="Bureau Score" v={bureauScore || "—"} tone={bureauScore ? bureauTone : null}/>
          <Snapshot label="Doc Completeness" v={`${c.documentation_pct}%`} tone={c.documentation_pct >= 80 ? "green" : c.documentation_pct >= 50 ? "amber" : "red"}/>
        </div>
      </div>

      <Section title="Business overview">
        <Row><F l="Industry" v={f.overview.industry} onChange={v=>setF({...f, overview:{...f.overview, industry:v}})}/></Row>
        <Row>
          <F l="Turnover (₹)" v={f.overview.turnover} type="number" onChange={v=>setF({...f, overview:{...f.overview, turnover:v}})}/>
          <F l="Vintage (yrs)" v={f.overview.vintage_years} type="number" onChange={v=>setF({...f, overview:{...f.overview, vintage_years:v}})}/>
        </Row>
      </Section>

      <Section title="Financial performance">
        <Row>
          <F l="Revenue FY23" v={f.financials.revenue_fy23} type="number" onChange={v=>setF({...f, financials:{...f.financials, revenue_fy23:v}})}/>
          <F l="Revenue FY24" v={f.financials.revenue_fy24} type="number" onChange={v=>setF({...f, financials:{...f.financials, revenue_fy24:v}})}/>
          <F l="EBITDA %" v={f.financials.ebitda_pct} type="number" onChange={v=>setF({...f, financials:{...f.financials, ebitda_pct:v}})}/>
        </Row>
        <Row>
          <F l="PAT %" v={f.financials.pat_pct} type="number" onChange={v=>setF({...f, financials:{...f.financials, pat_pct:v}})}/>
          <F l="Net worth" v={f.financials.net_worth} type="number" onChange={v=>setF({...f, financials:{...f.financials, net_worth:v}})}/>
        </Row>
      </Section>

      <Section title="Banking analysis">
        <Row>
          <F l="Avg bank balance" v={f.banking.avg_balance} type="number" onChange={v=>setF({...f, banking:{...f.banking, avg_balance:v}})}/>
          <F l="Monthly credits" v={f.banking.monthly_credits} type="number" onChange={v=>setF({...f, banking:{...f.banking, monthly_credits:v}})}/>
          <F l="Cheque returns" v={f.banking.cheque_returns} type="number" onChange={v=>setF({...f, banking:{...f.banking, cheque_returns:v}})}/>
          <F l="Cash deposits %" v={f.banking.cash_deposits_pct} type="number" onChange={v=>setF({...f, banking:{...f.banking, cash_deposits_pct:v}})}/>
        </Row>
      </Section>

      <Section title="Key ratios">
        <Row>
          <F l="Current ratio" v={f.ratios.current} onChange={v=>setF({...f, ratios:{...f.ratios, current:v}})}/>
          <F l="Debt / Equity" v={f.ratios.debt_equity} onChange={v=>setF({...f, ratios:{...f.ratios, debt_equity:v}})}/>
          <F l="TOL / TNW" v={f.ratios.tol_tnw} onChange={v=>setF({...f, ratios:{...f.ratios, tol_tnw:v}})}/>
        </Row>
        <Row>
          <F l="Debt / EBITDA" v={f.ratios.debt_ebitda} onChange={v=>setF({...f, ratios:{...f.ratios, debt_ebitda:v}})}/>
          <F l="DSCR" v={f.ratios.dscr} onChange={v=>setF({...f, ratios:{...f.ratios, dscr:v}})}/>
          <F l="FOIR" v={f.ratios.foir} onChange={v=>setF({...f, ratios:{...f.ratios, foir:v}})}/>
        </Row>
      </Section>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Key positives (one per line)">
          <Textarea rows={5} value={f.positives} onChange={e=>setF({...f, positives:e.target.value})} placeholder="Strong revenue growth&#10;Diverse customer base&#10;Zero DPD in 24 months" data-testid="cam-positives"/>
        </Section>
        <Section title="Key concerns (one per line)">
          <Textarea rows={5} value={f.concerns} onChange={e=>setF({...f, concerns:e.target.value})} placeholder="High concentration risk&#10;Directors' guarantees pending" data-testid="cam-concerns"/>
        </Section>
      </div>

      <Section title="Credit flags">
        <div className="flex gap-2 items-end mb-3">
          <div className="w-40"><Label className="text-xs">Level</Label>
            <Select value={flagForm.level} onValueChange={v=>setFlagForm({...flagForm, level:v})}>
              <SelectTrigger data-testid="cam-flag-level"><SelectValue/></SelectTrigger>
              <SelectContent><SelectItem value="green">Green</SelectItem><SelectItem value="amber">Amber</SelectItem><SelectItem value="red">Red</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="flex-1"><Label className="text-xs">Title</Label><Input value={flagForm.title} onChange={e=>setFlagForm({...flagForm, title:e.target.value})} placeholder="e.g. Related-party revenue > 20%" data-testid="cam-flag-title"/></div>
          <Button variant="outline" onClick={addFlag} data-testid="cam-add-flag-btn">Add flag</Button>
        </div>
        <div className="space-y-2">
          {f.flags.map(fl => (
            <div key={fl.id} className={`flex items-center justify-between border rounded-md p-2.5 ${FLAG_TONES[fl.level]}`} data-testid={`cam-flag-${fl.id}`}>
              <div className="flex items-center gap-2">
                {fl.level==="green" ? <CheckCircle2 size={16}/> : fl.level==="amber" ? <AlertTriangle size={16}/> : <ShieldAlert size={16}/>}
                <span className="text-sm">{fl.title}</span>
              </div>
              <button className="text-xs opacity-70 hover:opacity-100" onClick={()=>removeFlag(fl.id)}>Remove</button>
            </div>
          ))}
          {f.flags.length === 0 && <div className="text-xs text-slate-500">No flags yet — add green/amber/red flags to make the CAM speak for itself.</div>}
        </div>
      </Section>

      <Section title="Recommendation">
        <Row>
          <F l="Indicative eligibility (₹)" v={f.indicative_eligibility} type="number" onChange={v=>setF({...f, indicative_eligibility:v})}/>
          <div className="col-span-2"><Label className="text-xs">Recommendation</Label>
            <Select value={f.recommendation} onValueChange={v=>setF({...f, recommendation:v})}>
              <SelectTrigger data-testid="cam-recommendation"><SelectValue placeholder="Select…"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="approve">Recommend approval</SelectItem>
                <SelectItem value="approve_with_conditions">Approve with conditions</SelectItem>
                <SelectItem value="refer_head">Refer to Credit Head</SelectItem>
                <SelectItem value="decline">Recommend decline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Row>
        <div className="mt-3"><Label className="text-xs">Analyst comments</Label>
          <Textarea rows={4} value={f.analyst_comments} onChange={e=>setF({...f, analyst_comments:e.target.value})} placeholder="Free-form observations, structuring notes, mitigants." data-testid="cam-comments"/>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return <div className="bg-white border border-slate-200 rounded-lg p-4"><h4 className="font-display text-sm font-semibold mb-3">{title}</h4>{children}</div>;
}
function Row({ children }) { return <div className="grid grid-cols-3 gap-3 mb-2 last:mb-0">{children}</div>; }
function F({ l, v, onChange, type="text" }) {
  return <div><Label className="text-xs">{l}</Label><Input type={type} value={v ?? ""} onChange={e=>onChange(e.target.value)}/></div>;
}
function Snapshot({ label, v, tone }) {
  const tones = { green: "text-emerald-700", amber: "text-amber-700", red: "text-red-700" };
  return <div className="border border-slate-200 rounded-md p-3">
    <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
    <div className={`text-lg font-display font-semibold num mt-1 ${tone ? tones[tone] : "text-slate-900"}`}>{v}</div>
  </div>;
}
