import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { ArrowRight } from "lucide-react";
import ProductArt from "@/components/ProductArt";

// same palette map as landing
const PRODUCT_TINTS = {
  "home-loan":{tint:"#E0F5EC",accent:"#16A981"}, "business-loan":{tint:"#FFF3D6",accent:"#D89B00"},
  "lap":{tint:"#E4F1FB",accent:"#3287D6"}, "personal-loan":{tint:"#FCE7EA",accent:"#E24A6B"},
  "working-capital":{tint:"#FFEFDA",accent:"#E37800"}, "cc-od":{tint:"#F2E9FE",accent:"#8B5CF6"},
  "term-loan":{tint:"#DFF5F1",accent:"#0F8B7A"}, "equipment-finance":{tint:"#E9F1FF",accent:"#3357C1"},
  "project-finance":{tint:"#FBE9DA",accent:"#D25E1F"}, "construction-finance":{tint:"#FDECD8",accent:"#C05621"},
  "supply-chain-finance":{tint:"#E2F2FF",accent:"#1D8FE1"}, "invoice-discounting":{tint:"#F7E5F1",accent:"#B23B8A"},
  "loan-against-securities":{tint:"#FFF7C2",accent:"#B58900"}, "structured-finance":{tint:"#E7EDE9",accent:"#0F3D2E"},
  "private-credit":{tint:"#E1EDFD",accent:"#4C6FE1"},
};
const tintFor = (slug) => PRODUCT_TINTS[slug] || {tint:"#F1F7F3", accent:"#1F5B4A"};

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
        {products.map(p => {
          const s = tintFor(p.slug);
          return (
            <Link key={p.slug} to={`/product/${p.slug}`} data-testid={`prod-${p.slug}`}
                  className="group bg-white border border-[#0F3D2E]/10 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-transparent transition-all">
              <ProductArt slug={p.slug} tint={s.tint} accent={s.accent} size="lg"/>
              <div className="p-5">
                <div className="font-display text-xl font-bold text-[#0F3D2E]">{p.title}</div>
                <div className="text-sm text-[#0F3D2E]/60 mt-1">{p.tagline}</div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#0F3D2E]/8">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-wider text-[#0F3D2E]/50 font-bold">Rates from</div>
                    <div className="font-display text-2xl font-bold num" style={{color:s.accent}}>{p.rate_from}%</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10.5px] uppercase tracking-wider text-[#0F3D2E]/50 font-bold">Up to</div>
                    <div className="font-display text-sm font-bold text-[#0F3D2E] num">{inr(p.max_amount)}</div>
                  </div>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition" style={{color:s.accent}}/>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
