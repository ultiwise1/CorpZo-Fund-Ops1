import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AppShell({ user, children, title, breadcrumbs, actions }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user}/>
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar title={title} breadcrumbs={breadcrumbs} actions={actions}/>
        <main className="flex-1 p-6" data-testid="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}
