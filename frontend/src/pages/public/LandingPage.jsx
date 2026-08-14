import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, ShieldCheck, Zap, Award, Users, Star,
  Home, Briefcase, User, Building2, Factory, GraduationCap, Landmark, Coins,
  Percent, Clock, CheckCircle2, TrendingUp, PhoneCall, Truck, Cog, Layers, Gem, Handshake
} from "lucide-react";
import { toast } from "sonner";
import ProductArt from "@/components/ProductArt";

/** urban-money style tinted background per backend product slug */
const PRODUCT_STYLE = {
  "home-loan":              { icon: Home,          tint: "#FFE4DE", accent: "#FF6B4E" },
  "business-loan":          { icon: Briefcase,     tint: "#FFF3D6", accent: "#D89B00" },
  "lap":                    { icon: Building2,     tint: "#E4F1FB", accent: "#3287D6" },
  "personal-loan":          { icon: User,          tint: "#FCE7EA", accent: "#E24A6B" },
  "working-capital":        { icon: Coins,         tint: "#FFEFDA", accent: "#E37800" },
  "cc-od":                  { icon: Percent,       tint: "#F2E9FE", accent: "#8B5CF6" },
  "term-loan":              { icon: TrendingUp,    tint: "#DFF5F1", accent: "#E85A3D" },
  "equipment-finance":      { icon: Cog,           tint: "#E9F1FF", accent: "#3357C1" },
  "project-finance":        { icon: Factory,       tint: "#FBE9DA", accent: "#D25E1F" },
  "construction-finance":   { icon: Building2,     tint: "#FDECD8", accent: "#C05621" },
  "supply-chain-finance":   { icon: Truck,         tint: "#E2F2FF", accent: "#1D8FE1" },
  "invoice-discounting":    { icon: Layers,        tint: "#F7E5F1", accent: "#B23B8A" },
  "loan-against-securities":{ icon: TrendingUp,    tint: "#FFF7C2", accent: "#B58900" },
  "structured-finance":     { icon: Landmark,      tint: "#E7EDE9", accent: "#0B1F3A" },
  "private-credit":         { icon: Gem,           tint: "#E1EDFD", accent: "#4C6FE1" },
};
const styleFor = (slug) => PRODUCT_STYLE[slug] || { icon: Coins, tint: "#F1F4F1", accent: "#1B3A6B" };

const TESTIMONIALS = [
  {name:"Anjali M.", role:"SME Founder, Pune",         quote:"Approved for ₹1.5 Cr in 9 days — CorpZo compared 6 lenders and negotiated the ROI down 90bps.", rating:5},
  {name:"Rohan K.", role:"Property investor, Mumbai",  quote:"LAP with 65% LTV. My RM was on WhatsApp every day until disbursal.",                              rating:5},
  {name:"Krishna Steel", role:"Manufacturing, Ahmedabad", quote:"They fixed our CMA and got working capital sanctioned in a single quarter.",                    rating:5},
];

