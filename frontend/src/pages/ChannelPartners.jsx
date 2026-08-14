import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { inr, humanize } from "@/lib/format";
import { usePermissions } from "@/lib/perms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Users, TrendingUp, Wallet, AlertTriangle,
  Search, Trophy, Check, ChevronRight, Play, UserPlus, ArrowLeft, ArrowRight,
} from "lucide-react";

const KPI_STYLES = {
  partners:   { icon: Users,          tint: "#E4F1FB", accent: "#3287D6" },
  disb:       { icon: TrendingUp,     tint: "#FFE4DE", accent: "#FF6B4E" },
  commission: { icon: Wallet,         tint: "#FFF7C2", accent: "#D89B00" },
  overdue:    { icon: AlertTriangle,  tint: "#FDECEA", accent: "#DC2A2A" },
};

function Kpi({ id, label, value, sub }) {
  const s = KPI_STYLES[id];
  const Icon = s.icon;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3" data-testid={`kpi-${id}`}>
      <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ background: s.tint, color: s.accent }}>
        <Icon size={20}/>
      </div>
      <div className="min-w-0">
        <div className="text-[10.5px] uppercase tracking-widest font-semibold text-slate-500">{label}</div>
        <div className="font-display text-lg font-bold num text-slate-900 leading-tight truncate">{value}</div>
        {sub && <div className="text-[11px] text-slate-500 truncate">{sub}</div>}
      </div>
    </div>
  );
}

