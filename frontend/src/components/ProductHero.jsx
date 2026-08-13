/**
 * Big illustrated product-hero banner used on the ProductDetail page.
 * Renders a full-width scene: borrower character on left, product motif on right,
 * with concentric rings, floating coins, liquid blob and a glass caption panel.
 */

/* Simple stylised borrower "character" — chosen per product to feel in-scene */
const CHARACTERS = {
  "home-loan":              "family",       // couple + kid
  "business-loan":          "business",     // suited entrepreneur
  "lap":                    "business",
  "personal-loan":          "individual",   // young person
  "working-capital":        "business",
  "cc-od":                  "business",
  "term-loan":              "business",
  "equipment-finance":      "engineer",     // person with helmet
  "project-finance":        "engineer",
  "construction-finance":   "engineer",
  "supply-chain-finance":   "business",
  "invoice-discounting":    "business",
  "loan-against-securities":"individual",
  "structured-finance":     "business",
  "private-credit":         "business",
};

function Character({ kind, accent }) {
  // Common colors
  const skin = "#EACFB6", clothesA = accent, clothesB = "#0F3D2E";
  if (kind === "family") {
    return (
      <g>
        {/* dad */}
        <circle cx="46" cy="118" r="14" fill={skin}/>
        <path d="M28 172 Q28 138 46 138 Q64 138 64 172 Z" fill={clothesA}/>
        {/* mom */}
        <circle cx="82" cy="122" r="13" fill={skin}/>
        <path d="M66 172 Q66 142 82 142 Q98 142 98 172 Z" fill={clothesB}/>
        {/* kid */}
        <circle cx="112" cy="140" r="9" fill={skin}/>
        <path d="M100 174 Q100 154 112 154 Q124 154 124 174 Z" fill="#FFD84D"/>
      </g>
    );
  }
  if (kind === "individual") {
    return (
      <g>
        <circle cx="70" cy="112" r="18" fill={skin}/>
        <path d="M38 178 Q38 138 70 138 Q102 138 102 178 Z" fill={clothesA}/>
        <path d="M50 148 h40" stroke={clothesB} strokeWidth="2"/>
      </g>
    );
  }
  if (kind === "engineer") {
    return (
      <g>
        {/* head + helmet */}
        <circle cx="70" cy="116" r="18" fill={skin}/>
        <path d="M46 116 Q46 92 70 90 Q94 92 94 116 Z" fill="#F59E0B"/>
        <path d="M42 118 H98" stroke={clothesB} strokeWidth="2"/>
        {/* vest */}
        <path d="M38 180 Q38 138 70 138 Q102 138 102 180 Z" fill="#FFD84D"/>
        <path d="M70 138 L70 180" stroke={clothesB} strokeWidth="1.5"/>
        <rect x="52" y="150" width="36" height="4" fill={clothesB}/>
      </g>
    );
  }
  // business default
  return (
    <g>
      <circle cx="70" cy="112" r="18" fill={skin}/>
      {/* suit */}
      <path d="M38 180 Q38 138 70 138 Q102 138 102 180 Z" fill={clothesB}/>
      {/* shirt V */}
      <path d="M58 138 L70 158 L82 138 Z" fill="white"/>
      {/* tie */}
      <path d="M70 158 L67 178 L73 178 Z" fill={clothesA}/>
    </g>
  );
}

