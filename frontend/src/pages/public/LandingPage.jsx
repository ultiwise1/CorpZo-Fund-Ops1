import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, ShieldCheck, Zap, Award, Users, Star,
  Home, Briefcase, User, Building2, Factory, GraduationCap, Landmark, Coins,
  Percent, Clock, CheckCircle2, TrendingUp, PhoneCall, Truck, Cog, Layers, Gem
} from "lucide-react";
import { toast } from "sonner";
import ProductArt from "@/components/ProductArt";

/** urban-money style tinted background per backend product slug */
const PRODUCT_STYLE = {
  "home-loan":              { icon: Home,          tint: "#E0F5EC", accent: "#16A981" },
  "business-loan":          { icon: Briefcase,     tint: "#FFF3D6", accent: "#D89B00" },
  "lap":                    { icon: Building2,     tint: "#E4F1FB", accent: "#3287D6" },
  "personal-loan":          { icon: User,          tint: "#FCE7EA", accent: "#E24A6B" },
  "working-capital":        { icon: Coins,         tint: "#FFEFDA", accent: "#E37800" },
  "cc-od":                  { icon: Percent,       tint: "#F2E9FE", accent: "#8B5CF6" },
  "term-loan":              { icon: TrendingUp,    tint: "#DFF5F1", accent: "#0F8B7A" },
  "equipment-finance":      { icon: Cog,           tint: "#E9F1FF", accent: "#3357C1" },
  "project-finance":        { icon: Factory,       tint: "#FBE9DA", accent: "#D25E1F" },
  "construction-finance":   { icon: Building2,     tint: "#FDECD8", accent: "#C05621" },
  "supply-chain-finance":   { icon: Truck,         tint: "#E2F2FF", accent: "#1D8FE1" },
  "invoice-discounting":    { icon: Layers,        tint: "#F7E5F1", accent: "#B23B8A" },
  "loan-against-securities":{ icon: TrendingUp,    tint: "#FFF7C2", accent: "#B58900" },
  "structured-finance":     { icon: Landmark,      tint: "#E7EDE9", accent: "#0F3D2E" },
  "private-credit":         { icon: Gem,           tint: "#E1EDFD", accent: "#4C6FE1" },
};
const styleFor = (slug) => PRODUCT_STYLE[slug] || { icon: Coins, tint: "#F1F4F1", accent: "#1F5B4A" };

const TESTIMONIALS = [
  {name:"Anjali M.", role:"SME Founder, Pune",         quote:"Approved for ₹1.5 Cr in 9 days — CorpZo compared 6 lenders and negotiated the ROI down 90bps.", rating:5},
  {name:"Rohan K.", role:"Property investor, Mumbai",  quote:"LAP with 65% LTV. My RM was on WhatsApp every day until disbursal.",                              rating:5},
  {name:"Krishna Steel", role:"Manufacturing, Ahmedabad", quote:"They fixed our CMA and got working capital sanctioned in a single quarter.",                    rating:5},
];

const LENDER_LOGOS = ["HDFC","ICICI","AXIS","KOTAK","BAJAJ","TATA","ABF","PIRAMAL","INDUSIND","YES"];

