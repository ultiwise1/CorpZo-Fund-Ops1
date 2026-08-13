import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { humanize, pillClass, fmtDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Tasks() {
  const [rows, setRows] = useState([]);
  const load = () => api.get("/tasks").then(r => setRows(r.data));
  useEffect(() => { load(); }, []);
  const complete = async (t) => { await api.patch(`/tasks/${t.task_id}`, { status: "done" }); toast.success("Done"); load(); };
  return (
    <div className="space-y-4" data-testid="tasks-page">
      <h1 className="font-display text-2xl font-semibold">Tasks & Follow-ups</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>UID</th><th>Title</th><th>Owner</th><th>Priority</th><th>Due</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map(t => {
              const overdue = new Date(t.due_date) < new Date() && t.status !== "done";
              return (
                <tr key={t.task_id} className={overdue ? "bg-red-50/60" : ""}>
                  <td className="mono text-xs">{t.task_id}</td>
                  <td><div className="font-medium">{t.title}</div><div className="text-xs text-slate-500">{t.case_uid || t.lead_uid || ""}</div></td>
                  <td className="mono text-xs">{t.owner_uid}</td>
                  <td><span className={`pill ${t.priority==='urgent'?'pill-red':t.priority==='high'?'pill-amber':'pill-slate'}`}>{humanize(t.priority)}</span></td>
                  <td className="text-xs">{fmtDateTime(t.due_date)}{overdue && <span className="ml-2 pill pill-red">Overdue</span>}</td>
                  <td><span className={`pill ${pillClass(t.status)}`}>{humanize(t.status)}</span></td>
                  <td>{t.status !== "done" && <Button size="sm" variant="outline" onClick={()=>complete(t)}>Mark done</Button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
