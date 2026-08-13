import { Button } from "@/components/ui/button";
import { Building2, ShieldCheck, TrendingUp, Landmark } from "lucide-react";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
export default function Login() {
  const startAuth = () => {
    const redirect = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
  };

  return (
    <div className="h-screen flex bg-slate-50" data-testid="login-page">
      <div className="w-1/2 hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
           style={{
             backgroundImage: `linear-gradient(rgba(15,23,42,0.72), rgba(15,23,42,0.85)), url('https://images.unsplash.com/photo-1479293581560-aee98bb24f7f?crop=entropy&cs=srgb&fm=jpg&q=85&w=1600')`,
             backgroundSize: "cover", backgroundPosition: "center",
           }}>
        <div className="text-white">
          <div className="flex items-center gap-2 font-display text-2xl font-semibold" data-testid="brand-logo">
            <Landmark size={26} strokeWidth={1.8}/>
            CorpZo <span className="text-orange-400">/ Debt</span>
          </div>
          <p className="mt-2 text-slate-300 text-sm">Origination · Credit · Facilitation · Payouts</p>
        </div>
        <div className="text-white space-y-4 max-w-md">
          <h1 className="font-display text-3xl leading-tight font-semibold">
            The operating system for CorpZo&apos;s debt business.
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            From lead ingestion through sanction, disbursement and commission — every case, every lender, every rupee, on one screen.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4 text-xs text-slate-300">
            <div><TrendingUp className="mb-1 text-orange-400" size={18}/>Pipeline & funnel</div>
            <div><ShieldCheck className="mb-1 text-orange-400" size={18}/>Audit-grade trail</div>
            <div><Building2 className="mb-1 text-orange-400" size={18}/>Multi-lender ops</div>
          </div>
        </div>
        <div className="text-slate-400 text-xs">© CorpZo Ventures Pvt Ltd</div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-2 font-display text-xl font-semibold">
            <Landmark size={22}/> CorpZo / Debt
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-900">Sign in</h2>
            <p className="text-slate-500 text-sm mt-1">Use your CorpZo Google account to continue.</p>
          </div>
          <Button
            data-testid="google-signin-btn"
            onClick={startAuth}
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" className="mr-2">
              <path fill="#EA4335" d="M12 5c1.63 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.74 14.97.5 12 .5 7.7.5 3.99 2.98 2.18 6.59l3.66 2.84C6.71 6.87 9.14 5 12 5z"/>
              <path fill="#34A853" d="M23.49 12.28c0-.79-.07-1.54-.19-2.28H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.87c2.17-2 3.71-4.98 3.71-8.68z"/>
              <path fill="#4A90E2" d="M5.84 14.09A7.55 7.55 0 0 1 5.4 12c0-.73.13-1.44.35-2.09L2.09 7.07A11.5 11.5 0 0 0 .5 12c0 1.83.44 3.56 1.22 5.08l4.12-2.99z"/>
              <path fill="#FBBC05" d="M12 23.5c3 0 5.5-1 7.34-2.7l-3.71-2.87c-1 .68-2.29 1.08-3.63 1.08-2.86 0-5.29-1.87-6.16-4.42l-4.12 2.99C3.99 21.02 7.7 23.5 12 23.5z"/>
            </svg>
            Continue with Google
          </Button>
          <div className="text-xs text-slate-500 space-y-2">
            <p>By continuing you agree to CorpZo&apos;s internal usage policy.</p>
            <p className="text-slate-400">Sandbox integrations for CIBIL, eSign & payments are pre-wired.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
