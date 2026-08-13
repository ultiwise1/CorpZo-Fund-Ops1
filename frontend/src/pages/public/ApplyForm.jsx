import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export function Thanks() {
  const [sp] = useSearchParams();
  const lead = sp.get("lead");
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center" data-testid="thanks-page">
      <div className="w-16 h-16 rounded-full bg-[#1F5B4A]/10 text-[#1F5B4A] flex items-center justify-center mx-auto"><CheckCircle2 size={30}/></div>
      <h1 className="font-display text-3xl font-semibold text-[#0F3D2E] mt-4">Application received</h1>
      <p className="text-[#0F3D2E]/70 mt-2">Our credit team has your enquiry and will call you within an hour on weekdays.</p>
      {lead && <div className="mt-6 inline-block bg-white border border-[#0F3D2E]/10 rounded-lg px-4 py-3">
        <div className="text-xs text-[#8A6600] uppercase tracking-widest">Reference</div>
        <div className="mono text-[#0F3D2E] mt-0.5">{lead}</div>
      </div>}
      <div className="mt-8 flex gap-3 justify-center">
        <Link to="/products"><Button variant="outline" className="border-[#0F3D2E]/20 text-[#0F3D2E] hover:bg-[#0F3D2E]/5">Explore more products</Button></Link>
        <Link to="/my"><Button className="bg-[#1F5B4A] hover:bg-[#0F3D2E] text-white">Track my application</Button></Link>
      </div>
    </div>
  );
}

export function ApplyForm() {
  const [products, setProducts] = useState([]);
  useEffect(() => { api.get("/public/products").then(r => setProducts(r.data)); }, []);
  return (
    <div className="max-w-4xl mx-auto px-6 py-12" data-testid="apply-page">
      <div className="text-xs uppercase tracking-widest text-[#8A6600] font-semibold">Apply</div>
      <h1 className="font-display text-3xl font-semibold text-[#0F3D2E] mt-1">Pick a product to get started</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {products.map(p => (
          <Link key={p.slug} to={`/product/${p.slug}`} className="bg-white border border-[#0F3D2E]/10 rounded-lg p-4 hover:shadow-md hover:-translate-y-0.5 hover:border-[#1F5B4A]/30 transition">
            <div className="font-display text-lg text-[#0F3D2E] font-semibold">{p.title}</div>
            <div className="text-xs text-[#0F3D2E]/55 mt-0.5">{p.tagline}</div>
            <div className="text-xs text-[#1F5B4A] mt-2 font-semibold">From {p.rate_from}% →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