const FAQS = [
  {q:"Is CorpZo a bank?", a:"No — we're a debt marketplace and credit consultancy. We work with 40+ RBI-regulated banks and NBFCs and structure your loan case for the best terms."},
  {q:"Do I pay to apply?", a:"No. Applications and lender comparisons are free. You only pay a success fee once your loan is sanctioned."},
  {q:"How fast is disbursal?", a:"Personal loans in 24–72 hours. Home/LAP typically 10–15 days. Business & structured deals 3–6 weeks depending on complexity."},
  {q:"Is my data safe?", a:"Every document is encrypted in our vault. Nothing is shared with a lender without your explicit consent."},
];

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", mobile: "", amount: 2500000, product: "" });
  const [emiForm, setEmiForm] = useState({ amount: 1000000, rate: 10.5, tenure: 60 });
  const [openFaq, setOpenFaq] = useState(0);
  const nav = useNavigate();

  useEffect(() => { api.get("/public/products").then(r => setProducts(r.data)); }, []);

  const monthlyEmi = useMemo(() => {
    const P = emiForm.amount, R = emiForm.rate/12/100, n = emiForm.tenure;
    if (!R || !n) return 0;
    return (P * R * Math.pow(1+R, n)) / (Math.pow(1+R, n) - 1);
  }, [emiForm]);
  const totalPayable = monthlyEmi * emiForm.tenure;
  const totalInterest = totalPayable - emiForm.amount;

  const submit = async () => {
    if (!form.name || !form.mobile) { toast.error("Name & mobile required"); return; }
    try {
      const { data } = await api.post("/public/apply", { ...form, product: form.product || "business-loan" });
      toast.success(`Application received (${data.lead_uid})`);
      nav("/apply/thanks?lead=" + data.lead_uid);
    } catch { toast.error("Something went wrong"); }
  };

  return (
    <div data-testid="landing-page" className="text-[#0F3D2E]">

      {/* ==================================================================== */}
      {/* HERO BANNER — CorpZo brand w/ Venturaz shapes + Urban Money cues       */}
      {/* Glass morphism + liquid morphism + neon highlights                     */}
      {/* ==================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0A2E24] via-[#0F3D2E] to-[#1F5B4A] text-white">
        {/* venturaz signature — concentric-circle motif */}
        <svg className="absolute -left-60 top-0 opacity-25" width="900" height="900" viewBox="0 0 900 900" fill="none">
          {[100,180,260,340,420,500].map(r => <circle key={r} cx="450" cy="450" r={r} stroke="#FFD84D" strokeWidth="0.5" strokeDasharray="2 8"/>)}
        </svg>
        {/* dot grid overlay */}
        <div className="absolute inset-0 bg-dot-grid opacity-40"/>

        {/* LIQUID MORPHISM BLOBS */}
        <div className="absolute -top-40 -right-40 w-[560px] h-[560px] bg-gradient-to-br from-[#DFFF3B]/40 to-[#00FFE1]/25 blur-3xl liquid-blob"/>
        <div className="absolute -bottom-56 left-1/4 w-[520px] h-[520px] bg-gradient-to-tr from-[#FFD84D]/30 to-[#16A981]/25 blur-3xl liquid-blob-2"/>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-[#C6FF3B]/10 blur-3xl liquid-blob-3"/>

        {/* smooth fade to page */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FAFAF7] to-transparent"/>

        {/* Floating ₹-coin motif */}
        <div className="absolute top-16 right-[40%] opacity-30 hidden lg:block" aria-hidden>
          {[
            {x:0,y:0,d:0},{x:60,y:40,d:1},{x:-40,y:80,d:2},{x:100,y:100,d:0.5},{x:20,y:180,d:1.5}
          ].map((c,i) => (
            <div key={i} className="absolute w-8 h-8 rounded-full border-2 border-[#FFD84D] flex items-center justify-center text-[#FFD84D] font-display font-bold"
              style={{left:`${c.x}px`, top:`${c.y}px`, animation:`float 4s ease-in-out ${c.d}s infinite`}}>₹</div>
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-24 grid lg:grid-cols-12 gap-10 items-center">
          {/* LEFT — copy */}
          <div className="lg:col-span-7">
            {/* Hello chat bubble — Urban Money signature */}
            <div className="inline-flex items-center gap-2 mb-4" data-testid="hero-hello-bubble">
              <div className="relative bg-[#DFFF3B] text-[#0F3D2E] px-3 py-1.5 rounded-2xl rounded-bl-sm font-display font-bold text-sm shadow-lg neon-glow">
                Hello, borrower!
                <span className="absolute -bottom-1 left-2 w-0 h-0 border-t-8 border-t-[#DFFF3B] border-l-8 border-l-transparent"/>
              </div>
              <div className="text-xs text-white/60">👋 We compare 40+ lenders for you</div>
            </div>

            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-widest neon-gold">
              <Zap size={12}/> India&apos;s verified debt marketplace
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[64px] font-bold mt-5 leading-[1.03] text-white">
              One application.<br/>
              <span className="neon-lime">40+ lenders.</span> <span className="whitespace-nowrap text-white">Best rate wins.</span>
            </h1>
            <p className="text-lg text-white/80 mt-5 max-w-xl">
              Compare offers from India&apos;s top banks &amp; NBFCs, get personalised quotes in minutes,
              and let CorpZo&apos;s credit team drive your case end-to-end.
              <span className="ml-1 inline-block px-2 py-0.5 rounded bg-[#DFFF3B]/15 border border-[#DFFF3B]/30 neon-lime font-semibold text-sm">Zero cost until sanction</span>
            </p>

            {/* Product chips — with live rate_from */}
            <div className="mt-8">
              <div className="text-[10.5px] uppercase tracking-widest text-white/50 mb-2">Popular products · rates from</div>
              <div className="flex flex-wrap gap-2" data-testid="hero-product-chips">
                {(products.slice(0,8)).map(p => {
                  const s = styleFor(p.slug);
                  const Icon = s.icon;
                  return (
                    <button key={p.slug} onClick={()=>nav(`/product/${p.slug}`)}
                      className="group inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/8 hover:bg-white/15 border border-white/15 hover:border-[#FFD84D]/60 text-sm text-white transition"
                      data-testid={`hero-chip-${p.slug}`}>
                      <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{background:s.tint, color:s.accent}}>
                        <Icon size={14} strokeWidth={2.4}/>
                      </span>
                      <span className="font-medium">{p.title}</span>
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#FFD84D]/20 text-[#FFD84D] text-[11px] font-bold num" data-testid={`hero-chip-rate-${p.slug}`}>{p.rate_from}%</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Button className="bg-[#DFFF3B] hover:bg-[#C6FF00] text-[#0F3D2E] font-bold h-12 px-7 shadow-lg neon-glow transition-all"
                      onClick={()=>nav("/products")} data-testid="hero-explore-btn">
                Explore all products<ArrowRight size={16} className="ml-1"/>
              </Button>
              <Button variant="outline" className="h-12 px-6 glass border-white/25 text-white hover:bg-white/15 hover:text-white"
                      onClick={()=>nav("/apply")} data-testid="hero-apply-btn">
                <PhoneCall size={15} className="mr-2"/>Get a call back
              </Button>
            </div>

            {/* Stat strip */}
            <div className="mt-10 grid grid-cols-4 gap-4 max-w-2xl">
              <Stat n="40+" l="Lender partners" c="#FFD84D"/>
              <Stat n="₹2,500 Cr+" l="Disbursed" c="#16A981"/>
              <Stat n="15" l="Debt products" c="#4C9EEB"/>
              <Stat n="4.8/5" l="Client rating" c="#FF9F5A"/>
            </div>
          </div>

          {/* RIGHT — glass quick apply card */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* neon liquid halo */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#DFFF3B]/40 to-[#00FFE1]/25 blur-2xl opacity-80 liquid-blob"/>
              <div className="relative glass-strong rounded-2xl border border-white/25 p-6 text-[#0F3D2E]" data-testid="hero-quick-apply"
                   style={{background:"linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))"}}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#16A981] animate-pulse"/>
                  <div className="text-[10.5px] uppercase tracking-widest text-[#16A981] font-bold">Instant call back</div>
                </div>
                <div className="font-display text-2xl font-bold">Tell us what you need</div>
                <div className="text-xs text-[#0F3D2E]/60 mt-1">Rates shared in under an hour on weekdays.</div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#0F3D2E]/70">I want a</label>
                    <select value={form.product} onChange={e=>setForm({...form, product:e.target.value})}
                      className="w-full h-10 mt-1 px-3 rounded-md border border-[#0F3D2E]/15 bg-white text-sm focus:outline-none focus:border-[#16A981]"
                      data-testid="hero-product-select">
                      <option value="">Pick a product…</option>
                      {products.map(p => <option key={p.slug} value={p.slug}>{p.title}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs font-semibold text-[#0F3D2E]/70">Your name</label>
                      <Input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} data-testid="hero-name" className="border-[#0F3D2E]/15 focus-visible:ring-[#16A981]"/></div>
                    <div><label className="text-xs font-semibold text-[#0F3D2E]/70">Mobile</label>
                      <Input value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})} data-testid="hero-mobile" className="border-[#0F3D2E]/15 focus-visible:ring-[#16A981]"/></div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#0F3D2E]/70">Amount required (₹)</label>
                    <Input type="number" value={form.amount} onChange={e=>setForm({...form, amount:Number(e.target.value)})} data-testid="hero-amount" className="border-[#0F3D2E]/15 focus-visible:ring-[#16A981]"/>
                    <div className="mt-1 text-sm num text-[#16A981] font-semibold">{inr(form.amount)}</div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#0F3D2E] to-[#1F5B4A] hover:from-[#0F3D2E] hover:to-[#0F3D2E] text-white h-11 font-semibold" onClick={submit} data-testid="hero-submit">
                    Get my personalised quote<ArrowRight size={16} className="ml-1"/>
                  </Button>
                  <div className="flex items-center gap-3 text-xs text-[#0F3D2E]/50 pt-1">
                    <div className="flex items-center gap-1"><ShieldCheck size={12} className="text-[#16A981]"/>No credit pull</div>
                    <div className="flex items-center gap-1"><Clock size={12} className="text-[#16A981]"/>Reply in &lt;1 hour</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust ribbon */}
        <div className="relative border-t border-white/10 bg-black/20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[10.5px] uppercase tracking-widest text-white/60">
            <span>🔒 KYC-Based Onboarding</span>·<span>40+ Verified Lenders</span>·<span>256-bit Encrypted Vault</span>·<span>ISO 27001 Practices</span>·<span>Zero Cost Until Sanction</span>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* PRODUCTS — urban-money colour-tinted tile grid                        */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-6 py-16" id="products">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#16A981] font-bold">Products</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F3D2E] mt-1">15 ways to finance your ambition</h2>
            <p className="text-[#0F3D2E]/60 mt-2 max-w-2xl">From ₹50k personal loans to ₹500 Cr structured deals — pick the product, we do the rest.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-[#16A981] hover:text-[#0F3D2E] flex items-center gap-1">View catalogue<ArrowRight size={14}/></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" data-testid="product-grid">
          {products.slice(0,10).map(p => {
            const s = styleFor(p.slug);
            return (
              <Link key={p.slug} to={`/product/${p.slug}`} data-testid={`product-card-${p.slug}`}
                    className="group relative bg-white rounded-2xl border border-[#0F3D2E]/8 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-transparent transition-all duration-200">
                <ProductArt slug={p.slug} tint={s.tint} accent={s.accent} size="md"/>
                <div className="p-5 pt-4">
                  <div className="font-display text-[15px] font-bold text-[#0F3D2E]">{p.title}</div>
                  <div className="text-[11px] text-[#0F3D2E]/55 mt-0.5 line-clamp-2 leading-snug">{p.tagline}</div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#0F3D2E]/8">
                    <div>
                      <div className="text-[9.5px] uppercase tracking-wider text-[#0F3D2E]/50 font-bold">From</div>
                      <div className="font-display text-lg font-bold num" style={{color:s.accent}}>{p.rate_from}%</div>
                    </div>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition" style={{color:s.accent}}/>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* HOW IT WORKS — 3-step timeline                                        */}
      {/* ==================================================================== */}
      {/* HOW IT WORKS — Urban-Money-style numbered process cards               */}
      {/* ==================================================================== */}
      <section className="relative bg-[#0F3D2E] py-20 overflow-hidden text-white">
        <div className="absolute inset-0 bg-dot-grid opacity-40"/>
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-[#C6FF3B]/8 blur-3xl"/>
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-[#FFD84D]/8 blur-3xl"/>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[#C6FF3B] font-bold">How it works</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">From application to disbursal in 3 steps</h2>
          </div>

          {/* connector line for desktop */}
          <div className="hidden md:block absolute left-[15%] right-[15%] top-[62%] h-px bg-gradient-to-r from-transparent via-[#C6FF3B]/40 to-transparent"/>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {[
              {step:"01", t:"Tell us your requirement", d:"Pick a product, share your amount and mobile. Takes 60 seconds.", icon:PhoneCall, color:"#C6FF3B"},
              {step:"02", t:"We match you to lenders",  d:"Our credit team runs your case against 40+ banks & NBFCs and shortlists the sharpest quotes.", icon:TrendingUp, color:"#FFD84D"},
              {step:"03", t:"You sanction & disburse",  d:"Pick an offer, we handle docs, mandate & disbursal. Success fee only on sanction.", icon:CheckCircle2, color:"#16A981"},
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="relative bg-white/5 backdrop-blur rounded-2xl p-7 border border-white/10 hover:border-[color:var(--card-hover)] transition group"
                     style={{"--card-hover": `${s.color}55`}}>
                  {/* huge step number background */}
                  <div className="absolute -top-4 right-4 font-display text-[80px] leading-none font-bold" style={{color:s.color, opacity:.12}}>{s.step}</div>
                  {/* icon chip */}
                  <div className="relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{background:s.color, color: s.color === "#C6FF3B" || s.color === "#FFD84D" ? "#0F3D2E" : "white"}}>
                    <Icon size={22}/>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-[10.5px] uppercase tracking-widest font-bold" style={{color:s.color}}>Step {s.step}</span>
                  </div>
                  <div className="font-display text-lg font-bold text-white mt-1">{s.t}</div>
                  <p className="text-sm text-white/65 mt-1.5">{s.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* EMI CALCULATOR — vibrant strip                                        */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F3D2E] via-[#12503C] to-[#0F3D2E] text-white p-8 lg:p-12">
          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-[#FFD84D]/25 blur-3xl"/>
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#16A981]/25 blur-3xl"/>
          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-[10.5px] uppercase tracking-widest text-[#FFD84D] font-bold">EMI Calculator</div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">Know your EMI before you apply</h2>
              <p className="text-white/70 mt-2">Move the sliders. See what you'll pay every month. Then get real quotes from 40+ lenders in one click.</p>

              <div className="mt-8 space-y-5">
                <RangeRow label="Loan amount" value={inr(emiForm.amount)}>
                  <input type="range" min={100000} max={100000000} step={100000} value={emiForm.amount}
                    onChange={e=>setEmiForm({...emiForm, amount:Number(e.target.value)})}
                    className="w-full accent-[#FFD84D]" data-testid="emi-amount"/>
                </RangeRow>
                <RangeRow label="Interest rate" value={`${emiForm.rate}% p.a.`}>
                  <input type="range" min={7} max={24} step={0.05} value={emiForm.rate}
                    onChange={e=>setEmiForm({...emiForm, rate:Number(e.target.value)})}
                    className="w-full accent-[#FFD84D]" data-testid="emi-rate"/>
                </RangeRow>
                <RangeRow label="Tenure" value={`${emiForm.tenure} months`}>
                  <input type="range" min={6} max={360} step={6} value={emiForm.tenure}
                    onChange={e=>setEmiForm({...emiForm, tenure:Number(e.target.value)})}
                    className="w-full accent-[#FFD84D]" data-testid="emi-tenure"/>
                </RangeRow>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="bg-white rounded-2xl p-6 text-[#0F3D2E] shadow-xl">
                <div className="text-[10.5px] uppercase tracking-widest text-[#16A981] font-bold">Monthly EMI</div>
                <div className="font-display text-5xl font-bold num text-[#0F3D2E] mt-1" data-testid="emi-monthly">{inr(monthlyEmi)}</div>
                <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-[#0F3D2E]/10">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-widest text-[#0F3D2E]/50 font-bold">Total interest</div>
                    <div className="font-display text-lg font-bold num text-[#D89B00]">{inr(totalInterest)}</div>
                  </div>
                  <div>
                    <div className="text-[10.5px] uppercase tracking-widest text-[#0F3D2E]/50 font-bold">Total payable</div>
                    <div className="font-display text-lg font-bold num text-[#0F3D2E]">{inr(totalPayable)}</div>
                  </div>
                </div>
                <Button className="w-full mt-5 bg-[#16A981] hover:bg-[#0F8B6B] text-white h-11 font-semibold" onClick={()=>nav("/apply")}>
                  Get real quotes now<ArrowRight size={16} className="ml-1"/>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {l:"Zero prepay penalty", i:CheckCircle2, c:"#16A981"},
                  {l:"No hidden charges", i:CheckCircle2, c:"#FFD84D"},
                  {l:"Personalised offers", i:CheckCircle2, c:"#4C9EEB"},
                ].map((x,i)=> {
                  const I = x.i;
                  return <div key={i} className="bg-white/10 border border-white/15 rounded-lg p-3 text-center">
                    <I size={16} className="mx-auto" style={{color:x.c}}/>
                    <div className="text-[11px] text-white/85 mt-1">{x.l}</div>
                  </div>;
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* LENDER LOGO WALL                                                      */}
      {/* ==================================================================== */}
      <section className="bg-white py-14 border-y border-[#0F3D2E]/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="text-[10.5px] uppercase tracking-widest text-[#16A981] font-bold">Trusted network</div>
            <div className="font-display text-2xl sm:text-3xl font-bold text-[#0F3D2E] mt-1">Our lender partners</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {LENDER_LOGOS.map(l => (
              <div key={l} className="h-16 rounded-lg border border-[#0F3D2E]/10 flex items-center justify-center bg-[#FAFAF7] hover:border-[#16A981]/40 hover:bg-white transition">
                <span className="font-display text-lg font-bold text-[#0F3D2E]/70 tracking-wide">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* WHY CORPZO — dark green band with gold icons                          */}
      {/* ==================================================================== */}
      <section className="relative bg-[#0F3D2E] text-white py-20 overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/3 opacity-30" style={{background:"radial-gradient(circle at right, rgba(255,216,77,.35), transparent 70%)"}}/>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="mb-12 max-w-2xl">
            <div className="text-[10.5px] uppercase tracking-widest text-[#FFD84D] font-bold">The CorpZo difference</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">Not just a broker.<br/>A verified credit partner.</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {i:ShieldCheck, t:"40+ lenders, one process", b:"One application. We negotiate across banks & NBFCs so you don't chase RMs.", c:"#FFD84D"},
              {i:Zap,         t:"Real credit team",         b:"Ex-bankers structure your case — CMA, projections, DPRs, valuations.",       c:"#16A981"},
              {i:Award,       t:"Best-in-market rates",     b:"Independent, unbiased. We surface the sharpest quote, not the highest commission.", c:"#4C9EEB"},
              {i:Users,       t:"Zero cost until sanction", b:"You only pay a success fee when your loan is sanctioned — nothing before.", c:"#FF9F5A"},
            ].map((f, i) => {
              const Icon = f.i;
              return <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FFD84D]/40 transition">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{background:`${f.c}22`, border:`1px solid ${f.c}55`}}>
                  <Icon style={{color:f.c}} size={22}/>
                </div>
                <div className="font-display text-lg font-bold text-white">{f.t}</div>
                <div className="text-sm text-white/65 mt-1.5">{f.b}</div>
              </div>;
            })}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* TESTIMONIALS                                                          */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#16A981] font-bold">Client stories</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F3D2E] mt-1">Borrowers pick CorpZo, again.</h2>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-[#FFF7C2] border border-[#FFD84D]/50 px-4 py-2 rounded-full">
            <div className="flex">{[...Array(5)].map((_,i)=><Star key={i} size={14} className="fill-[#D89B00] text-[#D89B00]"/>)}</div>
            <span className="font-display font-bold text-[#D89B00]">4.8 / 5</span>
            <span className="text-xs text-[#8A6600]">· 3,200+ reviews</span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white border border-[#0F3D2E]/10 rounded-2xl p-6 hover:border-[#16A981]/40 hover:shadow-lg transition relative overflow-hidden">
              <div className="absolute top-4 right-6 text-6xl leading-none text-[#FFD84D] font-display">"</div>
              <div className="flex mb-3">{[...Array(t.rating)].map((_,i)=><Star key={i} size={14} className="fill-[#D89B00] text-[#D89B00]"/>)}</div>
              <p className="text-[#0F3D2E]/85 leading-relaxed">{t.quote}</p>
              <div className="mt-5 pt-4 border-t border-[#0F3D2E]/8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#16A981] to-[#0F3D2E] text-white flex items-center justify-center font-display font-bold">{t.name[0]}</div>
                <div><div className="font-semibold text-[#0F3D2E] text-sm">{t.name}</div><div className="text-xs text-[#0F3D2E]/55">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FAQ                                                                   */}
      {/* ==================================================================== */}
      <section className="bg-[#F1F7F3] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="text-xs uppercase tracking-widest text-[#16A981] font-bold">FAQ</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0F3D2E] mt-1">Everything you wanted to ask</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <button key={i} onClick={()=>setOpenFaq(openFaq===i?-1:i)}
                className="w-full text-left bg-white border border-[#0F3D2E]/10 rounded-xl p-5 hover:border-[#16A981]/40 transition"
                data-testid={`faq-${i}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="font-display text-[15px] font-bold text-[#0F3D2E]">{f.q}</div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition ${openFaq===i?"bg-[#16A981] text-white rotate-45":"bg-[#F1F7F3] text-[#0F3D2E]"}`}>+</div>
                </div>
                {openFaq===i && <p className="text-sm text-[#0F3D2E]/70 mt-3 leading-relaxed">{f.a}</p>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FINAL CTA                                                             */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl px-8 py-14 text-white flex flex-col md:flex-row items-center justify-between gap-6"
             style={{background:"linear-gradient(115deg, #0F3D2E 0%, #16A981 45%, #FFD84D 130%)"}}>
          <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"/>
          <div className="relative">
            <div className="text-[10.5px] uppercase tracking-widest text-[#FFD84D] font-bold">Ready when you are</div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">Compare rates. Get sanctioned.</div>
            <div className="text-white/85 mt-1">Personalised offers from 40+ lenders in under an hour.</div>
          </div>
          <Button className="relative bg-white hover:bg-[#FFD84D] text-[#0F3D2E] font-bold h-12 px-7 shadow-lg" onClick={()=>nav("/apply")}>
            Start free application<ArrowRight size={16} className="ml-1"/>
          </Button>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, l, c }) {
  return <div>
    <div className="font-display text-2xl font-bold num" style={{color:c}}>{n}</div>
    <div className="text-xs text-white/60 uppercase tracking-wider mt-1">{l}</div>
  </div>;
}

function RangeRow({ label, value, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-widest text-white/60 font-semibold">{label}</div>
        <div className="font-display text-lg font-bold num text-[#FFD84D]">{value}</div>
      </div>
      {children}
    </div>
  );
}
