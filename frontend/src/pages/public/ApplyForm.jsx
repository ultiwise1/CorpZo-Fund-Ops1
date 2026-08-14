import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export function Thanks() {
  const [sp] = useSearchParams();
  const lead = sp.get("lead");
  const partner = sp.get("partner");
  const isPartner = !!partner;
  return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center" data-testid="thanks-page">
      <div className="w-16 h-16 rounded-full bg-[#1B3A6B]/10 text-[#1B3A6B] flex items-center justify-center mx-auto"><CheckCircle2 size={30}/></div>
      <h1 className="font-display text-3xl font-semibold text-[#0B1F3A] mt-4">
        {isPartner ? "Partner application received" : "Application received"}
      </h1>
      <p className="text-[#0B1F3A]/70 mt-2">
        {isPartner
          ? "Our channel-manager team has your interest and will call you within 1 business day to complete onboarding."
          : "Our credit team has your enquiry and will call you within an hour on weekdays."}
      </p>
      {(lead || partner) && <div className="mt-6 inline-block bg-white border border-[#0B1F3A]/10 rounded-lg px-4 py-3" data-testid="thanks-reference">
        <div className="text-xs text-[#8A6600] uppercase tracking-widest">{isPartner ? "Partner reference" : "Reference"}</div>
        <div className="mono text-[#0B1F3A] mt-0.5">{lead || partner}</div>
      </div>}
      <div className="mt-8 flex gap-3 justify-center flex-wrap">
        {isPartner ? (
          <>
            <Link to="/become-partner"><Button variant="outline" className="border-[#0B1F3A]/20 text-[#0B1F3A] hover:bg-[#0B1F3A]/5">Back to partner page</Button></Link>
            <Link to="/products"><Button className="bg-[#1B3A6B] hover:bg-[#0B1F3A] text-white">Explore CorpZo products</Button></Link>
          </>
        ) : (
          <>
            <Link to="/products"><Button variant="outline" className="border-[#0B1F3A]/20 text-[#0B1F3A] hover:bg-[#0B1F3A]/5">Explore more products</Button></Link>
            <Link to="/my"><Button className="bg-[#1B3A6B] hover:bg-[#0B1F3A] text-white">Track my application</Button></Link>
          </>
        )}
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
      <h1 className="font-display text-3xl font-semibold text-[#0B1F3A] mt-1">Pick a product to get started</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {products.map(p => (
          <Link key={p.slug} to={`/product/${p.slug}`} className="bg-white border border-[#0B1F3A]/10 rounded-lg p-4 hover:shadow-md hover:-translate-y-0.5 hover:border-[#1B3A6B]/30 transition">
            <div className="font-display text-lg text-[#0B1F3A] font-semibold">{p.title}</div>
            <div className="text-xs text-[#0B1F3A]/55 mt-0.5">{p.tagline}</div>
            <div className="text-xs text-[#1B3A6B] mt-2 font-semibold">From {p.rate_from}% →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
