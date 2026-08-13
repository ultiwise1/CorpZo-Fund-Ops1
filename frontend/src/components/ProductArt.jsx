/**
 * Custom SVG illustrations per debt product (aligned to backend product slugs).
 * Each scene uses `tint` as background and `accent` for main strokes.
 */

const scenes = {
  "home-loan": ({ accent }) => (
    <>
      <circle cx="112" cy="20" r="8" fill={accent} opacity=".18"/>
      <path d="M20 78 L20 50 L52 26 L84 50 L84 78 Z" fill="white" stroke={accent} strokeWidth="2"/>
      <path d="M14 50 L52 22 L90 50" fill="none" stroke={accent} strokeWidth="2.4" strokeLinejoin="round"/>
      <rect x="40" y="58" width="14" height="20" fill={accent} rx="1.5"/>
      <rect x="60" y="54" width="10" height="10" fill={accent} opacity=".28" rx="1"/>
      <rect x="30" y="54" width="10" height="10" fill={accent} opacity=".28" rx="1"/>
      <path d="M0 78 L128 78" stroke={accent} strokeWidth="1.4" opacity=".35"/>
    </>
  ),
  "business-loan": ({ accent }) => (
    <>
      <path d="M8 72 L34 52 L54 60 L80 34 L104 42" stroke={accent} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      {[[34,52],[54,60],[80,34],[104,42]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.4" fill={accent}/>)}
      <rect x="82" y="54" width="34" height="22" rx="3" fill="white" stroke={accent} strokeWidth="1.8"/>
      <rect x="94" y="50" width="10" height="4" rx="1" fill={accent}/>
      <path d="M82 64 H116" stroke={accent} strokeWidth="1.2" opacity=".45"/>
    </>
  ),
  "lap": ({ accent }) => (
    <>
      <rect x="14" y="26" width="52" height="52" fill="white" stroke={accent} strokeWidth="2"/>
      {[0,1,2].map(r => [0,1,2].map(c => (
        <rect key={`${r}-${c}`} x={20 + c*15} y={32 + r*15} width="9" height="9" fill={accent} opacity={r%2===c%2?".55":".22"} rx="1"/>
      )))}
      <path d="M82 44 v-6 a8 8 0 0 1 16 0 v6" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <rect x="76" y="44" width="28" height="22" rx="3" fill={accent}/>
      <circle cx="90" cy="55" r="3" fill="white"/>
    </>
  ),
  "personal-loan": ({ accent }) => (
    <>
      <circle cx="38" cy="34" r="10" fill="white" stroke={accent} strokeWidth="2"/>
      <path d="M18 76 Q18 54 38 54 Q58 54 58 76" fill="white" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
      <rect x="66" y="46" width="42" height="26" rx="2" fill="white" stroke={accent} strokeWidth="1.8"/>
      <text x="78" y="64" fontFamily="Encode Sans, sans-serif" fontSize="16" fontWeight="700" fill={accent}>₹</text>
      <circle cx="96" cy="59" r="5" stroke={accent} strokeWidth="1.4" fill="none"/>
    </>
  ),
  "working-capital": ({ accent }) => (
    <>
      <circle cx="64" cy="50" r="26" stroke={accent} strokeWidth="2" fill="none" strokeDasharray="4 4"/>
      <circle cx="34" cy="50" r="9" fill="white" stroke={accent} strokeWidth="2"/>
      <text x="30" y="55" fontFamily="Encode Sans" fontSize="12" fontWeight="700" fill={accent}>₹</text>
      <circle cx="94" cy="50" r="9" fill={accent}/>
      <text x="90" y="55" fontFamily="Encode Sans" fontSize="12" fontWeight="700" fill="white">₹</text>
      <path d="M62 24 L70 20 L70 28" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M66 76 L58 80 L58 72" stroke={accent} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </>
  ),
  "cc-od": ({ accent }) => (
    <>
      <circle cx="64" cy="50" r="28" stroke={accent} strokeWidth="8" fill="none" opacity=".2"/>
      <path d="M64 22 a28 28 0 0 1 20 48" stroke={accent} strokeWidth="8" fill="none" strokeLinecap="round"/>
      <text x="48" y="58" fontFamily="Encode Sans" fontSize="22" fontWeight="800" fill={accent}>%</text>
      <circle cx="102" cy="34" r="4" fill={accent}/>
    </>
  ),
  "term-loan": ({ accent }) => (
    <>
      {[{x:16,h:20,y:44},{x:34,h:34,y:30},{x:52,h:26,y:38},{x:70,h:42,y:22},{x:88,h:32,y:32},{x:106,h:46,y:18}].map((c,i)=>(
        <g key={i}>
          <path d={`M${c.x+4} ${c.y-6} v${c.h+12}`} stroke={accent} strokeWidth="1.2"/>
          <rect x={c.x} y={c.y} width="10" height={c.h} rx="1.5" fill={i%2?accent:"white"} stroke={accent} strokeWidth="1.8"/>
        </g>
      ))}
      <path d="M6 74 H120" stroke={accent} strokeWidth="1.5" opacity=".35"/>
    </>
  ),
  "equipment-finance": ({ accent }) => (
    <>
      {/* gear + press */}
      <circle cx="38" cy="48" r="18" stroke={accent} strokeWidth="2.4" fill="white"/>
      {[0,45,90,135,180,225,270,315].map(a => {
        const rad = (a*Math.PI)/180;
        const x1 = 38+Math.cos(rad)*18, y1 = 48+Math.sin(rad)*18;
        const x2 = 38+Math.cos(rad)*24, y2 = 48+Math.sin(rad)*24;
        return <path key={a} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={accent} strokeWidth="3.5" strokeLinecap="round"/>;
      })}
      <circle cx="38" cy="48" r="5" fill={accent}/>
      <rect x="70" y="30" width="42" height="8" fill={accent}/>
      <rect x="82" y="38" width="18" height="18" fill="white" stroke={accent} strokeWidth="2"/>
      <path d="M82 60 H100" stroke={accent} strokeWidth="3" strokeLinecap="round"/>
    </>
  ),
  "project-finance": ({ accent }) => (
    <>
      {/* factory */}
      <path d="M14 78 L14 46 L34 46 L34 34 L58 46 L58 34 L82 46 L82 34 L108 46 L108 78 Z" fill="white" stroke={accent} strokeWidth="2" strokeLinejoin="round"/>
      {[24,48,72,96].map(x => <rect key={x} x={x} y="60" width="8" height="12" fill={accent}/>)}
      {[42,66,90].map(x => <circle key={x} cx={x} cy="52" r="2.5" fill={accent} opacity=".6"/>)}
      {/* smoke */}
      <circle cx="22" cy="24" r="4" fill={accent} opacity=".2"/>
      <circle cx="30" cy="20" r="3" fill={accent} opacity=".15"/>
    </>
  ),
  "construction-finance": ({ accent }) => (
    <>
      <path d="M18 78 V22" stroke={accent} strokeWidth="3" strokeLinecap="round"/>
      <path d="M18 22 H84" stroke={accent} strokeWidth="3" strokeLinecap="round"/>
      <path d="M18 30 H70 L18 22" stroke={accent} strokeWidth="1.5" fill="none" opacity=".6"/>
      <path d="M56 22 V38" stroke={accent} strokeWidth="1.6"/>
      <rect x="50" y="38" width="12" height="10" fill={accent}/>
      <rect x="72" y="42" width="42" height="36" fill="white" stroke={accent} strokeWidth="2"/>
      {[0,1,2].map(r => [0,1,2].map(c => (
        <rect key={`${r}-${c}`} x={76 + c*11} y={46 + r*10} width="7" height="6" fill={accent} opacity=".42"/>
      )))}
    </>
  ),
  "supply-chain-finance": ({ accent }) => (
    <>
      {/* connected nodes */}
      {[[24,32],[64,20],[104,32],[24,68],[64,80],[104,68],[64,50]].map(([x,y],i)=>
        <circle key={i} cx={x} cy={y} r={i===6?9:6} fill={i===6?accent:"white"} stroke={accent} strokeWidth="2"/>
      )}
      {[[24,32,64,50],[104,32,64,50],[64,20,64,50],[24,68,64,50],[104,68,64,50],[64,80,64,50]].map(([x1,y1,x2,y2],i)=>
        <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={accent} strokeWidth="1.6" opacity=".5"/>
      )}
      <text x="59" y="56" fontFamily="Encode Sans" fontSize="12" fontWeight="700" fill="white">₹</text>
    </>
  ),
  "invoice-discounting": ({ accent }) => (
    <>
      <path d="M28 20 H88 L100 32 V80 L28 80 Z" fill="white" stroke={accent} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M88 20 V32 H100" stroke={accent} strokeWidth="2" fill="none"/>
      {[38,48,58,68].map(y => <path key={y} d={`M38 ${y} H86`} stroke={accent} strokeWidth="1.4" opacity=".4"/>)}
      <circle cx="98" cy="68" r="12" fill={accent}/>
      <path d="M92 68 l4 4 l8 -8" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </>
  ),
  "loan-against-securities": ({ accent }) => (
    <>
      {/* candlestick + stock icon */}
      <rect x="12" y="46" width="8" height="26" fill={accent} opacity=".85"/>
      <rect x="28" y="34" width="8" height="38" fill={accent}/>
      <rect x="44" y="52" width="8" height="20" fill={accent} opacity=".7"/>
      <rect x="60" y="28" width="8" height="44" fill={accent}/>
      <rect x="76" y="42" width="8" height="30" fill={accent} opacity=".8"/>
      {/* certificate */}
      <rect x="88" y="20" width="30" height="28" rx="2" fill="white" stroke={accent} strokeWidth="1.8"/>
      <circle cx="103" cy="34" r="4" fill={accent}/>
      <path d="M99 40 L100 46 L103 43 L106 46 L107 40" fill={accent}/>
      <path d="M6 74 H120" stroke={accent} strokeWidth="1.4" opacity=".35"/>
    </>
  ),
  "structured-finance": ({ accent }) => (
    <>
      <path d="M18 34 L64 16 L110 34 L110 42 L18 42 Z" fill="white" stroke={accent} strokeWidth="2" strokeLinejoin="round"/>
      {[0,1,2,3].map(i => (
        <rect key={i} x={26 + i*22} y={44} width="10" height="26" fill="white" stroke={accent} strokeWidth="1.8"/>
      ))}
      <rect x="14" y="72" width="100" height="6" fill={accent}/>
      <circle cx="64" cy="28" r="3" fill={accent}/>
    </>
  ),
  "private-credit": ({ accent }) => (
    <>
      {/* diamond + growth */}
      <path d="M64 18 L96 42 L64 82 L32 42 Z" fill="white" stroke={accent} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M32 42 L96 42" stroke={accent} strokeWidth="1.6"/>
      <path d="M64 18 L48 42 L64 82 M64 18 L80 42 L64 82" stroke={accent} strokeWidth="1.2" opacity=".55"/>
      <text x="56" y="56" fontFamily="Encode Sans" fontSize="16" fontWeight="800" fill={accent}>₹</text>
      <circle cx="110" cy="24" r="3" fill={accent}/>
      <circle cx="18" cy="70" r="2.5" fill={accent} opacity=".55"/>
    </>
  ),
};

const DEFAULT_SCENE = ({ accent }) => (
  <>
    <circle cx="64" cy="50" r="30" fill="white" stroke={accent} strokeWidth="2"/>
    <text x="52" y="58" fontFamily="Encode Sans" fontSize="22" fontWeight="800" fill={accent}>₹</text>
  </>
);

/** <ProductArt slug tint accent size /> */
export default function ProductArt({ slug, tint = "#F1F7F3", accent = "#1F5B4A", className = "", size = "md" }) {
  const Scene = scenes[slug] || DEFAULT_SCENE;
  const heights = { sm: 88, md: 128, lg: 200 };
  const h = heights[size] || 128;
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: tint, height: h }}>
      <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl opacity-40" style={{ background: accent }}/>
      <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full blur-2xl opacity-25" style={{ background: accent }}/>
      <svg viewBox="0 0 128 100" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="relative">
        <Scene accent={accent} tint={tint}/>
      </svg>
    </div>
  );
}
