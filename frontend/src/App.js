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
import Renewals from "@/pages/Renewals";
import LeadImport from "@/pages/LeadImport";
import PartnerPortal from "@/pages/PartnerPortal";

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback/>;
  }
  return <AppRoutes/>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="h-screen flex items-center justify-center text-slate-500">Loading…</div>;
  }
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/auth/callback" element={<AuthCallback/>}/>
        <Route path="*" element={<Navigate to="/login" replace/>}/>
      </Routes>
    );
  }
  // Partner Portal routing
  if (user.role === "channel_partner") {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback/>}/>
        <Route path="/partner/*" element={<PartnerPortal user={user}/>}/>
        <Route path="*" element={<Navigate to="/partner/dashboard" replace/>}/>
      </Routes>
    );
  }
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" replace/>}/>
      <Route path="/auth/callback" element={<AuthCallback/>}/>
      <Route element={<AuthedShell user={user}/>}>
        <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
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
        <Route path="/reports" element={<Reports/>}/>
        <Route path="/renewals" element={<Renewals/>}/>
        <Route path="/admin/users" element={<AdminUsers/>}/>
        <Route path="/admin/audit" element={<AdminAudit/>}/>
        <Route path="/admin/integrations" element={<AdminIntegrations/>}/>
        <Route path="/admin/settings" element={<AdminSettings/>}/>
        <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
      </Route>
    </Routes>
  );
}

function AuthedShell({ user }) {
  return (
    <AppShell user={user}>
      <Outlet/>
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster richColors position="top-right"/>
      <AppRouter/>
    </BrowserRouter>
  );
}