const LENDER_LOGOS = [
  "HDFC Bank","ICICI Bank","Axis Bank","Kotak","SBI","PNB","Bank of Baroda","IndusInd","Yes Bank","IDFC First",
  "Federal Bank","RBL Bank","Standard Chartered","HSBC","DBS","Bajaj Finserv","Tata Capital","Aditya Birla","Piramal","L&T Finance",
  "Poonawalla","Hero FinCorp","Cholamandalam","Mahindra Finance","Shriram","Muthoot","Manappuram","Fullerton","IIFL","Edelweiss",
  "JM Financial","Kotak Investment","Nomura","Northern Arc","Vivriti","U GRO","Lendingkart","FlexiLoans","Indifi","NeoGrowth",
  "InCred","Clix Capital","DMI Finance","Godrej Capital","Hinduja Leyland","SMFG India","Ambit","Avanse","Auxilo","Credila",
  "AU Small Finance","Ujjivan","Equitas","ESAF","Suryoday","Utkarsh","Fincare","Jana","Bandhan","City Union",
];
const LENDER_COUNT_LABEL = "120+ Lender Partners";

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
    <div data-testid="landing-page" className="text-[#0B1F3A]">

      {/* ==================================================================== */}
      {/* OFFERS TICKER — hero-top marquee (Free CIBIL · PL @10.5% · Biz suite) */}
      {/* ==================================================================== */}
      <div className="relative overflow-hidden bg-[#0B1F3A] text-white border-b border-white/10" data-testid="offers-ticker">
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-full bg-[#FF6B4E]/15 border border-[#FF6B4E]/30 text-[10px] uppercase tracking-widest font-bold text-[#FF9F5A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4E] animate-pulse"/> Today&apos;s offers
          </div>
          <div className="relative flex-1 overflow-hidden">
            <div className="flex gap-8 whitespace-nowrap marquee">
              {[0, 1].map(loop => (
                <div key={loop} className="flex items-center gap-8 shrink-0">
                  <Link to="/product/personal-loan" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-[#FFD84D] transition">
                    <span className="w-6 h-6 rounded-md bg-[#22C55E]/25 text-[#22C55E] flex items-center justify-center text-xs">✓</span>
                    FREE CIBIL Score <span className="line-through text-white/40 font-normal">₹499</span> <span className="text-[#FFD84D]">₹0</span>
                  </Link>
                  <span className="text-white/25">•</span>
                  <Link to="/product/personal-loan" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-[#FFD84D] transition">
                    <span className="w-6 h-6 rounded-md bg-[#FF6B4E]/25 text-[#FF9F5A] flex items-center justify-center text-xs">₹</span>
                    Benefit-loaded Personal Loan @ <span className="num text-[#FFD84D]">10.49%</span> onwards
                  </Link>
                  <span className="text-white/25">•</span>
                  <Link to="/product/business-loan" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-[#FFD84D] transition">
                    <span className="w-6 h-6 rounded-md bg-[#3287D6]/25 text-[#8AB6E2] flex items-center justify-center text-xs">B</span>
                    Business Loans <span className="num">₹5 L → ₹500 Cr</span> · WC · TL · CC/OD · LAP
                  </Link>
                  <span className="text-white/25">•</span>
                  <Link to="/product/home-loan" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-[#FFD84D] transition">
                    <span className="w-6 h-6 rounded-md bg-[#FFD84D]/20 text-[#FFD84D] flex items-center justify-center text-xs">🏠</span>
                    Home Loan @ <span className="num text-[#FFD84D]">8.35%</span> · Balance transfer welcomed
                  </Link>
                  <span className="text-white/25">•</span>
                  <Link to="/banks" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-[#FFD84D] transition">
                    <span className="w-6 h-6 rounded-md bg-white/15 text-white flex items-center justify-center text-xs">🏦</span>
                    120+ banks &amp; NBFCs on-board <span className="text-white/50">— view all →</span>
                  </Link>
                  <span className="text-white/25">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* HERO BANNER — CorpZo brand w/ Venturaz shapes + Urban Money cues       */}
      {/* Glass morphism + liquid morphism + neon highlights                     */}
      {/* ==================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#081733] via-[#0B1F3A] to-[#1B3A6B] text-white">
        {/* venturaz signature — concentric-circle motif */}
        <svg className="absolute -left-60 top-0 opacity-25" width="900" height="900" viewBox="0 0 900 900" fill="none">
          {[100,180,260,340,420,500].map(r => <circle key={r} cx="450" cy="450" r={r} stroke="#FFD84D" strokeWidth="0.5" strokeDasharray="2 8"/>)}
        </svg>
        {/* dot grid overlay */}
        <div className="absolute inset-0 bg-dot-grid opacity-40"/>

        {/* LIQUID MORPHISM BLOBS — subdued on mobile so navy theme reads correctly */}
        <div className="absolute -top-40 -right-40 w-[320px] h-[320px] md:w-[560px] md:h-[560px] bg-gradient-to-br from-[#FFD84D]/15 to-[#FF6B4E]/10 md:from-[#FFD84D]/40 md:to-[#00FFE1]/25 blur-3xl liquid-blob"/>
        <div className="absolute -bottom-56 left-1/4 w-[280px] h-[280px] md:w-[520px] md:h-[520px] bg-gradient-to-tr from-[#FFD84D]/10 to-[#FF6B4E]/10 md:from-[#FFD84D]/30 md:to-[#FF6B4E]/25 blur-3xl liquid-blob-2"/>
        <div className="hidden md:block absolute top-1/3 right-1/3 w-64 h-64 bg-[#00D9FF]/10 blur-3xl liquid-blob-3"/>

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
              <div className="relative bg-[#FFD84D] text-[#0B1F3A] px-3 py-1.5 rounded-2xl rounded-bl-sm font-display font-bold text-sm shadow-lg neon-glow">
                Hello, borrower!
                <span className="absolute -bottom-1 left-2 w-0 h-0 border-t-8 border-t-[#FFD84D] border-l-8 border-l-transparent"/>
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
              <span className="ml-1 inline-block px-2 py-0.5 rounded bg-[#FFD84D]/15 border border-[#FFD84D]/30 neon-lime font-semibold text-sm">Zero cost until sanction</span>
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
              <Button className="bg-[#FFD84D] hover:bg-[#C6FF00] text-[#0B1F3A] font-bold h-12 px-7 shadow-lg neon-glow transition-all"
                      onClick={()=>nav("/products")} data-testid="hero-explore-btn">
                Explore all products<ArrowRight size={16} className="ml-1"/>
              </Button>
              <Button variant="outline" className="h-12 px-6 glass border-white/25 text-white hover:bg-white/15 hover:text-white"
                      onClick={()=>nav("/apply")} data-testid="hero-apply-btn">
                <PhoneCall size={15} className="mr-2"/>Get a call back
              </Button>
            </div>

            {/* Stat strip */}
            <div className="mt-10 grid grid-cols-4 gap-4 max-w-2xl" data-testid="hero-stat-strip">
              <Stat n="40+" l="Lender partners" c="#FFD84D" testid="stat-lenders"/>
              <Stat n="₹2,500 Cr+" l="Disbursed" c="#FF6B4E" testid="stat-disbursed"/>
              <Stat n="15" l="Debt products" c="#4C9EEB" testid="stat-products"/>
              <Stat n="4.8/5" l="Client rating" c="#FF9F5A" testid="stat-rating"/>
            </div>
          </div>

          {/* RIGHT — glass quick apply card */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* neon liquid halo */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#FFD84D]/40 to-[#00FFE1]/25 blur-2xl opacity-80 liquid-blob"/>
              <div className="relative glass-strong rounded-2xl border border-white/25 p-6 text-[#0B1F3A]" data-testid="hero-quick-apply"
                   style={{background:"linear-gradient(135deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))"}}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B4E] animate-pulse"/>
                  <div className="text-[10.5px] uppercase tracking-widest text-[#FF6B4E] font-bold">Instant call back</div>
                </div>
                <div className="font-display text-2xl font-bold">Tell us what you need</div>
                <div className="text-xs text-[#0B1F3A]/60 mt-1">Rates shared in under an hour on weekdays.</div>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[#0B1F3A]/70">I want a</label>
                    <select value={form.product} onChange={e=>setForm({...form, product:e.target.value})}
                      className="w-full h-10 mt-1 px-3 rounded-md border border-[#0B1F3A]/15 bg-white text-sm focus:outline-none focus:border-[#FF6B4E]"
                      data-testid="hero-product-select">
                      <option value="">Pick a product…</option>
                      {products.map(p => <option key={p.slug} value={p.slug}>{p.title}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-xs font-semibold text-[#0B1F3A]/70">Your name</label>
                      <Input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} data-testid="hero-name" className="border-[#0B1F3A]/15 focus-visible:ring-[#FF6B4E]"/></div>
                    <div><label className="text-xs font-semibold text-[#0B1F3A]/70">Mobile</label>
                      <Input value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})} data-testid="hero-mobile" className="border-[#0B1F3A]/15 focus-visible:ring-[#FF6B4E]"/></div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#0B1F3A]/70">Amount required (₹)</label>
                    <Input type="number" value={form.amount} onChange={e=>setForm({...form, amount:Number(e.target.value)})} data-testid="hero-amount" className="border-[#0B1F3A]/15 focus-visible:ring-[#FF6B4E]"/>
                    <div className="mt-1 text-sm num text-[#FF6B4E] font-semibold">{inr(form.amount)}</div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-[#0B1F3A] to-[#1B3A6B] hover:from-[#0B1F3A] hover:to-[#0B1F3A] text-white h-11 font-semibold" onClick={submit} data-testid="hero-submit">
                    Get my personalised quote<ArrowRight size={16} className="ml-1"/>
                  </Button>
                  <div className="flex items-center gap-3 text-xs text-[#0B1F3A]/50 pt-1">
                    <div className="flex items-center gap-1"><ShieldCheck size={12} className="text-[#FF6B4E]"/>No credit pull</div>
                    <div className="flex items-center gap-1"><Clock size={12} className="text-[#FF6B4E]"/>Reply in &lt;1 hour</div>
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
            <div className="text-xs uppercase tracking-widest text-[#FF6B4E] font-bold">Products</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] mt-1">15 ways to finance your ambition</h2>
            <p className="text-[#0B1F3A]/60 mt-2 max-w-2xl">From ₹50k personal loans to ₹500 Cr structured deals — pick the product, we do the rest.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-[#FF6B4E] hover:text-[#0B1F3A] flex items-center gap-1">View catalogue<ArrowRight size={14}/></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" data-testid="product-grid">
          {products.slice(0,10).map(p => {
            const s = styleFor(p.slug);
            return (
              <Link key={p.slug} to={`/product/${p.slug}`} data-testid={`product-card-${p.slug}`}
                    className="group relative bg-white rounded-2xl border border-[#0B1F3A]/8 overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-transparent transition-all duration-200">
                <ProductArt slug={p.slug} tint={s.tint} accent={s.accent} size="md"/>
                <div className="p-5 pt-4">
                  <div className="font-display text-[15px] font-bold text-[#0B1F3A]">{p.title}</div>
                  <div className="text-[11px] text-[#0B1F3A]/55 mt-0.5 line-clamp-2 leading-snug">{p.tagline}</div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#0B1F3A]/8">
                    <div>
                      <div className="text-[9.5px] uppercase tracking-wider text-[#0B1F3A]/50 font-bold">From</div>
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
      <section className="relative bg-[#0B1F3A] py-20 overflow-hidden text-white">
        <div className="absolute inset-0 bg-dot-grid opacity-40"/>
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-[#00D9FF]/8 blur-3xl"/>
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-[#FFD84D]/8 blur-3xl"/>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="text-xs uppercase tracking-widest text-[#00D9FF] font-bold">How it works</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">From application to disbursal in 3 steps</h2>
          </div>

          {/* connector line for desktop */}
          <div className="hidden md:block absolute left-[15%] right-[15%] top-[62%] h-px bg-gradient-to-r from-transparent via-[#00D9FF]/40 to-transparent"/>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {[
              {step:"01", t:"Tell us your requirement", d:"Pick a product, share your amount and mobile. Takes 60 seconds.", icon:PhoneCall, color:"#00D9FF"},
              {step:"02", t:"We match you to lenders",  d:"Our credit team runs your case against 40+ banks & NBFCs and shortlists the sharpest quotes.", icon:TrendingUp, color:"#FFD84D"},
              {step:"03", t:"You sanction & disburse",  d:"Pick an offer, we handle docs, mandate & disbursal. Success fee only on sanction.", icon:CheckCircle2, color:"#FF6B4E"},
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="relative bg-white/5 backdrop-blur rounded-2xl p-7 border border-white/10 hover:border-[color:var(--card-hover)] transition group"
                     style={{"--card-hover": `${s.color}55`}}>
                  {/* huge step number background */}
                  <div className="absolute -top-4 right-4 font-display text-[80px] leading-none font-bold" style={{color:s.color, opacity:.12}}>{s.step}</div>
                  {/* icon chip */}
                  <div className="relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{background:s.color, color: s.color === "#00D9FF" || s.color === "#FFD84D" ? "#0B1F3A" : "white"}}>
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1F3A] via-[#132D5C] to-[#0B1F3A] text-white p-8 lg:p-12">
          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-[#FFD84D]/25 blur-3xl"/>
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-[#FF6B4E]/25 blur-3xl"/>
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
              <div className="bg-white rounded-2xl p-6 text-[#0B1F3A] shadow-xl">
                <div className="text-[10.5px] uppercase tracking-widest text-[#FF6B4E] font-bold">Monthly EMI</div>
                <div className="font-display text-5xl font-bold num text-[#0B1F3A] mt-1" data-testid="emi-monthly">{inr(monthlyEmi)}</div>
                <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-[#0B1F3A]/10">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-widest text-[#0B1F3A]/50 font-bold">Total interest</div>
                    <div className="font-display text-lg font-bold num text-[#D89B00]">{inr(totalInterest)}</div>
                  </div>
                  <div>
                    <div className="text-[10.5px] uppercase tracking-widest text-[#0B1F3A]/50 font-bold">Total payable</div>
                    <div className="font-display text-lg font-bold num text-[#0B1F3A]">{inr(totalPayable)}</div>
                  </div>
                </div>
                <Button className="w-full mt-5 bg-[#FF6B4E] hover:bg-[#E85A3D] text-white h-11 font-semibold" onClick={()=>nav("/apply")}>
                  Get real quotes now<ArrowRight size={16} className="ml-1"/>
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {l:"Zero prepay penalty", i:CheckCircle2, c:"#FF6B4E"},
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
      {/* LENDER LOGO WALL — Massive 100s of partners                          */}
      {/* ==================================================================== */}
      <section id="partners" className="bg-white py-16 border-y border-[#0B1F3A]/8 relative overflow-hidden" data-testid="lender-wall">
        <div className="absolute inset-0 bg-dot-grid opacity-30"/>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <div className="text-[10.5px] uppercase tracking-widest text-[#FF6B4E] font-bold">Trusted network</div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] mt-1">A lender for every case.</h2>
              <p className="text-[#0B1F3A]/60 mt-2 max-w-xl text-sm">From India's largest scheduled banks to specialist NBFCs, small finance banks, and private credit funds — we place your deal where it fits sharpest.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-[#FFF7C2] border border-[#FFD84D]/50 px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#D89B00] animate-pulse"/>
                <span className="font-display font-bold text-[#8A5A00] num text-sm">{LENDER_COUNT_LABEL}</span>
              </div>
              <div className="hidden md:block bg-[#FFE4DE] border border-[#FF6B4E]/40 px-4 py-2 rounded-full">
                <span className="font-display font-bold text-[#FF6B4E] text-sm num">₹2,500 Cr+ disbursed</span>
              </div>
            </div>
          </div>

          {/* logo grid — 6 cols on md, 8 on xl for a dense wall */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-2.5">
            {LENDER_LOGOS.map((l, i) => (
              <div key={l} data-testid={`lender-logo-${i}`}
                   className="h-14 md:h-16 rounded-lg border border-[#0B1F3A]/10 flex items-center justify-center bg-[#FAFAF7] px-2 hover:border-[#FF6B4E]/50 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <span className="font-display text-[11px] md:text-[12.5px] font-bold text-[#0B1F3A]/70 group-hover:text-[#0B1F3A] tracking-tight text-center leading-tight">{l}</span>
              </div>
            ))}
          </div>

          {/* +more chip footer */}
          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-[#0B1F3A]/55 flex-wrap">
            <span className="inline-flex items-center gap-1.5 bg-[#0B1F3A]/5 border border-[#0B1F3A]/10 px-3 py-1.5 rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B4E]"/> + 60 more partners onboarding this quarter
            </span>
            <Link to="/banks"
                  className="inline-flex items-center gap-1.5 bg-[#0B1F3A] hover:bg-[#081733] text-white px-4 py-2 rounded-full font-semibold transition"
                  data-testid="view-all-banks-cta">
              View all {data?.total || 80}+ banks &amp; NBFCs <ArrowRight size={14}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* BIG-NUMBER TICKER STATS — animated large numbers                      */}
      {/* ==================================================================== */}
      <section className="relative bg-gradient-to-r from-[#0B1F3A] via-[#132D5C] to-[#0B1F3A] text-white py-16 overflow-hidden" data-testid="big-stats-strip">
        <div className="absolute -left-40 -top-24 w-96 h-96 bg-[#FFD84D]/10 blur-3xl rounded-full"/>
        <div className="absolute -right-40 -bottom-24 w-96 h-96 bg-[#FF6B4E]/10 blur-3xl rounded-full"/>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-10">
            <div className="text-[10.5px] uppercase tracking-widest text-[#FFD84D] font-bold">By the numbers</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-1">Numbers that borrowers &amp; lenders trust.</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            <BigStat testid="bs-lenders"       n={`${lenderCount}+`}   unit="lender partners"   c="#FFD84D"/>
            <BigStat testid="bs-disbursed"     n="₹2,500Cr" unit="disbursed to date" c="#FF6B4E"/>
            <BigStat testid="bs-customers"     n="50,000+" unit="happy borrowers"   c="#4C9EEB"/>
            <BigStat testid="bs-partners"      n="100k+"   unit="channel partners"  c="#22C55E"/>
            <BigStat testid="bs-products"      n="15"      unit="debt products"     c="#FF9F5A"/>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/banks" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-white text-[#0B1F3A] font-bold hover:bg-[#FFD84D] transition" data-testid="stats-view-banks">
              <Landmark size={16}/>Explore all banks
            </Link>
            <Link to="/become-partner" className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[#FF6B4E] hover:bg-[#E85A3D] text-white font-bold transition" data-testid="stats-become-partner">
              <Handshake size={16}/>Become our partner
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* CHANNEL PARTNERS — 100,000+ advisors band                             */}
      {/* ==================================================================== */}
      <section className="bg-gradient-to-br from-[#FFF6EE] via-[#FDECE5] to-[#FFE7D8] py-20 relative overflow-hidden" data-testid="partner-recruit-section">
        <div className="absolute -left-20 top-10 w-72 h-72 rounded-full bg-[#FF6B4E]/15 blur-3xl"/>
        <div className="absolute -right-20 bottom-10 w-72 h-72 rounded-full bg-[#FFD84D]/20 blur-3xl"/>
        <div className="max-w-7xl mx-auto px-6 relative grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-[10.5px] uppercase tracking-widest text-[#FF6B4E] font-bold">For DSAs &amp; consultants</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#0B1F3A] mt-2 leading-[1.05]">
              We power <span className="text-[#FF6B4E]">100,000+</span><br/>debt advisors across India.
            </h2>
            <p className="text-[#0B1F3A]/75 mt-4 max-w-xl">
              Turn your relationships into revenue. Refer files to CorpZo and earn best-in-market payouts on every sanctioned deal. Access 120+ lenders through one login, get real-time file status, and get paid every month on the dot.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 max-w-lg">
              {[
                {t:"Payouts as high as 2.5%",  s:"Weekly reconciliation, monthly bank transfer"},
                {t:"Full pipeline visibility", s:"Track every lead → sanction → disbursal in one dashboard"},
                {t:"Dedicated relationship manager", s:"Onboarding, training, sanction help — end to end"},
                {t:"No cost to join",          s:"Free onboarding · digital KYC · agreement in minutes"},
              ].map((p, i) => (
                <div key={i} className="bg-white/70 backdrop-blur border border-white/60 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#22C55E]/15 text-[#0F9F5F] flex items-center justify-center"><CheckCircle2 size={14}/></div>
                    <div className="font-display font-bold text-sm text-[#0B1F3A]">{p.t}</div>
                  </div>
                  <div className="text-[11.5px] text-[#0B1F3A]/70 mt-1">{p.s}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/become-partner" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#0B1F3A] hover:bg-[#081733] text-white font-bold" data-testid="become-partner-cta">
                Become our partner<ArrowRight size={16}/>
              </Link>
              <Link to="/become-partner#calculator" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white/70 hover:bg-white border border-[#0B1F3A]/15 text-[#0B1F3A] font-semibold">
                Earnings calculator
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="grid grid-cols-3 gap-2.5">
              {["DEL","MUM","BLR","CHE","HYD","AMD","PUN","JAI","LKO","IND","KOL","GHA"].map((c, i) => (
                <div key={c} className={`h-16 rounded-xl flex flex-col items-center justify-center border ${i % 3 === 0 ? "bg-[#0B1F3A] text-white border-[#0B1F3A]" : "bg-white border-white/80 text-[#0B1F3A]"} shadow-sm`}>
                  <div className="font-display font-bold text-sm">{c}</div>
                  <div className={`text-[10px] ${i%3===0?"text-white/70":"text-[#0B1F3A]/60"}`}>{200+i*47} advisors</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <div className="bg-white shadow-xl rounded-full px-4 py-2 text-xs font-semibold text-[#0B1F3A] flex items-center gap-2 border border-[#FF6B4E]/30">
                <Users size={14} className="text-[#FF6B4E]"/>Active in 380+ cities
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* WHY CORPZO — dark green band with gold icons                          */}
      {/* ==================================================================== */}
      <section className="relative bg-[#0B1F3A] text-white py-20 overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/3 opacity-30" style={{background:"radial-gradient(circle at right, rgba(255,216,77,.35), transparent 70%)"}}/>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="mb-12 max-w-2xl">
            <div className="text-[10.5px] uppercase tracking-widest text-[#FFD84D] font-bold">The CorpZo difference</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">Not just a broker.<br/>A verified credit partner.</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {i:ShieldCheck, t:"40+ lenders, one process", b:"One application. We negotiate across banks & NBFCs so you don't chase RMs.", c:"#FFD84D"},
              {i:Zap,         t:"Real credit team",         b:"Ex-bankers structure your case — CMA, projections, DPRs, valuations.",       c:"#FF6B4E"},
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
            <div className="text-xs uppercase tracking-widest text-[#FF6B4E] font-bold">Client stories</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] mt-1">Borrowers pick CorpZo, again.</h2>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-[#FFF7C2] border border-[#FFD84D]/50 px-4 py-2 rounded-full">
            <div className="flex">{[...Array(5)].map((_,i)=><Star key={i} size={14} className="fill-[#D89B00] text-[#D89B00]"/>)}</div>
            <span className="font-display font-bold text-[#D89B00]">4.8 / 5</span>
            <span className="text-xs text-[#8A6600]">· 3,200+ reviews</span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white border border-[#0B1F3A]/10 rounded-2xl p-6 hover:border-[#FF6B4E]/40 hover:shadow-lg transition relative overflow-hidden">
              <div className="absolute top-4 right-6 text-6xl leading-none text-[#FFD84D] font-display">"</div>
              <div className="flex mb-3">{[...Array(t.rating)].map((_,i)=><Star key={i} size={14} className="fill-[#D89B00] text-[#D89B00]"/>)}</div>
              <p className="text-[#0B1F3A]/85 leading-relaxed">{t.quote}</p>
              <div className="mt-5 pt-4 border-t border-[#0B1F3A]/8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B4E] to-[#0B1F3A] text-white flex items-center justify-center font-display font-bold">{t.name[0]}</div>
                <div><div className="font-semibold text-[#0B1F3A] text-sm">{t.name}</div><div className="text-xs text-[#0B1F3A]/55">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FAQ                                                                   */}
      {/* ==================================================================== */}
      <section className="bg-[#F2F5FA] py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="text-xs uppercase tracking-widest text-[#FF6B4E] font-bold">FAQ</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0B1F3A] mt-1">Everything you wanted to ask</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <button key={i} onClick={()=>setOpenFaq(openFaq===i?-1:i)}
                className="w-full text-left bg-white border border-[#0B1F3A]/10 rounded-xl p-5 hover:border-[#FF6B4E]/40 transition"
                data-testid={`faq-${i}`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="font-display text-[15px] font-bold text-[#0B1F3A]">{f.q}</div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center transition ${openFaq===i?"bg-[#FF6B4E] text-white rotate-45":"bg-[#F2F5FA] text-[#0B1F3A]"}`}>+</div>
                </div>
                {openFaq===i && <p className="text-sm text-[#0B1F3A]/70 mt-3 leading-relaxed">{f.a}</p>}
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
             style={{background:"linear-gradient(115deg, #0B1F3A 0%, #FF6B4E 45%, #FFD84D 130%)"}}>
          <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-white/10 blur-3xl"/>
          <div className="relative">
            <div className="text-[10.5px] uppercase tracking-widest text-[#FFD84D] font-bold">Ready when you are</div>
            <div className="font-display text-3xl sm:text-4xl font-bold text-white mt-1">Compare rates. Get sanctioned.</div>
            <div className="text-white/85 mt-1">Personalised offers from 40+ lenders in under an hour.</div>
          </div>
          <Button className="relative bg-white hover:bg-[#FFD84D] text-[#0B1F3A] font-bold h-12 px-7 shadow-lg" onClick={()=>nav("/apply")}>
            Start free application<ArrowRight size={16} className="ml-1"/>
          </Button>
        </div>
      </section>
    </div>
  );
}

function BigStat({ n, unit, c, testid }) {
  return (
    <div className="text-center" data-testid={testid}>
      <div className="font-display text-4xl sm:text-5xl lg:text-[52px] font-bold num leading-none" style={{ color: c }}>{n}</div>
      <div className="text-[11px] uppercase tracking-widest text-white/60 mt-2 font-semibold">{unit}</div>
    </div>
  );
}

function Stat({ n, l, c, testid }) {
  return <div data-testid={testid}>
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
