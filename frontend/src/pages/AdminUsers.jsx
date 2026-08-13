import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { humanize, fmtDateTime } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const ROLES = ["super_admin","business_head","sales_manager","sales_agent","credit_head","credit_analyst",
  "documentation","operations","finance","compliance","channel_manager","channel_partner"];

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const load = () => api.get("/users").then(r => setRows(r.data));
  useEffect(() => { load(); }, []);
  const setRole = async (u, role) => {
    try { await api.patch(`/users/${u.user_id}`, { role }); toast.success("Role updated"); load(); }
    catch { toast.error("Admin only"); }
  };
  return (
    <div className="space-y-4" data-testid="admin-users-page">
      <h1 className="font-display text-2xl font-semibold">Users & Roles</h1>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full dense-table">
          <thead><tr><th>Name</th><th>Email</th><th>Employee UID</th><th>Role</th><th>Last login</th></tr></thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.user_id}>
                <td className="font-medium">{u.name}</td>
                <td className="text-xs">{u.email}</td>
                <td className="mono text-xs">{u.employee_uid}</td>
                <td>
                  <Select value={u.role} onValueChange={(v)=>setRole(u,v)}>
                    <SelectTrigger className="w-48" data-testid={`role-select-${u.employee_uid || u.user_id}`}><SelectValue/></SelectTrigger>
                    <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{humanize(r)}</SelectItem>)}</SelectContent>
                  </Select>
                </td>
                <td className="text-xs">{fmtDateTime(u.last_login)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