/* Product-specific right-side scene (bigger version of ProductArt scenes) */
function ProductScene({ slug, accent }) {
  if (slug === "home-loan") {
    return <g>
      <path d="M212 176 L212 118 L280 66 L348 118 L348 176 Z" fill="white" stroke={accent} strokeWidth="3"/>
      <path d="M200 118 L280 58 L360 118" fill="none" stroke={accent} strokeWidth="3.5" strokeLinejoin="round"/>
      <rect x="256" y="140" width="28" height="36" fill={accent} rx="2"/>
      <rect x="298" y="132" width="20" height="20" fill={accent} opacity=".28" rx="1"/>
      <rect x="222" y="132" width="20" height="20" fill={accent} opacity=".28" rx="1"/>
      <path d="M180 176 L380 176" stroke={accent} strokeWidth="2" opacity=".4"/>
    </g>;
  }
  if (slug === "business-loan" || slug === "working-capital" || slug === "term-loan" || slug === "cc-od") {
    return <g>
      {/* growth chart */}
      <path d="M190 168 L226 132 L256 148 L294 96 L336 108 L370 78"
            stroke={accent} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {[[226,132],[256,148],[294,96],[336,108],[370,78]].map(([x,y],i)=>
        <circle key={i} cx={x} cy={y} r="5" fill={accent}/>)}
      {/* briefcase */}
      <rect x="298" y="130" width="60" height="42" rx="4" fill="white" stroke={accent} strokeWidth="2.5"/>
      <rect x="318" y="122" width="20" height="8" rx="1.5" fill={accent}/>
      <path d="M298 148 H358" stroke={accent} strokeWidth="1.5" opacity=".45"/>
    </g>;
  }
  if (slug === "lap") {
    return <g>
      <rect x="200" y="76" width="100" height="100" fill="white" stroke={accent} strokeWidth="3"/>
      {[0,1,2,3].map(r => [0,1,2,3].map(c => (
        <rect key={`${r}-${c}`} x={210 + c*22} y={86 + r*22} width="15" height="15" fill={accent} opacity={r%2===c%2?".55":".22"} rx="1"/>
      )))}
      <path d="M330 106 v-10 a12 12 0 0 1 24 0 v10" stroke={accent} strokeWidth="3" fill="none" strokeLinecap="round"/>
      <rect x="322" y="106" width="40" height="32" rx="4" fill={accent}/>
      <circle cx="342" cy="122" r="4" fill="white"/>
    </g>;
  }
  if (slug === "personal-loan") {
    return <g>
      <rect x="200" y="98" width="180" height="80" rx="6" fill="white" stroke={accent} strokeWidth="3"/>
      <path d="M200 130 H380" stroke={accent} strokeWidth="1" opacity=".3"/>
      <text x="220" y="152" fontFamily="Encode Sans" fontSize="42" fontWeight="800" fill={accent}>₹</text>
      <circle cx="326" cy="138" r="22" stroke={accent} strokeWidth="2.5" fill="none"/>
      <text x="316" y="146" fontFamily="Encode Sans" fontSize="20" fontWeight="800" fill={accent}>%</text>
    </g>;
  }
  if (slug === "equipment-finance" || slug === "project-finance" || slug === "construction-finance") {
    return <g>
      {/* gear */}
      <circle cx="252" cy="126" r="36" stroke={accent} strokeWidth="4" fill="white"/>
      {[0,45,90,135,180,225,270,315].map(a => {
        const rad = (a*Math.PI)/180;
        const x1 = 252+Math.cos(rad)*36, y1 = 126+Math.sin(rad)*36;
        const x2 = 252+Math.cos(rad)*48, y2 = 126+Math.sin(rad)*48;
        return <path key={a} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={accent} strokeWidth="6" strokeLinecap="round"/>;
      })}
      <circle cx="252" cy="126" r="10" fill={accent}/>
      {/* building next to it */}
      <rect x="308" y="88" width="66" height="90" fill="white" stroke={accent} strokeWidth="2.5"/>
      {[0,1,2].map(r => [0,1,2].map(c => (
        <rect key={`${r}-${c}`} x={316 + c*18} y={96 + r*22} width="12" height="14" fill={accent} opacity=".42"/>
      )))}
    </g>;
  }
  if (slug === "supply-chain-finance" || slug === "invoice-discounting") {
    return <g>
      {/* invoice */}
      <path d="M198 76 H296 L326 106 V178 H198 Z" fill="white" stroke={accent} strokeWidth="3" strokeLinejoin="round"/>
      <path d="M296 76 V106 H326" stroke={accent} strokeWidth="3" fill="none"/>
      {[118,132,146,160].map(y => <path key={y} d={`M212 ${y} H310`} stroke={accent} strokeWidth="1.5" opacity=".4"/>)}
      <circle cx="336" cy="152" r="22" fill={accent}/>
      <path d="M326 152 l7 7 l14 -14" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </g>;
  }
  if (slug === "loan-against-securities" || slug === "structured-finance" || slug === "private-credit") {
    return <g>
      {/* candlestick + bank */}
      {[{x:196,h:36,y:130},{x:224,h:60,y:106},{x:252,h:44,y:120},{x:280,h:76,y:96}].map((c,i)=>(
        <g key={i}>
          <path d={`M${c.x+8} ${c.y-10} v${c.h+22}`} stroke={accent} strokeWidth="1.6"/>
          <rect x={c.x} y={c.y} width="16" height={c.h} rx="2" fill={i%2?accent:"white"} stroke={accent} strokeWidth="2.5"/>
        </g>
      ))}
      <path d="M310 100 L354 76 L398 100 L398 110 L310 110 Z" fill="white" stroke={accent} strokeWidth="2.5" strokeLinejoin="round"/>
      {[0,1,2,3].map(i => (
        <rect key={i} x={320 + i*20} y={112} width="10" height="42" fill="white" stroke={accent} strokeWidth="2"/>
      ))}
      <rect x="306" y="156" width="100" height="8" fill={accent}/>
    </g>;
  }
  // default coin scene
  return <g>
    <circle cx="290" cy="130" r="50" fill="white" stroke={accent} strokeWidth="3"/>
    <text x="272" y="146" fontFamily="Encode Sans" fontSize="42" fontWeight="800" fill={accent}>₹</text>
  </g>;
}

