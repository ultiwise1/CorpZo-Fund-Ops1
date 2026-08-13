import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize } from "@/lib/format";
import { Users, Briefcase, Award, Truck, IndianRupee, Clock, TrendingUp } from "lucide-react";

const StatCard = ({ label, value, delta, icon: Icon, testid }) => (
  <div className="bg-white border border-slate-200 rounded-lg p-4" data-testid={testid}>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div>
        <div className="mt-1 text-2xl font-display font-semibold text-slate-900 num">{value}</div>
        {delta && <div className="mt-1 text-xs text-slate-500">{delta}</div>}
      </div>
      {Icon && <div className="w-9 h-9 rounded-md bg-orange-50 text-orange-700 flex items-center justify-center"><Icon size={18}/></div>}
    </div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/dashboard/summary").then((r) => setData(r.data)); }, []);
  if (!data) return <div className="text-slate-500">Loading…</div>;
  const k = data.kpis;

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Operations dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Live snapshot of leads, credit, lender pipeline and finance.</p>
        </div>
        <div className="text-xs text-slate-500">Last synced just now</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Leads (Total)" value={k.leads_total} delta={`+${k.leads_today} today`} icon={Users} testid="kpi-leads"/>
        <StatCard label="Active Cases" value={k.cases} icon={Briefcase} testid="kpi-cases"/>
        <StatCard label="Sanctioned" value={inr(k.sanctioned_amount)} delta={`${k.sanctioned} cases`} icon={Award} testid="kpi-sanctioned"/>
        <StatCard label="Disbursed" value={inr(k.disbursed_amount)} delta={`${k.disbursed_cases} cases`} icon={Truck} testid="kpi-disbursed"/>
        <StatCard label="Revenue Booked" value={inr(k.revenue_booked)} icon={IndianRupee} testid="kpi-revenue"/>
        <StatCard label="Requested Value" value={inr(k.requested_amount)} icon={TrendingUp} testid="kpi-requested"/>
        <StatCard label="Clients" value={k.clients} icon={Users} testid="kpi-clients"/>
        <StatCard label="Overdue Tasks" value={k.overdue_tasks} icon={Clock} testid="kpi-overdue"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5" data-testid="funnel-card">
          <h3 className="font-display text-base font-semibold mb-4">Pipeline funnel</h3>
          <div className="space-y-2">
            {data.funnel.slice(0, 12).map((s) => {
              const max = Math.max(...data.funnel.map(x => x.value || 0)) || 1;
              const w = ((s.value || 0) / max) * 100;
              return (
                <div key={s.stage} className="flex items-center gap-3 text-sm">
                  <div className="w-44 shrink-0 text-slate-700">{humanize(s.stage)}</div>
                  <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden relative">
                    <div className="h-full bg-orange-500/70" style={{ width: `${w}%` }}/>
                    <div className="absolute inset-0 flex items-center px-2 text-xs text-slate-800 num">
                      {s.count} · {inr(s.value)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5" data-testid="lenders-card">
          <h3 className="font-display text-base font-semibold mb-3">Top lenders (by apps)</h3>
          <div className="space-y-2">
            {data.top_lenders.map((l) => (
              <div key={l.lender_id} className="flex items-center justify-between text-sm border-b border-slate-100 last:border-0 pb-2">
                <div className="text-slate-700">{l.lender_id?.replace("lender_","").toUpperCase()}</div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{l.apps} apps</span>
                  <span className="pill pill-green num">{l.sanctioned} sanctioned</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5" data-testid="invoices-summary">
        <h3 className="font-display text-base font-semibold mb-3">Invoices summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.invoices_summary.map((s) => (
            <div key={s.status} className="border border-slate-200 rounded-md p-3">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{humanize(s.status)}</div>
              <div className="mt-1 text-lg font-display font-semibold num text-slate-900">{inr(s.amount)}</div>
              <div className="text-xs text-slate-500 num">{s.count} invoice(s)</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
