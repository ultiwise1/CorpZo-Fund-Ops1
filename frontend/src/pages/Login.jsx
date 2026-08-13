import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShieldCheck, TrendingUp, Landmark, ArrowLeft, Sparkles } from "lucide-react";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function Login() {
  const startAuth = () => {
    const redirect = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
  };

  return (
    <div className="h-screen flex bg-[#0F3D2E] text-white overflow-hidden relative" data-testid="login-page">
      {/* neon aurora glows */}
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[#DFFF3B]/20 blur-3xl liquid-blob"/>
      <div className="absolute -bottom-56 -right-40 w-[560px] h-[560px] rounded-full bg-[#00FFE1]/15 blur-3xl liquid-blob-2"/>
      <div className="absolute inset-0 bg-dot-grid opacity-40"/>

      {/* LEFT — brand panel */}
      <div className="w-1/2 hidden lg:flex flex-col justify-between p-12 relative">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 font-display text-2xl font-bold text-white" data-testid="brand-logo">
            <Landmark size={26} strokeWidth={1.8} className="text-[#FFD84D]"/> CORPZO
            <span className="ml-2 text-[10.5px] uppercase tracking-widest text-[#DFFF3B]/80">Debt CRM</span>
          </Link>
          <p className="mt-3 text-white/60 text-sm">Origination · Credit · Facilitation · Payouts</p>
        </div>

        <div className="relative">
          {/* liquid blob illustration */}
          <div className="absolute -top-16 -left-12 w-72 h-72 bg-gradient-to-br from-[#DFFF3B]/40 to-[#00FFE1]/30 blur-2xl liquid-blob opacity-70"/>
          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-xl border border-white/15 text-[#DFFF3B] text-[10.5px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full">
              <Sparkles size={12}/> Internal Workspace
            </div>
            <h1 className="font-display text-4xl leading-[1.05] font-bold mt-4 text-white">
              The operating system for<br/>
              <span className="neon-lime">CorpZo&apos;s debt business.</span>
            </h1>
            <p className="text-white/65 text-sm mt-4 leading-relaxed max-w-md">
              From lead ingestion through sanction, disbursement and commission — every case, every lender, every rupee, on one screen.
            </p>
            <div className="grid grid-cols-3 gap-3 pt-6 text-xs text-white/75 max-w-md">
              <FeatureChip icon={TrendingUp} label="Pipeline & funnel"/>
              <FeatureChip icon={ShieldCheck} label="Audit-grade trail"/>
              <FeatureChip icon={Landmark}     label="Multi-lender ops"/>
            </div>
          </div>
        </div>

        <div className="text-white/40 text-xs">© CorpZo Ventures Pvt Ltd</div>
      </div>

      {/* RIGHT — glass sign-in card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-sm">
          <Link to="/" className="text-white/60 text-xs inline-flex items-center gap-1 hover:text-white mb-4" data-testid="back-to-site-link">
            <ArrowLeft size={12}/> Back to corpzo.com
          </Link>

          <div className="glass-dark rounded-2xl p-8 shadow-2xl border border-white/10">
            <div className="lg:hidden flex items-center gap-2 font-display text-xl font-bold mb-6 text-white">
              <Landmark size={22} className="text-[#FFD84D]"/> CORPZO
            </div>
            <div className="mb-6">
              <h2 className="font-display text-3xl font-bold text-white">Sign in</h2>
              <p className="text-white/60 text-sm mt-1.5">Use your CorpZo Google account to continue.</p>
            </div>
            <Button
              data-testid="google-signin-btn"
              onClick={startAuth}
              className="w-full h-12 bg-white hover:bg-[#DFFF3B] text-[#0F3D2E] font-semibold shadow-lg neon-glow-hover transition-all"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2">
                <path fill="#EA4335" d="M12 5c1.63 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.74 14.97.5 12 .5 7.7.5 3.99 2.98 2.18 6.59l3.66 2.84C6.71 6.87 9.14 5 12 5z"/>
                <path fill="#34A853" d="M23.49 12.28c0-.79-.07-1.54-.19-2.28H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.87c2.17-2 3.71-4.98 3.71-8.68z"/>
                <path fill="#4A90E2" d="M5.84 14.09A7.55 7.55 0 0 1 5.4 12c0-.73.13-1.44.35-2.09L2.09 7.07A11.5 11.5 0 0 0 .5 12c0 1.83.44 3.56 1.22 5.08l4.12-2.99z"/>
                <path fill="#FBBC05" d="M12 23.5c3 0 5.5-1 7.34-2.7l-3.71-2.87c-1 .68-2.29 1.08-3.63 1.08-2.86 0-5.29-1.87-6.16-4.42l-4.12 2.99C3.99 21.02 7.7 23.5 12 23.5z"/>
              </svg>
              Continue with Google
            </Button>
            <div className="mt-6 pt-5 border-t border-white/10 text-xs text-white/50 space-y-1.5">
              <p>By continuing you agree to CorpZo&apos;s internal usage policy.</p>
              <p className="text-white/40">Not a CorpZo employee? <Link to="/" className="text-[#DFFF3B] hover:underline">Explore products →</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureChip({ icon: Icon, label }) {
  return (
    <div className="glass-dark rounded-lg p-3 border border-white/10 hover:border-[#DFFF3B]/30 transition">
      <Icon className="mb-1.5 text-[#DFFF3B]" size={16}/>
      <div className="text-[11px] text-white/70">{label}</div>
    </div>
  );
}
