import { NavLink, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Landmark, Menu, X } from "lucide-react";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";

export function PublicNav({ user }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  const logout = async () => { try { await api.post("/auth/logout"); } catch { /* ignore */ }; nav("/"); window.location.reload(); };
  const startAuth = () => {
    const redirect = window.location.origin + "/auth/callback";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirect)}`;
  };
  const closeAnd = (fn) => () => { setOpen(false); fn && fn(); };

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF7]/90 backdrop-blur border-b border-[#0B1F3A]/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-[#0B1F3A]" data-testid="public-brand">
          <Landmark size={22} className="text-[#FF6B4E]"/>CORPZO
          <span className="hidden sm:inline text-[10px] uppercase tracking-widest text-[#8A5A00] ml-1">Debt Marketplace</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[#0B1F3A]/72">
          <NavLink to="/products" className={({isActive})=>isActive?"text-[#0B1F3A] font-semibold":"hover:text-[#0B1F3A]"} data-testid="nav-public-products">Products</NavLink>
          <NavLink to="/banks" className={({isActive})=>isActive?"text-[#0B1F3A] font-semibold":"hover:text-[#0B1F3A]"} data-testid="nav-public-banks">Banks</NavLink>
          <NavLink to="/become-partner" className={({isActive})=>isActive?"text-[#0B1F3A] font-semibold":"hover:text-[#0B1F3A]"} data-testid="nav-public-become-partner">Become Partner</NavLink>
          <NavLink to="/calculators" className={({isActive})=>isActive?"text-[#0B1F3A] font-semibold":"hover:text-[#0B1F3A]"}>EMI Calculator</NavLink>
          <NavLink to="/apply" className={({isActive})=>isActive?"text-[#0B1F3A] font-semibold":"hover:text-[#0B1F3A]"}>Apply</NavLink>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            user.role === "customer" ? (
              <>
                <Button variant="outline" size="sm" onClick={()=>nav("/my")} data-testid="my-portal-btn" className="border-[#0B1F3A]/20 text-[#0B1F3A] hover:bg-[#0B1F3A]/5">My Applications</Button>
                <Button size="sm" variant="ghost" onClick={logout} className="text-[#0B1F3A]/70 hover:text-[#0B1F3A]">Sign out</Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={()=>nav(user.role === "channel_partner" ? "/partner/dashboard" : "/dashboard")} data-testid="open-workspace-btn" className="border-[#0B1F3A]/20 text-[#0B1F3A]">Open workspace</Button>
            )
          ) : (
            <>
              <Link to="/login" className="hidden sm:inline text-sm text-[#0B1F3A]/70 hover:text-[#0B1F3A] font-semibold" data-testid="crm-login-link">CRM login</Link>
              <Button className="hidden sm:inline-flex bg-[#1B3A6B] hover:bg-[#0B1F3A] text-white" size="sm" onClick={startAuth} data-testid="public-signin-btn">Sign in / Sign up</Button>
            </>
          )}
          {/* hamburger — mobile only */}
          <button onClick={()=>setOpen(o=>!o)} className="md:hidden w-9 h-9 rounded-md border border-[#0B1F3A]/15 flex items-center justify-center text-[#0B1F3A]" data-testid="mobile-menu-toggle" aria-label="Menu">
            {open ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>
      </div>

      {/* mobile slide-down menu */}
      {open && (
        <div className="md:hidden border-t border-[#0B1F3A]/10 bg-white" data-testid="mobile-menu">
          <div className="px-6 py-4 space-y-1">
            <MobileLink to="/products" onClick={closeAnd()} testid="mobile-nav-products">Products</MobileLink>
            <MobileLink to="/banks" onClick={closeAnd()} testid="mobile-nav-banks">Banks</MobileLink>
            <MobileLink to="/become-partner" onClick={closeAnd()} testid="mobile-nav-become-partner">Become Partner</MobileLink>
            <MobileLink to="/calculators" onClick={closeAnd()}>EMI Calculator</MobileLink>
            <MobileLink to="/apply" onClick={closeAnd()} testid="mobile-nav-apply">Apply</MobileLink>
            <div className="h-px bg-[#0B1F3A]/10 my-3"/>
            {user ? (
              user.role === "customer"
                ? <MobileLink to="/my" onClick={closeAnd()}>My Applications</MobileLink>
                : <MobileLink to={user.role === "channel_partner" ? "/partner/dashboard" : "/dashboard"} onClick={closeAnd()}>Open workspace</MobileLink>
            ) : (
              <>
                <MobileLink to="/login" onClick={closeAnd()} testid="mobile-crm-login">CRM login</MobileLink>
                <Button className="w-full bg-[#1B3A6B] hover:bg-[#0B1F3A] text-white mt-2" onClick={closeAnd(startAuth)} data-testid="mobile-signin-btn">Sign in / Sign up</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MobileLink({ to, onClick, testid, children }) {
  return (
    <Link to={to} onClick={onClick} data-testid={testid}
      className="block px-3 py-2.5 rounded-md text-[#0B1F3A] font-medium hover:bg-[#0B1F3A]/5">
      {children}
    </Link>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-[#0B1F3A] text-white/60 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 text-white font-display text-lg font-semibold mb-3">
            <Landmark size={20} className="text-[#FF6B4E]"/>CORPZO
          </div>
          <p className="text-xs leading-relaxed text-white/60">Debt origination, credit facilitation and lender access — for Indian borrowers and channel partners.</p>
          <div className="text-[10px] uppercase tracking-widest text-[#FFD84D] mt-4">Powered by CorpZo Ventures</div>
        </div>
        <div><div className="text-white text-xs uppercase tracking-widest mb-3">Products</div>
          <ul className="space-y-1.5 text-xs">
            <li><Link to="/product/home-loan" className="hover:text-[#FF6B4E]">Home Loan</Link></li>
            <li><Link to="/product/business-loan" className="hover:text-[#FF6B4E]">Business Loan</Link></li>
            <li><Link to="/product/lap" className="hover:text-[#FF6B4E]">Loan Against Property</Link></li>
            <li><Link to="/product/personal-loan" className="hover:text-[#FF6B4E]">Personal Loan</Link></li>
          </ul>
        </div>
        <div><div className="text-white text-xs uppercase tracking-widest mb-3">Company</div>
          <ul className="space-y-1.5 text-xs">
            <li>About CorpZo</li><li>Contact</li><li>Careers</li><li>Media</li>
          </ul>
        </div>
        <div><div className="text-white text-xs uppercase tracking-widest mb-3">For teams</div>
          <ul className="space-y-1.5 text-xs">
            <li><Link to="/login" className="hover:text-[#FF6B4E]" data-testid="footer-crm-login">Internal CRM login →</Link></li>
            <li><Link to="/login" className="hover:text-[#FF6B4E]" data-testid="footer-partner-login">Channel Partner login →</Link></li>
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
