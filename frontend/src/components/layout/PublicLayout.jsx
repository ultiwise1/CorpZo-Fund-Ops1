import { NavLink, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Landmark } from "lucide-react";
import { api } from "@/lib/api";

export function PublicNav({ user }) {
  const nav = useNavigate();
  const logout = async () => { try { await api.post("/auth/logout"); } catch {}; nav("/"); window.location.reload(); };
  const startAuth = () => {
    const redirect = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
  };
  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF7]/90 backdrop-blur border-b border-[#0F3D2E]/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-[#0F3D2E]" data-testid="public-brand">
          <Landmark size={22} className="text-[#1F5B4A]"/>CORPZO
          <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-[#8A6600] ml-1">Debt Marketplace</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[#0F3D2E]/72">
          <NavLink to="/products" className={({isActive})=>isActive?"text-[#0F3D2E] font-semibold":"hover:text-[#0F3D2E]"} data-testid="nav-public-products">Products</NavLink>
          <NavLink to="/calculators" className={({isActive})=>isActive?"text-[#0F3D2E] font-semibold":"hover:text-[#0F3D2E]"}>EMI Calculator</NavLink>
          <NavLink to="/apply" className={({isActive})=>isActive?"text-[#0F3D2E] font-semibold":"hover:text-[#0F3D2E]"}>Apply</NavLink>
          <a href="#partners" className="hover:text-[#0F3D2E]">Partners</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            user.role === "customer" ? (
              <>
                <Button variant="outline" size="sm" onClick={()=>nav("/my")} data-testid="my-portal-btn" className="border-[#0F3D2E]/20 text-[#0F3D2E] hover:bg-[#0F3D2E]/5">My Applications</Button>
                <Button size="sm" variant="ghost" onClick={logout} className="text-[#0F3D2E]/70 hover:text-[#0F3D2E]">Sign out</Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={()=>nav(user.role === "channel_partner" ? "/partner/dashboard" : "/dashboard")} className="border-[#0F3D2E]/20 text-[#0F3D2E]">Open workspace</Button>
            )
          ) : (
            <Button className="bg-[#1F5B4A] hover:bg-[#0F3D2E] text-white" size="sm" onClick={startAuth} data-testid="public-signin-btn">Sign in / Sign up</Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-[#0F3D2E] text-white/60 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 text-white font-display text-lg font-semibold mb-3">
            <Landmark size={20} className="text-[#FFD700]"/>CORPZO
          </div>
          <p className="text-xs leading-relaxed text-white/60">Debt origination, credit facilitation and lender access — for Indian borrowers and channel partners.</p>
          <div className="text-[10px] uppercase tracking-widest text-[#FFD700] mt-4">Powered by CorpZo Ventures</div>
        </div>
        <div><div className="text-white text-xs uppercase tracking-widest mb-3">Products</div>
          <ul className="space-y-1.5 text-xs">
            <li><Link to="/product/home-loan" className="hover:text-[#FFD700]">Home Loan</Link></li>
            <li><Link to="/product/business-loan" className="hover:text-[#FFD700]">Business Loan</Link></li>
            <li><Link to="/product/lap" className="hover:text-[#FFD700]">Loan Against Property</Link></li>
            <li><Link to="/product/personal-loan" className="hover:text-[#FFD700]">Personal Loan</Link></li>
          </ul>
        </div>
        <div><div className="text-white text-xs uppercase tracking-widest mb-3">Company</div>
          <ul className="space-y-1.5 text-xs">
            <li>About CorpZo</li><li>Contact</li><li>Careers</li><li>Media</li>
          </ul>
        </div>
        <div><div className="text-white text-xs uppercase tracking-widest mb-3">For teams</div>
          <ul className="space-y-1.5 text-xs">
            <li><Link to="/dashboard" className="hover:text-[#FFD700]">Internal CRM →</Link></li>
            <li><Link to="/partner/dashboard" className="hover:text-[#FFD700]">Channel Partner Portal →</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">© {new Date().getFullYear()} CorpZo Ventures Pvt Ltd. All rights reserved.</div>
    </footer>
  );
}

export default function PublicLayout({ user, children }) {
  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      <PublicNav user={user}/>
      <main>{children}</main>
      <PublicFooter/>
    </div>
  );
}
