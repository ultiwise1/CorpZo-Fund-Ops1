import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowRight, Landmark, Search, Handshake } from "lucide-react";
import { Input } from "@/components/ui/input";

const TYPE_STYLE = {
  "PSU Bank":            { tint: "#E6F1FB", accent: "#3287D6" },
  "Private Bank":        { tint: "#FFE4DE", accent: "#FF6B4E" },
  "Foreign Bank":        { tint: "#EEE5FF", accent: "#7C4DE0" },
  "Small Finance Bank":  { tint: "#FFF3D6", accent: "#D89B00" },
  "NBFC":                { tint: "#DFF5F1", accent: "#0F9F5F" },
  "Housing Finance":     { tint: "#FDECD8", accent: "#C05621" },
  "Specialty NBFC":      { tint: "#F2E9FE", accent: "#8B5CF6" },
  "Private Credit":      { tint: "#E7EDE9", accent: "#0B1F3A" },
};

export default function AllBanks() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");

  const [error, setError] = useState(null);

  useEffect(() => {
    api.get("/public/lenders")
      .then(r => setData(r.data))
      .catch(() => setError("Couldn't reach our lender directory. Please refresh in a moment."));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return data.by_type;
    return data.by_type
      .map(g => ({ ...g, names: g.names.filter(n => n.toLowerCase().includes(needle)) }))
      .filter(g => g.names.length > 0);
  }, [data, q]);

  return (
    <div className="text-[#0B1F3A]" data-testid="banks-page">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B1F3A] to-[#132D5C] text-white py-16 border-b border-white/10">
        <div className="absolute -right-32 top-0 w-96 h-96 rounded-full bg-[#FFD84D]/15 blur-3xl"/>
        <div className="max-w-7xl mx-auto px-6 relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10.5px] uppercase tracking-widest font-bold">
              <Landmark size={12}/>Verified lender network
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mt-4 leading-[1.03]">
              {data ? <><span className="text-[#FFD84D] num">{data.total}+</span> banks &amp; NBFCs</> : "Every lender under one roof"}<br/>
              work with CorpZo.
            </h1>
            <p className="text-white/75 mt-4 max-w-2xl">
              From India&apos;s largest scheduled commercial banks to specialist NBFCs, small-finance banks, housing finance companies and private credit funds — we&apos;ll place your deal where it fits sharpest.
            </p>
            <div className="mt-6 max-w-md relative">
              <Search size={16} className="absolute left-3 top-3.5 text-white/50"/>
              <Input value={q} onChange={e => setQ(e.target.value)}
                     placeholder="Search bank or NBFC (e.g. HDFC, SBI, Bajaj)"
                     className="pl-9 bg-white/10 border-white/25 text-white placeholder:text-white/50 h-12 focus-visible:ring-[#FFD84D]"
                     data-testid="banks-search"/>
            </div>
          </div>
          {/* Right — mini stats card */}
          <div className="bg-white/5 backdrop-blur border border-white/15 rounded-2xl p-6" data-testid="banks-snapshot">
            <div className="text-[10.5px] uppercase tracking-widest text-[#FFD84D] font-bold">Live network snapshot</div>
            <div className="mt-3 grid grid-cols-2 gap-4">
              {(data?.by_type || []).slice(0, 8).map(g => (
                <div key={g.type} data-testid={`snapshot-${g.type.replace(/\s+/g, '-').toLowerCase()}`}>
                  <div className="font-display text-2xl font-bold text-white num leading-none">{g.count}</div>
                  <div className="text-[10.5px] text-white/60 uppercase tracking-widest mt-1 font-semibold">{g.type}</div>
                </div>
              ))}
              {!data && Array.from({ length: 8 }).map((_, i) => (
                <div key={i}>
                  <div className="h-6 w-10 bg-white/10 rounded animate-pulse"/>
                  <div className="h-3 w-16 bg-white/10 rounded animate-pulse mt-2"/>
                </div>
              ))}
            </div>
            {data && (
              <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10.5px] uppercase tracking-widest text-white/50 font-semibold">Total partners</div>
                  <div className="font-display text-3xl font-bold text-[#FFD84D] num" data-testid="banks-snapshot-total">{data.total}+</div>
                </div>
                <Link to="/apply" className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-[#FF6B4E] hover:bg-[#E85A3D] text-white text-sm font-bold">
                  Apply now<ArrowRight size={13}/>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Directory */}
      <section className="max-w-7xl mx-auto px-6 py-14 space-y-10">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-sm text-red-800" data-testid="banks-error">
            {error}
          </div>
        )}
        {!data && !error && <div className="text-center text-slate-500">Loading lender directory…</div>}
        {filtered.map(g => {
          const s = TYPE_STYLE[g.type] || { tint: "#F1F4F1", accent: "#1B3A6B" };
          return (
            <div key={g.type} data-testid={`bank-group-${g.type.replace(/\s+/g, '-').toLowerCase()}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.tint, color: s.accent }}>
                    <Landmark size={18}/>
                  </div>
                  <div>
                    <div className="font-display text-xl font-bold text-[#0B1F3A]">{g.type}</div>
                    <div className="text-xs text-[#0B1F3A]/55">{g.names.length} partners</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {g.names.map((name, i) => (
                  <div key={name} data-testid={`bank-${g.type.replace(/\s+/g, '-').toLowerCase()}-${i}`}
                       className="h-16 rounded-lg border border-[#0B1F3A]/10 bg-white hover:border-[#FF6B4E]/40 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center px-2 text-center">
                    <span className="font-display text-[12.5px] font-bold text-[#0B1F3A]/80 leading-tight">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {data && filtered.length === 0 && (
          <div className="text-center py-10 text-[#0B1F3A]/60">
            No lender matched &ldquo;{q}&rdquo;. Try &ldquo;HDFC&rdquo;, &ldquo;SBI&rdquo;, or &ldquo;Bajaj&rdquo;.
          </div>
        )}
      </section>

      {/* CTA band */}
      <section className="relative bg-gradient-to-r from-[#FF6B4E] via-[#FF7E45] to-[#FFD84D] text-white py-14 mt-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-[10.5px] uppercase tracking-widest text-white/85 font-bold">Ready to apply?</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-1">One application. Every lender.</h2>
            <p className="text-white/85 mt-1 max-w-xl">Submit once, we&apos;ll shortlist the sharpest quotes from this list.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/apply" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-[#0B1F3A] hover:bg-[#081733] text-white font-bold">
              Apply now<ArrowRight size={15}/>
            </Link>
            <Link to="/become-partner" className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-white text-[#0B1F3A] font-bold hover:bg-[#FFD84D]">
              <Handshake size={15}/>Partner with us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
