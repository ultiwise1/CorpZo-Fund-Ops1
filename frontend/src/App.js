import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";
import "@/index.css";
import { useAuth } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import LeadDetail from "@/pages/LeadDetail";
import Clients from "@/pages/Clients";
import ClientDetail from "@/pages/ClientDetail";
import Cases from "@/pages/Cases";
import CaseDetail from "@/pages/CaseDetail";
import Tasks from "@/pages/Tasks";
import Documents from "@/pages/Documents";
import Bureau from "@/pages/Bureau";
import Assessments from "@/pages/Assessments";
import Lenders from "@/pages/Lenders";
import Applications from "@/pages/Applications";
import Queries from "@/pages/Queries";
import Sanctions from "@/pages/Sanctions";
import Disbursements from "@/pages/Disbursements";
import Mandates from "@/pages/Mandates";
import Invoices from "@/pages/Invoices";
import Payments from "@/pages/Payments";
import ChannelPartners from "@/pages/ChannelPartners";
import CPCommissions from "@/pages/CPCommissions";
import Employees from "@/pages/Employees";
import Incentives from "@/pages/Incentives";
import Reports from "@/pages/Reports";
import AdminUsers from "@/pages/AdminUsers";
import AdminAudit from "@/pages/AdminAudit";
import AdminIntegrations from "@/pages/AdminIntegrations";
import AdminSettings from "@/pages/AdminSettings";
import AdminPermissions from "@/pages/AdminPermissions";
import Renewals from "@/pages/Renewals";
import LeadImport from "@/pages/LeadImport";
import PartnerPortal from "@/pages/PartnerPortal";
import Payouts from "@/pages/Payouts";
import Opportunities from "@/pages/Opportunities";
import PublicLayout from "@/components/layout/PublicLayout";
import LandingPage from "@/pages/public/LandingPage";
import ProductsPage from "@/pages/public/ProductsPage";
import ProductDetail from "@/pages/public/ProductDetail";
import { Thanks, ApplyForm } from "@/pages/public/ApplyForm";
import CustomerDashboard from "@/pages/public/CustomerDashboard";
import AllBanks from "@/pages/public/AllBanks";
import BecomePartner from "@/pages/public/BecomePartner";

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) return <AuthCallback/>;
  return <AppRoutes/>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Loading…</div>;

  // Public marketing site - always accessible
  const publicRoutes = (
    <Route element={<PublicShell user={user}/>}>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/products" element={<ProductsPage/>}/>
      <Route path="/product/:slug" element={<ProductDetail/>}/>
      <Route path="/apply" element={<ApplyForm/>}/>
      <Route path="/apply/thanks" element={<Thanks/>}/>
      <Route path="/banks" element={<AllBanks/>}/>
      <Route path="/become-partner" element={<BecomePartner/>}/>
    </Route>
  );

  if (!user) {
    return (
      <Routes>
        {publicRoutes}
        <Route path="/login" element={<Login/>}/>
        <Route path="/auth/callback" element={<AuthCallback/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    );
  }

  // Customer role → customer portal + public marketing pages
  if (user.role === "customer") {
    return (
      <Routes>
        {publicRoutes}
        <Route path="/auth/callback" element={<AuthCallback/>}/>
        <Route path="/my" element={<CustomerDashboard user={user}/>}/>
        <Route path="/dashboard" element={<Navigate to="/my" replace/>}/>
        <Route path="*" element={<Navigate to="/my" replace/>}/>
      </Routes>
    );
  }

  // Partner Portal
  if (user.role === "channel_partner") {
    return (
      <Routes>
        {publicRoutes}
        <Route path="/auth/callback" element={<AuthCallback/>}/>
        <Route path="/partner/*" element={<PartnerPortal user={user}/>}/>
        <Route path="*" element={<Navigate to="/partner/dashboard" replace/>}/>
      </Routes>
    );
  }

  // Internal team
  return (
    <Routes>
      {publicRoutes}
      <Route path="/login" element={<Navigate to="/dashboard" replace/>}/>
      <Route path="/auth/callback" element={<AuthCallback/>}/>
      <Route element={<AuthedShell user={user}/>}>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/leads" element={<Leads/>}/>
        <Route path="/leads/import" element={<LeadImport/>}/>
        <Route path="/leads/:uid" element={<LeadDetail/>}/>
        <Route path="/clients" element={<Clients/>}/>
        <Route path="/clients/:uid" element={<ClientDetail/>}/>
        <Route path="/cases" element={<Cases/>}/>
        <Route path="/cases/:uid" element={<CaseDetail/>}/>
        <Route path="/tasks" element={<Tasks/>}/>
        <Route path="/documents" element={<Documents/>}/>
        <Route path="/bureau" element={<Bureau/>}/>
        <Route path="/assessments" element={<Assessments/>}/>
        <Route path="/lenders" element={<Lenders/>}/>
        <Route path="/applications" element={<Applications/>}/>
        <Route path="/queries" element={<Queries/>}/>
        <Route path="/sanctions" element={<Sanctions/>}/>
        <Route path="/disbursements" element={<Disbursements/>}/>
        <Route path="/mandates" element={<Mandates/>}/>
        <Route path="/invoices" element={<Invoices/>}/>
        <Route path="/payments" element={<Payments/>}/>
        <Route path="/channel-partners" element={<ChannelPartners/>}/>
        <Route path="/cp-commissions" element={<CPCommissions/>}/>
        <Route path="/employees" element={<Employees/>}/>
        <Route path="/incentives" element={<Incentives/>}/>
        <Route path="/payouts" element={<Payouts/>}/>
        <Route path="/reports" element={<Reports/>}/>
        <Route path="/renewals" element={<Renewals/>}/>
        <Route path="/opportunities" element={<Opportunities/>}/>
        <Route path="/admin/users" element={<AdminUsers/>}/>
        <Route path="/admin/audit" element={<AdminAudit/>}/>
        <Route path="/admin/integrations" element={<AdminIntegrations/>}/>
        <Route path="/admin/settings" element={<AdminSettings/>}/>
        <Route path="/admin/permissions" element={<AdminPermissions/>}/>
        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
      </Route>
    </Routes>
  );
}

function AuthedShell({ user }) {
  return <AppShell user={user}><Outlet/></AppShell>;
}
function PublicShell({ user }) {
  return <PublicLayout user={user}><Outlet/></PublicLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right"/>
      <AppRouter/>
    </BrowserRouter>
  );
}