/**
 * <ProductHero title tagline slug tint accent />
 */
export default function ProductHero({ title, tagline, slug, tint = "#F1F7F3", accent = "#1F5B4A" }) {
  const charKind = CHARACTERS[slug] || "business";
  return (
    <div className="relative overflow-hidden rounded-3xl mb-6" style={{background:`linear-gradient(120deg, ${tint} 0%, #FFFFFF 60%, ${tint} 100%)`}}>
      {/* liquid blob */}
      <div className="absolute -top-24 -right-16 w-72 h-72 blur-3xl opacity-70 liquid-blob" style={{background:accent}}/>
      <div className="absolute -bottom-16 -left-16 w-56 h-56 blur-3xl opacity-40 liquid-blob-2" style={{background:accent}}/>
      {/* concentric rings */}
      <svg className="absolute -right-20 -top-20 opacity-25" width="500" height="500" viewBox="0 0 500 500" fill="none">
        {[80,140,200,260].map(r => <circle key={r} cx="250" cy="250" r={r} stroke={accent} strokeWidth="0.6" strokeDasharray="3 6"/>)}
      </svg>
      {/* floating coins */}
      <div className="absolute inset-0 pointer-events-none">
        {[{x:38,y:30,d:0},{x:75,y:15,d:1.2},{x:88,y:52,d:0.6}].map((c,i) => (
          <div key={i} className="absolute w-9 h-9 rounded-full border-2 flex items-center justify-center font-display font-bold text-lg"
               style={{
                 left:`${c.x}%`, top:`${c.y}%`,
                 borderColor:accent, color:accent, background:"rgba(255,255,255,0.75)",
                 animation:`float 5s ease-in-out ${c.d}s infinite`
               }}>₹</div>
        ))}
      </div>

      {/* SVG scene */}
      <svg viewBox="0 0 500 220" className="w-full h-56 md:h-72 relative">
        {/* ground line */}
        <path d="M0 200 L500 200" stroke={accent} strokeWidth="1.5" opacity=".25"/>
        {/* character */}
        <g style={{filter: `drop-shadow(0 6px 8px ${accent}22)`}}>
          <Character kind={charKind} accent={accent}/>
        </g>
        {/* scene */}
        <g style={{filter: `drop-shadow(0 6px 8px ${accent}22)`}}>
          <ProductScene slug={slug} accent={accent}/>
        </g>
      </svg>

      {/* Glass caption */}
      <div className="absolute left-6 bottom-6 right-6 md:left-8 md:bottom-8 md:right-auto md:max-w-lg glass-light rounded-2xl px-5 py-4 shadow-lg">
        <div className="text-[10.5px] uppercase tracking-widest font-bold" style={{color:accent}}>CorpZo Product</div>
        <div className="font-display text-2xl md:text-3xl font-bold text-[#0F3D2E] mt-0.5">{title}</div>
        <div className="text-sm text-[#0F3D2E]/70 mt-1 line-clamp-2">{tagline}</div>
      </div>
    </div>
  );
}
