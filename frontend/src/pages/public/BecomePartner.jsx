import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2, Users, TrendingUp, Wallet, IndianRupee, Handshake, Calculator } from "lucide-react";

const PRODUCT_OPTIONS = [
  "Home Loan", "Personal Loan", "Business Loan", "LAP",
  "Working Capital", "Term Loan", "CC/OD", "Equipment Finance",
  "Project Finance", "Loan Against Securities",
];

export default function BecomePartner() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "", mobile: "", email: "", city: "", state: "",
    current_business: "", expected_volume: "10-25 L",
    products: [], message: "",
  });
  const [saving, setSaving] = useState(false);

  const [calc, setCalc] = useState({ product: "Business Loan", monthly_disb: 5000000, rate: 1.5 });
  const monthlyEarn = useMemo(() => (calc.monthly_disb * calc.rate) / 100, [calc]);
  const yearlyEarn = monthlyEarn * 12;

  const toggle = (arr, val) => arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const submit = async () => {
    if (!form.name || !form.mobile) { toast.error("Name & mobile required"); return; }
    setSaving(true);
    try {
      const { data } = await api.post("/public/become-partner", form);
      toast.success(`Application received (${data.application_id}) — our team will call within 24 hours.`);
      nav("/apply/thanks?partner=" + data.application_id);
    } catch (e) { toast.error(e.response?.data?.detail || "Something went wrong"); }
    finally { setSaving(false); }
  };

  return (
    <div className="text-[#0B1F3A]" data-testid="become-partner-page">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1F3A] via-[#132D5C] to-[#1B3A6B] text-white py-16 lg:py-24">
        <div className="absolute -right-32 -top-24 w-[500px] h-[500px] rounded-full bg-[#FFD84D]/15 blur-3xl"/>
        <div className="absolute -left-32 bottom-0 w-[400px] h-[400px] rounded-full bg-[#FF6B4E]/15 blur-3xl"/>
        <div className="max-w-7xl mx-auto px-6 relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFD84D]/15 border border-[#FFD84D]/40 text-[10.5px] uppercase tracking-widest font-bold text-[#FFD84D]">
              <Handshake size={12}/>Grow with CorpZo
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 leading-[1.03]">
              Turn your relationships<br/>into <span className="text-[#FFD84D]">real income.</span>
            </h1>
            <p className="text-white/75 mt-5 text-lg max-w-xl">
              Join <b className="text-white">100,000+</b> DSAs and consultants who&apos;re earning best-in-market payouts by placing debt files through CorpZo&apos;s 120+ lender network.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
              {[
                {n:"2.5%", l:"Top payout",    c:"#FFD84D"},
                {n:"24h",  l:"Onboarding",    c:"#FF6B4E"},
                {n:"120+", l:"Lender access", c:"#4C9EEB"},
              ].map((s,i) => (
                <div key={i} className="text-center">
                  <div className="font-display text-3xl sm:text-4xl font-bold num leading-none" style={{color:s.c}}>{s.n}</div>
                  <div className="text-[10.5px] uppercase tracking-widest text-white/60 mt-1 font-semibold">{s.l}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#apply" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#FF6B4E] hover:bg-[#E85A3D] text-white font-bold" data-testid="hero-apply-partner-btn">
                Apply to partner<ArrowRight size={15}/>
              </a>
              <a href="#calculator" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold">
                <Calculator size={15}/>Earnings calculator
              </a>
            </div>
          </div>

          {/* Right — Benefits card */}
          <div className="bg-white/5 backdrop-blur border border-white/15 rounded-2xl p-6 md:p-8">
            <div className="text-[10.5px] uppercase tracking-widest text-[#FFD84D] font-bold">Why partner with us</div>
            <div className="font-display text-2xl font-bold text-white mt-1">Everything a DSA needs — in one login.</div>
            <div className="mt-5 space-y-3">
              {[
                {t:"Best-in-market payouts",  s:"Up to 2.5% on sanctioned amount — paid monthly, no cap."},
                {t:"120+ lenders, one API",   s:"Access private banks, PSU banks, NBFCs, SFBs, HFCs — through a single login."},
                {t:"Real credit team behind you", s:"Ex-bankers structure your case: CMA, projections, DPRs, valuations."},
                {t:"Digital agreement + KYC",  s:"Onboarding in 24 hours. No paper. No branch visits."},
                {t:"Live pipeline & payouts",  s:"Track every lead → sanction → disbursal → commission in one dashboard."},
                {t:"Dedicated RM",             s:"A named CorpZo relationship manager for you from day one."},
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-[#22C55E]/25 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={14}/>
                  </div>
                  <div>
                    <div className="text-sm font-display font-bold text-white">{p.t}</div>
                    <div className="text-xs text-white/70">{p.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <div className="text-[10.5px] uppercase tracking-widest text-[#FF6B4E] font-bold">How partnering works</div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] mt-1">From KYC to your first payout — in 4 steps.</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            {n:"01", t:"Apply",      d:"Fill this form. Our channel-manager team calls you in 24 hours."},
            {n:"02", t:"Onboard",    d:"Digital KYC, agreement, welcome kit — no paperwork."},
            {n:"03", t:"Refer",      d:"Push files through the CorpZo partner dashboard or WhatsApp your RM."},
            {n:"04", t:"Get paid",   d:"Auto-tracked payouts. Batched and paid to your bank every month."},
          ].map((s, i) => (
            <div key={i} className="relative bg-white border border-[#0B1F3A]/10 rounded-2xl p-5 hover:border-[#FF6B4E]/50 hover:-translate-y-1 transition">
              <div className="font-display text-4xl font-black text-[#FF6B4E]/25 leading-none">{s.n}</div>
              <div className="font-display font-bold text-lg text-[#0B1F3A] mt-3">{s.t}</div>
              <div className="text-sm text-[#0B1F3A]/65 mt-1">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="bg-[#F7F5EE] py-16 border-y border-[#0B1F3A]/10">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-[10.5px] uppercase tracking-widest text-[#FF6B4E] font-bold">Earnings calculator</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] mt-1">See what your files could earn.</h2>
            <p className="text-[#0B1F3A]/70 mt-3">Change the monthly volume and average payout %. This is indicative — actual payouts depend on product, lender, and sanction ratio.</p>

            <div className="mt-6 bg-white border border-[#0B1F3A]/10 rounded-xl p-6 space-y-5">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#0B1F3A]/70">Monthly disbursement volume</span>
                  <span className="num font-bold text-[#0B1F3A]">{inr(calc.monthly_disb)}</span>
                </div>
                <input type="range" min={500000} max={100000000} step={500000}
                       value={calc.monthly_disb}
                       onChange={e => setCalc({ ...calc, monthly_disb: Number(e.target.value) })}
                       className="w-full accent-[#FF6B4E]"
                       data-testid="calc-volume"/>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#0B1F3A]/70">Average payout %</span>
                  <span className="num font-bold text-[#0B1F3A]">{calc.rate.toFixed(2)}%</span>
                </div>
                <input type="range" min={0.5} max={2.5} step={0.05}
                       value={calc.rate}
                       onChange={e => setCalc({ ...calc, rate: Number(e.target.value) })}
                       className="w-full accent-[#FF6B4E]"
                       data-testid="calc-rate"/>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0B1F3A] to-[#132D5C] rounded-2xl p-8 text-white">
            <div className="text-[10.5px] uppercase tracking-widest text-[#FFD84D] font-bold">Your indicative earnings</div>
            <div className="grid grid-cols-2 gap-6 mt-4">
              <div>
                <div className="text-[10.5px] uppercase tracking-widest text-white/60 font-semibold">Monthly</div>
                <div className="font-display text-4xl font-bold num text-[#FFD84D] mt-1" data-testid="calc-monthly">{inr(monthlyEarn)}</div>
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-widest text-white/60 font-semibold">Yearly</div>
                <div className="font-display text-4xl font-bold num text-[#FF9F5A] mt-1" data-testid="calc-yearly">{inr(yearlyEarn)}</div>
              </div>
            </div>
            <div className="mt-6 space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2"><Wallet size={14} className="text-[#FFD84D]"/>Paid to your registered bank account, monthly.</div>
              <div className="flex items-center gap-2"><TrendingUp size={14} className="text-[#FFD84D]"/>Grows with your team volume &amp; ticket-size mix.</div>
              <div className="flex items-center gap-2"><IndianRupee size={14} className="text-[#FFD84D]"/>Zero cost to join. Zero deductions except statutory TDS.</div>
            </div>
            <a href="#apply" className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#FF6B4E] hover:bg-[#E85A3D] text-white font-bold">
              Apply now<ArrowRight size={14}/>
            </a>
          </div>
        </div>
      </section>

      {/* Apply form */}
      <section id="apply" className="max-w-4xl mx-auto px-6 py-16" data-testid="partner-apply-form">
        <div className="text-center mb-8">
          <div className="text-[10.5px] uppercase tracking-widest text-[#FF6B4E] font-bold">Apply now</div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] mt-1">Start earning in 24 hours.</h2>
          <p className="text-[#0B1F3A]/65 mt-2">Tell us a bit about yourself. Our channel-manager team will call within 1 business day.</p>
        </div>
        <div className="bg-white border border-[#0B1F3A]/10 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label className="text-xs">Full name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} data-testid="partner-name"/></div>
            <div><Label className="text-xs">Mobile *</Label><Input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} data-testid="partner-mobile"/></div>
            <div><Label className="text-xs">Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} data-testid="partner-email"/></div>
            <div><Label className="text-xs">Current business</Label><Input placeholder="DSA / CA / consulting firm / individual"
                                                                          value={form.current_business} onChange={e => setForm({ ...form, current_business: e.target.value })}/></div>
            <div><Label className="text-xs">City</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}/></div>
            <div><Label className="text-xs">State</Label><Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}/></div>
            <div>
              <Label className="text-xs">Expected monthly disbursement</Label>
              <select value={form.expected_volume} onChange={e => setForm({ ...form, expected_volume: e.target.value })}
                      className="w-full h-10 mt-1 px-3 rounded-md border border-[#0B1F3A]/15 bg-white text-sm focus:outline-none focus:border-[#FF6B4E]"
                      data-testid="partner-volume">
                <option>Under ₹10 L</option>
                <option>10-25 L</option>
                <option>25-50 L</option>
                <option>50-100 L</option>
                <option>1-5 Cr</option>
                <option>5 Cr +</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Products you plan to refer</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRODUCT_OPTIONS.map(p => (
                  <button key={p} type="button" onClick={() => setForm({ ...form, products: toggle(form.products, p) })}
                          data-testid={`partner-product-${p.replace(/\s+/g,'-').toLowerCase()}`}
                          className={`px-3 py-1.5 rounded-full border text-xs font-medium transition ${form.products.includes(p) ? "bg-[#FF6B4E] border-[#FF6B4E] text-white" : "border-[#0B1F3A]/20 text-[#0B1F3A]/70 hover:border-[#FF6B4E]"}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Anything you&apos;d like us to know</Label>
              <Textarea rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                        placeholder="Team size, existing lender tie-ups, ticket-size range, etc."/>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-xs text-[#0B1F3A]/60 flex items-center gap-2">
              <Users size={13} className="text-[#FF6B4E]"/>Joined 100,000+ partners across 380+ cities
            </div>
            <Button onClick={submit} disabled={saving}
                    className="bg-[#0B1F3A] hover:bg-[#081733] text-white h-11 px-8"
                    data-testid="partner-submit-btn">
              {saving ? "Submitting…" : "Apply to partner"}<ArrowRight size={14} className="ml-1"/>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#F7F5EE] py-14 border-t border-[#0B1F3A]/10">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-2xl font-bold text-[#0B1F3A] text-center mb-6">Partner FAQ</h2>
          <div className="space-y-3">
            {[
              {q:"Is there a cost to become a partner?", a:"No. Onboarding is free and there are no monthly fees. You only pay statutory TDS on your payouts."},
              {q:"How soon do I start earning?", a:"After you complete KYC + sign the digital agreement (~24 hours), you can start referring files immediately. Payouts trigger on sanction of the loan."},
              {q:"Who owns the customer relationship?", a:"You do. CorpZo is your back-office — we run credit, documentation and lender liaison. The customer stays your customer."},
              {q:"Can I refer files from any state in India?", a:"Yes. We work with lenders that operate pan-India as well as region-specific specialists."},
              {q:"How are payouts calculated?", a:"On sanctioned amount, product-wise. Standard slab is 0.5–2.5%. Your dashboard shows accrued, batched and paid amounts in real time."},
            ].map((f, i) => (
              <div key={i} className="bg-white border border-[#0B1F3A]/10 rounded-lg p-4">
                <div className="font-display font-semibold text-sm text-[#0B1F3A]">{f.q}</div>
                <div className="text-sm text-[#0B1F3A]/70 mt-1">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