function AttainmentBar({ pct }) {
  if (pct === null || pct === undefined) return <span className="text-xs text-slate-400">No target</span>;
  const capped = Math.min(pct, 100);
  const tone = pct >= 90 ? "#0F9F5F" : pct >= 60 ? "#D89B00" : "#DC2A2A";
  const label = pct > 100 ? `100%+ · target ${pct.toFixed(0)}% met` : `${pct.toFixed(1)}%`;
  return (
    <div className="w-full">
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${capped}%`, background: tone }}/>
      </div>
      <div className="text-[11px] font-semibold mt-1 num" style={{ color: tone }}>{label}</div>
    </div>
  );
}

function Sparkline({ series = [], labels = [] }) {
  const max = Math.max(...series, 1);
  const w = 220, h = 60, pad = 6;
  const step = series.length > 1 ? (w - pad * 2) / (series.length - 1) : 0;
  const pts = series.map((v, i) => `${pad + i * step},${h - pad - (v / max) * (h - pad * 2)}`).join(" ");
  return (
    <div>
      <svg width={w} height={h} className="block">
        <polyline points={pts} fill="none" stroke="#FF6B4E" strokeWidth="2" strokeLinejoin="round"/>
        {series.map((v, i) => (
          <circle key={i} cx={pad + i * step} cy={h - pad - (v / max) * (h - pad * 2)} r="2.5" fill="#FF6B4E"/>
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 num">
        {labels.map(l => <span key={l}>{l.slice(2)}</span>)}
      </div>
    </div>
  );
}

function PartnerDetail({ partner, onClose, onSaveTarget, canEditTarget = true }) {
  const [target, setTarget] = useState(partner.monthly_target || 0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSaveTarget(partner.partner_uid, Number(target) || 0);
      toast.success("Target updated");
    } catch { toast.error("Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={!!partner} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl" data-testid="partner-detail-modal">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-slate-900 flex items-center gap-3">
            {partner.name}
            <span className="text-[10.5px] uppercase tracking-widest bg-slate-100 text-slate-600 px-2 py-1 rounded font-semibold">{partner.channel_code}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Performance rollup, disbursement trend, and monthly target for this channel partner.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-3 mt-2">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[10.5px] uppercase tracking-widest font-semibold text-slate-500">MTD Disbursement</div>
            <div className="font-display text-lg font-bold num text-slate-900">{inr(partner.disbursed_mtd)}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[10.5px] uppercase tracking-widest font-semibold text-slate-500">Cases</div>
            <div className="font-display text-lg font-bold num text-slate-900">{partner.cases}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <div className="text-[10.5px] uppercase tracking-widest font-semibold text-slate-500">Commission MTD</div>
            <div className="font-display text-lg font-bold num text-slate-900">{inr(partner.commission_mtd)}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 mt-3">
          <div className="text-[10.5px] uppercase tracking-widest font-semibold text-slate-500 mb-1">Disbursement trend · last 6 months</div>
          <Sparkline series={partner.trend_disbursed} labels={partner.trend_labels}/>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 mt-3">
          <div>
            <div className="text-[10.5px] uppercase tracking-widest font-semibold text-slate-500">Monthly disbursement target</div>
            <div className="text-xs text-slate-500 mb-3">Drives attainment % on the leaderboard.</div>
          </div>
          <div className="mb-3">
            <AttainmentBar pct={partner.attainment_pct}/>
          </div>
          <div className="flex items-center gap-2">
            <Input type="number" value={target} onChange={e => setTarget(e.target.value)}
                   disabled={!canEditTarget}
                   className="max-w-xs" data-testid="partner-target-input"/>
            <Button onClick={save} disabled={saving || !canEditTarget}
                    className="bg-[#0B1F3A] hover:bg-[#081733]" data-testid="save-target-btn">
              <Check size={14} className="mr-1"/>Save target
            </Button>
          </div>
          {!canEditTarget && <div className="text-[11px] text-slate-500 mt-2">You don&apos;t have permission to edit targets — ask an admin.</div>}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2">
          <div><span className="text-slate-400">Email · </span>{partner.email || "—"}</div>
          <div><span className="text-slate-400">Mobile · </span>{partner.mobile || "—"}</div>
          <div><span className="text-slate-400">City · </span>{partner.city || "—"}</div>
          <div><span className="text-slate-400">Products · </span>{(partner.products || []).map(humanize).join(", ") || "—"}</div>
          <div><span className="text-slate-400">Overdue payout · </span><span className="font-semibold text-red-700 num">{inr(partner.commission_overdue)}</span></div>
          <div><span className="text-slate-400">Commission payable · </span><span className="font-semibold num">{inr(partner.commission_payable)}</span></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ChannelPartners() {
  const [perf, setPerf] = useState(null);
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const perms = usePermissions();
  const nav = useNavigate();

  const load = () => api.get("/partners/performance").then(r => setPerf(r.data)).catch(() => toast.error("Failed to load partners"));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!perf) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return perf.rows;
    return perf.rows.filter(r =>
      (r.name || "").toLowerCase().includes(needle) ||
      (r.channel_code || "").toLowerCase().includes(needle) ||
      (r.city || "").toLowerCase().includes(needle) ||
      (r.partner_uid || "").toLowerCase().includes(needle)
    );
  }, [perf, q]);

  const top5 = useMemo(() => (perf?.rows || []).slice(0, 5), [perf]);

  const saveTarget = async (uid, target) => {
    await api.patch(`/channel-partners/${uid}`, { monthly_target: target });
    load();
    if (detail && detail.partner_uid === uid) {
      setDetail(d => ({ ...d, monthly_target: target }));
    }
  };

  const releaseCommissions = async () => {
    if (!window.confirm("Release all approved / accrued commissions into a Finance-ready payout batch?")) return;
    setReleasing(true);
    try {
      const { data } = await api.post("/payouts/run-now");
      if (!data.batch_id) {
        toast.info("No eligible commissions to batch this period.");
      } else {
        toast.success(`Batch ${data.batch_id} prepared — ₹${(data.total_amount || 0).toLocaleString("en-IN")}`);
        nav(`/payouts?batch=${data.batch_id}`);
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Release failed — check permissions");
    } finally {
      setReleasing(false);
    }
  };

  if (!perf) {
    return <div className="p-6 text-sm text-slate-500" data-testid="partners-loading">Loading partner performance…</div>;
  }

  return (
    <div className="space-y-5" data-testid="partners-page">
      {/* Header */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Channel Partners</h1>
          <p className="text-sm text-slate-500">Performance · Targets · Commission payouts · <span className="font-semibold text-slate-700">{perf.period}</span></p>
        </div>
        <div className="flex items-center gap-2">
          {perms.has("create_partner") && (
            <Button variant="outline" onClick={() => setWizardOpen(true)} data-testid="new-partner-btn">
              <UserPlus size={14} className="mr-1"/>New partner
            </Button>
          )}
          {perms.has("release_commissions") && (
            <Button onClick={releaseCommissions} disabled={releasing}
                    className="bg-[#FF6B4E] hover:bg-[#E85A3D] text-white"
                    data-testid="release-commissions-btn">
              <Play size={14} className="mr-1"/>{releasing ? "Releasing…" : "Release commissions"}
            </Button>
          )}
          <div className="relative w-64">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
            <Input placeholder="Search partners…" value={q} onChange={e => setQ(e.target.value)}
                   className="pl-8" data-testid="partner-search"/>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="partner-kpis">
        <Kpi id="partners"   label="Active Partners"     value={`${perf.kpis.active_partners}`} sub={`${perf.kpis.total_partners} total on-boarded`}/>
        <Kpi id="disb"       label="MTD Disbursement"    value={inr(perf.kpis.mtd_disbursement)}    sub={`In ${perf.period}`}/>
        <Kpi id="commission" label="MTD Commission Accrued" value={inr(perf.kpis.mtd_commission_accrued)} sub="Across all partners"/>
        <Kpi id="overdue"    label="Overdue Payouts"     value={inr(perf.kpis.overdue_payouts)}     sub="Accrued > 45 days"/>
      </div>

      {/* Leaderboard */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5" data-testid="partner-leaderboard">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFF7C2] text-[#D89B00] flex items-center justify-center">
              <Trophy size={16}/>
            </div>
            <div>
              <div className="font-display font-bold text-slate-900">Top partners this month</div>
              <div className="text-[11px] text-slate-500">By disbursement</div>
            </div>
          </div>
          <div className="space-y-2">
            {top5.map((r, i) => (
              <button key={r.partner_uid} onClick={() => setDetail(r)}
                      className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition"
                      data-testid={`top-partner-${i}`}>
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-display text-xs font-bold flex items-center justify-center">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{r.name}</div>
                  <div className="text-[11px] text-slate-500 num">{inr(r.disbursed_mtd)} · {r.cases} cases</div>
                </div>
                <ChevronRight size={14} className="text-slate-400"/>
              </button>
            ))}
            {top5.length === 0 && <div className="text-xs text-slate-500 p-2">No disbursement this month yet.</div>}
          </div>
        </div>

        {/* All partners */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-slate-900">All partners</div>
              <div className="text-[11px] text-slate-500">{filtered.length} of {perf.rows.length}</div>
            </div>
          </div>
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full dense-table">
              <thead className="sticky top-0 bg-white z-10">
                <tr>
                  <th>Partner</th>
                  <th className="num-cell">Cases</th>
                  <th className="num-cell">Disb MTD</th>
                  <th className="num-cell">Target</th>
                  <th style={{ minWidth: 120 }}>Attainment</th>
                  <th className="num-cell">Payable</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.partner_uid} className="hover:bg-slate-50 cursor-pointer" onClick={() => setDetail(r)} data-testid={`partner-row-${r.partner_uid}`}>
                    <td>
                      <div className="font-semibold text-sm text-slate-900">{r.name}</div>
                      <div className="text-[11px] text-slate-500 mono">{r.channel_code} · {r.city || "—"}</div>
                    </td>
                    <td className="num-cell">{r.cases}</td>
                    <td className="num-cell font-semibold">{inr(r.disbursed_mtd)}</td>
                    <td className="num-cell">{r.monthly_target ? inr(r.monthly_target) : <span className="text-slate-400">—</span>}</td>
                    <td><AttainmentBar pct={r.attainment_pct}/></td>
                    <td className="num-cell">{inr(r.commission_payable)}</td>
                    <td><ChevronRight size={14} className="text-slate-400"/></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-sm text-slate-500">No partners match &ldquo;{q}&rdquo;.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Need to release commission?{" "}
        <a href="/payouts" className="text-[#FF6B4E] hover:text-[#0B1F3A] font-semibold">Go to Payouts →</a>
      </div>

      {detail && <PartnerDetail partner={detail} onClose={() => setDetail(null)} onSaveTarget={saveTarget} canEditTarget={perms.has("edit_partner_target")}/>}
      {wizardOpen && <PartnerWizard onClose={() => setWizardOpen(false)} onCreated={() => { setWizardOpen(false); load(); }}/>}
    </div>
  );
}

function PartnerWizard({ onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", entity_name: "", pan: "", gst: "",
    mobile: "", email: "", city: "", state: "",
    products: [], geography: [],
    commission_structure: { default_pct: 1.0 },
    monthly_target: 0,
  });

  const canNext =
    step === 1 ? form.name.trim() && form.mobile.trim() && form.email.trim() :
    step === 2 ? form.products.length > 0 :
    true;

  const toggle = (key, val) => setForm(f => ({
    ...f,
    [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val],
  }));

  const submit = async () => {
    setSaving(true);
    try {
      const { data } = await api.post("/channel-partners", form);
      if (form.monthly_target > 0) {
        await api.patch(`/channel-partners/${data.partner_uid}`, { monthly_target: Number(form.monthly_target) });
      }
      toast.success(`${data.name} onboarded (${data.channel_code})`);
      onCreated?.();
    } catch (e) { toast.error(e.response?.data?.detail || "Onboarding failed"); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl" data-testid="partner-wizard">
        <DialogHeader>
          <DialogTitle>Onboard channel partner</DialogTitle>
          <DialogDescription className="text-xs">
            Step {step} of 3 — {step === 1 ? "KYC" : step === 2 ? "Products & geography" : "Commission & target"}.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 mt-1 mb-3">
          {[1, 2, 3].map(n => (
            <div key={n} className={`flex-1 h-1.5 rounded-full ${step >= n ? "bg-[#FF6B4E]" : "bg-slate-200"}`}/>
          ))}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3" data-testid="wizard-step-1">
            <Field label="Name (individual / firm) *"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} data-testid="wiz-name"/></Field>
            <Field label="Entity name"><Input value={form.entity_name} onChange={e => setForm({ ...form, entity_name: e.target.value })}/></Field>
            <Field label="PAN"><Input value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value.toUpperCase() })} className="mono"/></Field>
            <Field label="GSTIN"><Input value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value.toUpperCase() })} className="mono"/></Field>
            <Field label="Mobile *"><Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} data-testid="wiz-mobile"/></Field>
            <Field label="Email *"><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} data-testid="wiz-email"/></Field>
            <Field label="City"><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}/></Field>
            <Field label="State"><Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}/></Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3" data-testid="wizard-step-2">
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">Products they source</div>
              <div className="flex flex-wrap gap-2">
                {["home_loan","business_loan","lap","personal_loan","working_capital","term_loan","cc_od","equipment_finance","project_finance"].map(p => (
                  <button key={p} onClick={() => toggle("products", p)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${form.products.includes(p) ? "bg-[#FF6B4E] border-[#FF6B4E] text-white" : "border-slate-300 text-slate-600 hover:border-[#FF6B4E]"}`}
                          data-testid={`wiz-product-${p}`}>
                    {humanize(p)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">Geography</div>
              <div className="flex flex-wrap gap-2">
                {["Delhi NCR","Mumbai","Bangalore","Chennai","Ahmedabad","Kolkata","Hyderabad","Pune","Pan-India"].map(g => (
                  <button key={g} onClick={() => toggle("geography", g)}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${form.geography.includes(g) ? "bg-slate-900 border-slate-900 text-white" : "border-slate-300 text-slate-600 hover:border-slate-500"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-2 gap-3" data-testid="wizard-step-3">
            <Field label="Default commission %">
              <Input type="number" step="0.05" value={form.commission_structure.default_pct}
                     onChange={e => setForm({ ...form, commission_structure: { ...form.commission_structure, default_pct: Number(e.target.value) } })}
                     data-testid="wiz-commission-pct"/>
            </Field>
            <Field label="Monthly disbursement target (₹)">
              <Input type="number" value={form.monthly_target}
                     onChange={e => setForm({ ...form, monthly_target: Number(e.target.value) })}
                     data-testid="wiz-target"/>
            </Field>
            <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-600">
              <div className="font-semibold text-slate-700 mb-1">Ready to onboard</div>
              {form.name} · {form.products.length} products · target {form.monthly_target > 0 ? inr(form.monthly_target) : "not set"} · commission {form.commission_structure.default_pct}%.
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <Button variant="outline" onClick={() => (step === 1 ? onClose() : setStep(step - 1))} data-testid="wiz-back">
            <ArrowLeft size={13} className="mr-1"/>{step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext}
                    className="bg-[#0B1F3A] hover:bg-[#081733]" data-testid="wiz-next">
              Next<ArrowRight size={13} className="ml-1"/>
            </Button>
          ) : (
            <Button onClick={submit} disabled={saving} className="bg-[#FF6B4E] hover:bg-[#E85A3D] text-white"
                    data-testid="wiz-submit">
              <Check size={13} className="mr-1"/>{saving ? "Onboarding…" : "Onboard partner"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }) {
  return <div><Label className="text-xs text-slate-600">{label}</Label>{children}</div>;
}
