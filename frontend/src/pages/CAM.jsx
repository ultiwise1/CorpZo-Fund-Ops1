import { useEffect, useMemo, useState } from "react";
import { api, API_BASE } from "@/lib/api";
import { humanize, inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileText, ShieldAlert, CheckCircle2, AlertTriangle, Download, Sparkles, Plus } from "lucide-react";

const FLAG_TONES = {
  green: "bg-emerald-50 border-emerald-200 text-emerald-800",
  amber: "bg-amber-50  border-amber-200  text-amber-800",
  red:   "bg-red-50    border-red-200    text-red-800",
};

const RATIO_THRESHOLDS = {
  current:      { good: v => v >= 1.5, warn: v => v >= 1.0, hint: "≥1.5 healthy · <1 concern" },
  debt_equity:  { good: v => v <= 1.5, warn: v => v <= 3.0, hint: "≤1.5 healthy · >3 concern",   invert: true },
  tol_tnw:      { good: v => v <= 3.0, warn: v => v <= 4.0, hint: "≤3 healthy · >4 concern",     invert: true },
  debt_ebitda:  { good: v => v <= 3.0, warn: v => v <= 4.5, hint: "≤3 healthy · >4.5 concern",   invert: true },
  dscr:         { good: v => v >= 1.5, warn: v => v >= 1.2, hint: "≥1.5 healthy · <1.2 concern" },
  foir:         { good: v => v <= 40,  warn: v => v <= 60,  hint: "≤40% healthy · >60% concern", invert: true },
};

function ratioTone(key, raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || raw === "" || raw === null || raw === undefined) return null;
  const t = RATIO_THRESHOLDS[key];
  if (!t) return null;
  if (t.good(n)) return "green";
  if (t.warn(n)) return "amber";
  return "red";
}

const RATIO_INPUT_TONE = {
  green: "border-emerald-400 focus-visible:ring-emerald-400",
  amber: "border-amber-400 focus-visible:ring-amber-400",
  red:   "border-red-400 focus-visible:ring-red-400",
};

/** Derive automatic flag suggestions from current inputs & context. */
function buildSuggestions(f, ctx) {
  const s = [];
  const { bureauScore, docPct } = ctx;
  const r = f.ratios || {};
  const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));

  const dscr = num(r.dscr);
  if (dscr !== null) {
    if (dscr < 1.2) s.push({ level: "red",   title: `DSCR ${dscr} below 1.2 — repayment concern`, key: "dscr-red" });
    else if (dscr < 1.5) s.push({ level: "amber", title: `DSCR ${dscr} between 1.2–1.5 — thin cushion`, key: "dscr-amber" });
    else s.push({ level: "green", title: `DSCR ${dscr} is healthy (≥1.5)`, key: "dscr-green" });
  }

  const foir = num(r.foir);
  if (foir !== null) {
    if (foir > 60) s.push({ level: "red",   title: `FOIR ${foir}% exceeds 60% — over-leveraged`, key: "foir-red" });
    else if (foir > 40) s.push({ level: "amber", title: `FOIR ${foir}% between 40–60% — elevated`, key: "foir-amber" });
  }

  const de = num(r.debt_equity);
  if (de !== null && de > 3) s.push({ level: "red", title: `D/E ratio ${de} > 3 — high leverage`, key: "de-red" });

  const cur = num(r.current);
  if (cur !== null && cur < 1) s.push({ level: "red", title: `Current ratio ${cur} < 1 — liquidity risk`, key: "cur-red" });

  const debtEbitda = num(r.debt_ebitda);
  if (debtEbitda !== null && debtEbitda > 4.5) {
    s.push({ level: "red", title: `Debt/EBITDA ${debtEbitda} > 4.5 — servicing pressure`, key: "de-ebitda" });
  }

  if (typeof bureauScore === "number") {
    if (bureauScore < 650) s.push({ level: "red",   title: `Bureau score ${bureauScore} < 650 — sub-prime`, key: "bureau-red" });
    else if (bureauScore < 700) s.push({ level: "amber", title: `Bureau score ${bureauScore} between 650–700 — near-prime`, key: "bureau-amber" });
    else if (bureauScore >= 750) s.push({ level: "green", title: `Bureau score ${bureauScore} ≥ 750 — prime`, key: "bureau-green" });
  }

  if (typeof docPct === "number") {
    if (docPct < 50) s.push({ level: "red",   title: `Docs ${docPct}% collected — file incomplete`, key: "docs-red" });
    else if (docPct < 70) s.push({ level: "amber", title: `Docs ${docPct}% — chase pending items`, key: "docs-amber" });
  }

  const cr = num(f.banking?.cheque_returns);
  if (cr !== null && cr > 3) s.push({ level: "red", title: `${cr} cheque returns in banking window — repayment risk`, key: "cr-red" });

  const cash = num(f.banking?.cash_deposits_pct);
  if (cash !== null && cash > 30) s.push({ level: "amber", title: `Cash deposits ${cash}% of credits — verify sources`, key: "cash-amber" });

  return s;
}

