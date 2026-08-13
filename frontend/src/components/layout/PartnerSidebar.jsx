import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Briefcase, HandCoins, Landmark, LogOut } from "lucide-react";
import { api } from "@/lib/api";

const PARTNER_NAV = [
  { to: "/partner/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "nav-partner-dashboard" },
  { to: "/partner/cases", label: "My Referrals", icon: Briefcase, testid: "nav-partner-cases" },
  { to: "/partner/commissions", label: "My Commissions", icon: HandCoins, testid: "nav-partner-commissions" },
];

export default function PartnerSidebar({ user }) {
  const nav = useNavigate();
  const logout = async () => { try { await api.post("/auth/logout"); } catch {}; nav("/login"); };
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-[#0b1220] text-slate-200 border-r border-slate-800">
      <div className="px-4 py-4 border-b border-slate-800/70 flex items-center gap-2">
        <Landmark size={22} className="text-orange-400"/>
        <div>
          <div className="font-display text-[15px] font-semibold text-white">CorpZo</div>
          <div className="text-[10.5px] uppercase tracking-widest text-slate-500">Partner Portal</div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {PARTNER_NAV.map(it => {
          const Icon = it.icon;
          return (
            <NavLink key={it.to} to={it.to} data-testid={it.testid}
              className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}>
              <Icon size={16} strokeWidth={1.7}/><span>{it.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-800/70">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-300 flex items-center justify-center text-xs font-semibold">{user?.name?.[0] || "P"}</div>
          <div className="min-w-0">
            <div className="text-xs text-white truncate">{user?.name}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">Channel Partner</div>
          </div>
        </div>
        <button onClick={logout} data-testid="partner-logout-btn"
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-orange-400 border border-slate-800 hover:border-slate-700 rounded-md py-1.5">
          <LogOut size={13}/> Sign out
        </button>
      </div>
    </aside>
  );
}
