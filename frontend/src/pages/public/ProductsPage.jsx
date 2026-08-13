import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { ArrowRight } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => { api.get("/public/products").then(r => setProducts(r.data)); }, []);
  return (
    <div className="max-w-7xl mx-auto px-6 py-12" data-testid="products-page">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-[#8A6600] font-semibold">Product catalogue</div>
        <h1 className="font-display text-4xl font-semibold text-[#0F3D2E] mt-1">15 debt products, one platform</h1>
        <p className="text-[#0F3D2E]/70 mt-2 max-w-2xl">From ₹50k personal loans to ₹500 Cr structured deals — CorpZo covers the full retail-to-institutional debt spectrum.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map(p => (
          <Link key={p.slug} to={`/product/${p.slug}`} data-testid={`prod-${p.slug}`}
                className="group bg-white border border-[#0F3D2E]/10 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-[#1F5B4A]/30 transition">
            <div className="aspect-[16/9] overflow-hidden bg-slate-100">
              <img src={p.hero_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
            </div>
            <div className="p-5">
              <div className="font-display text-xl font-semibold text-[#0F3D2E]">{p.title}</div>
              <div className="text-sm text-[#0F3D2E]/60 mt-1">{p.tagline}</div>
              <div className="flex items-center justify-between mt-4">
                <div>
                  <div className="text-[10.5px] uppercase tracking-wider text-[#8A6600] font-semibold">Rates from</div>
                  <div className="font-display text-2xl text-[#1F5B4A] num">{p.rate_from}%</div>
                </div>
                <div className="text-right">
                  <div className="text-[10.5px] uppercase tracking-wider text-[#0F3D2E]/50 font-semibold">Up to</div>
                  <div className="font-display text-sm text-[#0F3D2E] num">{inr(p.max_amount)}</div>
                </div>
                <ArrowRight size={18} className="text-[#0F3D2E]/30 group-hover:text-[#1F5B4A] group-hover:translate-x-1 transition"/>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