export default function CAM({ caseData, onSaved }) {
  const { case: c, client, bureau } = caseData;
  const latestBureau = bureau?.[0];
  const bureauScore = latestBureau?.score;
  const bureauTone = bureauScore >= 750 ? "green" : bureauScore >= 700 ? "amber" : "red";

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
      if (a) setF(prev => ({
        overview: a.overview || prev.overview,
        financials: a.financials || prev.financials,
        banking: a.banking || prev.banking,
        ratios: a.ratios || prev.ratios,
        positives: (a.positives || []).join("\n"),
        concerns: (a.concerns || []).join("\n"),
        flags: a.flags || [],
        indicative_eligibility: a.indicative_eligibility || 0,
        analyst_comments: a.analyst_comments || "",
        recommendation: a.recommendation || "",
      }));
    });
  }, [c.case_uid]);

  const suggestions = useMemo(
    () => buildSuggestions(f, { bureauScore, docPct: c.documentation_pct }),
    [f, bureauScore, c.documentation_pct]
  );
  const pendingSuggestions = useMemo(() => {
    const existingTitles = new Set(f.flags.map(x => x.title));
    return suggestions.filter(s => !existingTitles.has(s.title));
  }, [suggestions, f.flags]);

  const acceptSuggestion = (s) => {
    setF(prev => ({ ...prev, flags: [...prev.flags, { level: s.level, title: s.title, id: Date.now() + Math.random() }] }));
  };
  const acceptAll = () => {
    setF(prev => {
      const existing = new Set(prev.flags.map(x => x.title));
      const additions = pendingSuggestions
        .filter(s => !existing.has(s.title))
        .map(s => ({ level: s.level, title: s.title, id: Date.now() + Math.random() }));
      return { ...prev, flags: [...prev.flags, ...additions] };
    });
  };

  const addFlag = () => {
    if (!flagForm.title.trim()) return;
    setF({ ...f, flags: [...f.flags, { ...flagForm, id: Date.now() + Math.random() }] });
    setFlagForm({ level: "green", title: "" });
  };
  const removeFlag = (id) => setF({ ...f, flags: f.flags.filter(x => x.id !== id) });

  const save = async () => {
    const payload = {
      overview: f.overview, financials: f.financials, banking: f.banking, ratios: f.ratios,
      positives: f.positives.split("\n").map(s => s.trim()).filter(Boolean),
      concerns: f.concerns.split("\n").map(s => s.trim()).filter(Boolean),
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

  return (
    <div className="space-y-4" data-testid="cam-form">
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3 gap-3">
          <div>
            <h3 className="font-display font-semibold text-base">Credit Assessment (CAM-Lite)</h3>
            <p className="text-xs text-slate-500">All fields save to a single, versioned credit snapshot. Final recommendation must be attributable.</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={`${API_BASE}/cases/${c.case_uid}/cam.pdf`} target="_blank" rel="noreferrer"
               data-testid="cam-pdf-btn"
               className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-slate-300 text-sm text-slate-700 hover:border-[#FF6B4E] hover:text-[#FF6B4E]">
              <Download size={14}/>Print PDF
            </a>
            <Button className="bg-slate-900 hover:bg-slate-800" onClick={save} data-testid="cam-save-btn">
              <FileText size={14} className="mr-1"/>Save Assessment
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <Snapshot label="Requested" v={inr(c.requirement)}/>
          <Snapshot label="Product" v={humanize(c.product)}/>
          <Snapshot label="Bureau Score" v={bureauScore || "—"} tone={bureauScore ? bureauTone : null}/>
          <Snapshot label="Doc Completeness" v={`${c.documentation_pct}%`}
                    tone={c.documentation_pct >= 80 ? "green" : c.documentation_pct >= 50 ? "amber" : "red"}/>
        </div>
      </div>

      {/* Auto flag suggestions */}
      {pendingSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-white border border-amber-200 rounded-lg p-4" data-testid="cam-suggestions">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sparkles size={16}/>
              </div>
              <div>
                <div className="font-display font-semibold text-slate-900 text-sm">
                  {pendingSuggestions.length} auto-flag {pendingSuggestions.length === 1 ? "suggestion" : "suggestions"}
                </div>
                <div className="text-[11px] text-slate-500">Derived from ratios, banking, bureau &amp; docs. Accept individually or all at once.</div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={acceptAll} data-testid="cam-accept-all-btn">
              <Plus size={13} className="mr-1"/>Accept all
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {pendingSuggestions.map(s => (
              <div key={s.key}
                   className={`flex items-center justify-between border rounded-md p-2.5 ${FLAG_TONES[s.level]}`}
                   data-testid={`cam-suggestion-${s.key}`}>
                <div className="flex items-center gap-2 min-w-0">
                  {s.level === "green" ? <CheckCircle2 size={16}/> : s.level === "amber" ? <AlertTriangle size={16}/> : <ShieldAlert size={16}/>}
                  <span className="text-sm truncate">{s.title}</span>
                </div>
                <button onClick={() => acceptSuggestion(s)}
                        className="text-xs font-semibold opacity-90 hover:opacity-100 shrink-0 ml-3">
                  Accept →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Section title="Business overview">
        <Row><F l="Industry" v={f.overview.industry} onChange={v => setF({ ...f, overview: { ...f.overview, industry: v } })}/></Row>
        <Row>
          <F l="Turnover (₹)" v={f.overview.turnover} type="number" onChange={v => setF({ ...f, overview: { ...f.overview, turnover: v } })}/>
          <F l="Vintage (yrs)" v={f.overview.vintage_years} type="number" onChange={v => setF({ ...f, overview: { ...f.overview, vintage_years: v } })}/>
        </Row>
      </Section>

      <Section title="Financial performance">
        <Row>
          <F l="Revenue FY23" v={f.financials.revenue_fy23} type="number" onChange={v => setF({ ...f, financials: { ...f.financials, revenue_fy23: v } })}/>
          <F l="Revenue FY24" v={f.financials.revenue_fy24} type="number" onChange={v => setF({ ...f, financials: { ...f.financials, revenue_fy24: v } })}/>
          <F l="EBITDA %" v={f.financials.ebitda_pct} type="number" onChange={v => setF({ ...f, financials: { ...f.financials, ebitda_pct: v } })}/>
        </Row>
        <Row>
          <F l="PAT %" v={f.financials.pat_pct} type="number" onChange={v => setF({ ...f, financials: { ...f.financials, pat_pct: v } })}/>
          <F l="Net worth" v={f.financials.net_worth} type="number" onChange={v => setF({ ...f, financials: { ...f.financials, net_worth: v } })}/>
        </Row>
      </Section>

      <Section title="Banking analysis">
        <Row>
          <F l="Avg bank balance" v={f.banking.avg_balance} type="number" onChange={v => setF({ ...f, banking: { ...f.banking, avg_balance: v } })}/>
          <F l="Monthly credits" v={f.banking.monthly_credits} type="number" onChange={v => setF({ ...f, banking: { ...f.banking, monthly_credits: v } })}/>
          <F l="Cheque returns" v={f.banking.cheque_returns} type="number" onChange={v => setF({ ...f, banking: { ...f.banking, cheque_returns: v } })}/>
          <F l="Cash deposits %" v={f.banking.cash_deposits_pct} type="number" onChange={v => setF({ ...f, banking: { ...f.banking, cash_deposits_pct: v } })}/>
        </Row>
      </Section>

      <Section title="Key ratios">
        <Row>
          <RatioF l="Current ratio" k="current" v={f.ratios.current} onChange={v => setF({ ...f, ratios: { ...f.ratios, current: v } })}/>
          <RatioF l="Debt / Equity" k="debt_equity" v={f.ratios.debt_equity} onChange={v => setF({ ...f, ratios: { ...f.ratios, debt_equity: v } })}/>
          <RatioF l="TOL / TNW" k="tol_tnw" v={f.ratios.tol_tnw} onChange={v => setF({ ...f, ratios: { ...f.ratios, tol_tnw: v } })}/>
        </Row>
        <Row>
          <RatioF l="Debt / EBITDA" k="debt_ebitda" v={f.ratios.debt_ebitda} onChange={v => setF({ ...f, ratios: { ...f.ratios, debt_ebitda: v } })}/>
          <RatioF l="DSCR" k="dscr" v={f.ratios.dscr} onChange={v => setF({ ...f, ratios: { ...f.ratios, dscr: v } })}/>
          <RatioF l="FOIR (%)" k="foir" v={f.ratios.foir} onChange={v => setF({ ...f, ratios: { ...f.ratios, foir: v } })}/>
        </Row>
      </Section>

      <div className="grid grid-cols-2 gap-4">
        <Section title="Key positives (one per line)">
          <Textarea rows={5} value={f.positives} onChange={e => setF({ ...f, positives: e.target.value })}
                    placeholder={"Strong revenue growth\nDiverse customer base\nZero DPD in 24 months"}
                    data-testid="cam-positives"/>
        </Section>
        <Section title="Key concerns (one per line)">
          <Textarea rows={5} value={f.concerns} onChange={e => setF({ ...f, concerns: e.target.value })}
                    placeholder={"High concentration risk\nDirectors' guarantees pending"}
                    data-testid="cam-concerns"/>
        </Section>
      </div>

      <Section title="Credit flags">
        <div className="flex gap-2 items-end mb-3">
          <div className="w-40">
            <Label className="text-xs">Level</Label>
            <Select value={flagForm.level} onValueChange={v => setFlagForm({ ...flagForm, level: v })}>
              <SelectTrigger data-testid="cam-flag-level"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="amber">Amber</SelectItem>
                <SelectItem value="red">Red</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="text-xs">Title</Label>
            <Input value={flagForm.title} onChange={e => setFlagForm({ ...flagForm, title: e.target.value })}
                   placeholder="e.g. Related-party revenue > 20%" data-testid="cam-flag-title"/>
          </div>
          <Button variant="outline" onClick={addFlag} data-testid="cam-add-flag-btn">Add flag</Button>
        </div>
        <div className="space-y-2">
          {f.flags.map((fl, i) => {
            const key = fl.id ?? `flag-${i}-${fl.title}`;
            return (
              <div key={key} className={`flex items-center justify-between border rounded-md p-2.5 ${FLAG_TONES[fl.level] || "bg-slate-50 border-slate-200 text-slate-700"}`}
                   data-testid={`cam-flag-${fl.id || i}`}>
                <div className="flex items-center gap-2">
                  {fl.level === "green" ? <CheckCircle2 size={16}/> : fl.level === "amber" ? <AlertTriangle size={16}/> : <ShieldAlert size={16}/>}
                  <span className="text-sm">{fl.title || "(untitled flag)"}</span>
                </div>
                <button className="text-xs opacity-70 hover:opacity-100" onClick={() => removeFlag(fl.id)}>Remove</button>
              </div>
            );
          })}
          {f.flags.length === 0 && (
            <div className="text-xs text-slate-500">No flags yet — add green/amber/red flags, or accept auto-suggestions above.</div>
          )}
        </div>
      </Section>

      <Section title="Recommendation">
        <Row>
          <F l="Indicative eligibility (₹)" v={f.indicative_eligibility} type="number"
             onChange={v => setF({ ...f, indicative_eligibility: v })}/>
          <div className="col-span-2">
            <Label className="text-xs">Recommendation</Label>
            <Select value={f.recommendation} onValueChange={v => setF({ ...f, recommendation: v })}>
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
        <div className="mt-3">
          <Label className="text-xs">Analyst comments</Label>
          <Textarea rows={4} value={f.analyst_comments} onChange={e => setF({ ...f, analyst_comments: e.target.value })}
                    placeholder="Free-form observations, structuring notes, mitigants." data-testid="cam-comments"/>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h4 className="font-display text-sm font-semibold mb-3">{title}</h4>
      {children}
    </div>
  );
}
function Row({ children }) { return <div className="grid grid-cols-3 gap-3 mb-2 last:mb-0">{children}</div>; }
function F({ l, v, onChange, type = "text" }) {
  return (
    <div>
      <Label className="text-xs">{l}</Label>
      <Input type={type} value={v ?? ""} onChange={e => onChange(e.target.value)}/>
    </div>
  );
}
function RatioF({ l, k, v, onChange }) {
  const tone = ratioTone(k, v);
  const hint = RATIO_THRESHOLDS[k]?.hint;
  return (
    <div>
      <Label className="text-xs">{l}</Label>
      <Input type="number" step="0.01" value={v ?? ""}
             className={tone ? RATIO_INPUT_TONE[tone] : ""}
             onChange={e => onChange(e.target.value)}
             data-testid={`ratio-${k}`}/>
      {hint && <div className="text-[10px] text-slate-500 mt-0.5">{hint}</div>}
    </div>
  );
}
function Snapshot({ label, v, tone }) {
  const tones = { green: "text-emerald-700", amber: "text-amber-700", red: "text-red-700" };
  return (
    <div className="border border-slate-200 rounded-md p-3">
      <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
      <div className={`text-lg font-display font-semibold num mt-1 ${tone ? tones[tone] : "text-slate-900"}`}>{v}</div>
    </div>
  );
}
