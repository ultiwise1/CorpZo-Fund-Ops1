import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, UserCircle2, Briefcase, Phone, ListChecks,
  FileText, ShieldCheck, ClipboardCheck, Building2, FileSignature, HelpCircle,
  Award, Truck, Receipt, IndianRupee, HandCoins, Target, TrendingUp,
  UsersRound, Handshake, Settings, ScrollText, Boxes, LogOut, Landmark, Search
} from "lucide-react";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

const NAV = [
  { section: null, items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  ]},
  { section: "Sales", items: [
    { to: "/leads", label: "Leads", icon: Users, testid: "nav-leads" },
    { to: "/clients", label: "Clients", icon: UserCircle2, testid: "nav-clients" },
    { to: "/cases", label: "Cases", icon: Briefcase, testid: "nav-cases" },
    { to: "/tasks", label: "Tasks", icon: ListChecks, testid: "nav-tasks" },
  ]},
  { section: "Credit", items: [
    { to: "/documents", label: "Documents", icon: FileText, testid: "nav-documents" },
    { to: "/bureau", label: "Bureau", icon: ShieldCheck, testid: "nav-bureau" },
    { to: "/assessments", label: "Assessments", icon: ClipboardCheck, testid: "nav-assessments" },
  ]},
  { section: "Lending", items: [
    { to: "/lenders", label: "Lender Master", icon: Building2, testid: "nav-lenders" },
    { to: "/applications", label: "Applications", icon: FileSignature, testid: "nav-applications" },
    { to: "/queries", label: "Queries", icon: HelpCircle, testid: "nav-queries" },
    { to: "/sanctions", label: "Sanctions", icon: Award, testid: "nav-sanctions" },
    { to: "/disbursements", label: "Disbursements", icon: Truck, testid: "nav-disbursements" },
  ]},
  { section: "Commercials", items: [
    { to: "/mandates", label: "Mandates", icon: FileSignature, testid: "nav-mandates" },
    { to: "/invoices", label: "Invoices", icon: Receipt, testid: "nav-invoices" },
    { to: "/payments", label: "Payments", icon: IndianRupee, testid: "nav-payments" },
  ]},
  { section: "Channel", items: [
    { to: "/channel-partners", label: "Partners", icon: Handshake, testid: "nav-partners" },
    { to: "/cp-commissions", label: "Commissions", icon: HandCoins, testid: "nav-commissions" },
  ]},
  { section: "Performance", items: [
    { to: "/employees", label: "Employees", icon: UsersRound, testid: "nav-employees" },
    { to: "/incentives", label: "Incentives", icon: Target, testid: "nav-incentives" },
    { to: "/reports", label: "Reports", icon: TrendingUp, testid: "nav-reports" },
    { to: "/renewals", label: "Renewal Radar", icon: Award, testid: "nav-renewals" },
  ]},
  { section: "Administration", items: [
    { to: "/admin/users", label: "Users & Roles", icon: Users, testid: "nav-users" },
    { to: "/admin/audit", label: "Audit Logs", icon: ScrollText, testid: "nav-audit" },
    { to: "/admin/integrations", label: "Integrations", icon: Boxes, testid: "nav-integrations" },
    { to: "/admin/settings", label: "Settings", icon: Settings, testid: "nav-settings" },
  ]},
];

export default function Sidebar({ user }) {
  const nav = useNavigate();
  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    nav("/login");
  };

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-[#0b1220] text-slate-200 border-r border-slate-800">
      <div className="px-4 py-4 border-b border-slate-800/70 flex items-center gap-2">
        <Landmark size={22} className="text-orange-400"/>
        <div>
          <div className="font-display text-[15px] font-semibold text-white">CorpZo</div>
          <div className="text-[10.5px] uppercase tracking-widest text-slate-500">Debt CRM</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {NAV.map((sec, i) => (
          <div key={i}>
            {sec.section && <div className="sidebar-section-title">{sec.section}</div>}
            {sec.items.map((it) => {
              const Icon = it.icon;
              return (
                <NavLink
                  key={it.to}
                  to={it.to}
                  data-testid={it.testid}
                  className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={16} strokeWidth={1.7}/>
                  <span>{it.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-800/70">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-300 flex items-center justify-center text-xs font-semibold">
            {user?.name?.[0] || "?"}
          </div>
          <div className="min-w-0">
            <div className="text-xs text-white truncate" data-testid="user-name">{user?.name}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{user?.role?.replace(/_/g," ")}</div>
          </div>
        </div>
        <button
          data-testid="logout-btn"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-orange-400 border border-slate-800 hover:border-slate-700 rounded-md py-1.5 transition-colors"
        >
          <LogOut size={13}/> Sign out
        </button>
      </div>
    </aside>
  );
}
