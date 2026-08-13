import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowRight, ShieldCheck } from "lucide-react";

function emi(P, r, n) {
  const R = r / 12 / 100;
  if (!R || !n) return 0;
  return (P * R * Math.pow(1+R, n)) / (Math.pow(1+R, n) - 1);
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [form, setForm] = useState({ amount: 2500000, tenure_months: 60, name: "", mobile: "", email: "", city: "" });
  const nav = useNavigate();

  useEffect(() => { api.get(`/public/products/${slug}`).then(r => {
    setP(r.data);
    setForm(f => ({ ...f, amount: Math.min(r.data.max_amount, Math.max(r.data.min_amount, f.amount)), tenure_months: Math.min(r.data.tenure_max, f.tenure_months) }));
  }); }, [slug]);

  if (!p) return <div className="max-w-7xl mx-auto px-6 py-16 text-slate-500">Loading…</div>;
  const monthlyEmi = emi(form.amount, p.rate_from, form.tenure_months);

  const submit = async () => {
    if (!form.name || !form.mobile) { toast.error("Name & mobile required"); return; }
    try {
      const { data } = await api.post("/public/apply", { ...form, product: slug });
      toast.success(`Application received (${data.lead_uid})`);
      nav(`/apply/thanks?lead=${data.lead_uid}`);
    } catch { toast.error("Something went wrong"); }
  };

  return (
    <div data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <div className="grid lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="aspect-[16/8] rounded-2xl overflow-hidden bg-slate-100 mb-6">
              <img src={p.hero_image} alt="" className="w-full h-full object-cover"/>
            </div>
            <div className="text-xs uppercase tracking-widest text-[#8A6600] font-semibold">Product</div>
            <h1 className="font-display text-4xl font-semibold text-[#0F3D2E] mt-1">{p.title}</h1>
            <p className="text-[#0F3D2E]/70 mt-2 text-lg">{p.tagline}</p>

            <div className="grid grid-cols-4 gap-3 mt-6">
              <Fact label="From" v={`${p.rate_from}%`}/>
              <Fact label="Max tenure" v={`${p.tenure_max}m`}/>
              <Fact label="Min amount" v={inr(p.min_amount)}/>
              <Fact label="Max amount" v={inr(p.max_amount)}/>
            </div>

            <div className="mt-10">
              <div className="text-xs uppercase tracking-widest text-[#8A6600] font-semibold">On our panel</div>
              <h3 className="font-display text-2xl font-semibold text-[#0F3D2E] mt-1">Lenders that offer this product</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {p.lenders?.map(l => (
                  <div key={l.name} className="bg-white border border-[#0F3D2E]/10 rounded-lg p-4 flex items-center justify-between hover:border-[#1F5B4A]/30 transition">
                    <div>
                      <div className="font-semibold text-[#0F3D2E]">{l.name}</div>
                      <div className="text-xs text-[#0F3D2E]/50 uppercase tracking-wider">{l.lender_type} · TAT {l.tat_days}d</div>
                    </div>
                    <div className="text-right"><div className="text-[10.5px] uppercase tracking-wider text-[#8A6600] font-semibold">ROI</div><div className="font-display text-lg text-[#1F5B4A] num">{l.roi_min}–{l.roi_max}%</div></div>
                  </div>
                ))}
                {(p.lenders||[]).length === 0 && <div className="text-sm text-[#0F3D2E]/50 col-span-2">Panel updates weekly. We'll match you with the right lender at the application stage.</div>}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white border border-[#0F3D2E]/10 rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="text-xs uppercase tracking-widest text-[#8A6600] font-semibold">EMI Calculator + Apply</div>
              <div className="font-display text-2xl font-semibold text-[#0F3D2E] mt-1">Personalised in 60 seconds</div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-[#0F3D2E]/60 mb-1"><span>Amount</span><span className="num text-[#0F3D2E] font-semibold">{inr(form.amount)}</span></div>
                  <input type="range" min={p.min_amount} max={p.max_amount} step={p.min_amount} value={form.amount} onChange={e=>setForm({...form, amount: Number(e.target.value)})} className="w-full accent-[#1F5B4A]" data-testid="calc-amount"/>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-[#0F3D2E]/60 mb-1"><span>Tenure</span><span className="num text-[#0F3D2E] font-semibold">{form.tenure_months} months</span></div>
                  <input type="range" min={12} max={p.tenure_max} step={12} value={form.tenure_months} onChange={e=>setForm({...form, tenure_months: Number(e.target.value)})} className="w-full accent-[#1F5B4A]" data-testid="calc-tenure"/>
                </div>
              </div>

              <div className="mt-4 bg-[#0F3D2E] text-white rounded-lg p-4">
                <div className="text-xs uppercase tracking-widest text-[#FFD700]">Indicative EMI</div>
                <div className="font-display text-3xl num font-semibold mt-1 text-white" data-testid="calc-emi">{inr(monthlyEmi)}</div>
                <div className="text-xs text-white/55 mt-1">@ {p.rate_from}% · {form.tenure_months}m · illustrative only</div>
              </div>

              <div className="mt-4 space-y-2">
                <Input placeholder="Full name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} data-testid="apply-name"/>
                <Input placeholder="Mobile" value={form.mobile} onChange={e=>setForm({...form, mobile:e.target.value})} data-testid="apply-mobile"/>
                <Input placeholder="Email (optional)" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
                <Input placeholder="City" value={form.city} onChange={e=>setForm({...form, city:e.target.value})}/>
                <Button className="w-full bg-[#1F5B4A] hover:bg-[#0F3D2E] text-white h-11" onClick={submit} data-testid="apply-submit">Get personalised quote<ArrowRight size={16} className="ml-1"/></Button>
                <p className="text-xs text-[#0F3D2E]/50 flex items-center gap-1"><ShieldCheck size={12}/>No credit pull. We only contact you.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Fact({ label, v }) {
  return <div className="bg-white border border-[#0F3D2E]/10 rounded-lg p-3">
    <div className="text-[10.5px] uppercase tracking-widest text-[#0F3D2E]/50 font-semibold">{label}</div>
    <div className="font-display text-lg text-[#0F3D2E] num font-semibold">{v}</div>
  </div>;
}
