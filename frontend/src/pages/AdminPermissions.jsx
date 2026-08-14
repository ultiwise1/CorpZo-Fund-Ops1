import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { humanize } from "@/lib/format";
import { toast } from "sonner";
import { clearPermissionsCache, usePermissions } from "@/lib/perms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, Search, Save, Lock } from "lucide-react";

export default function AdminPermissions() {
  const [users, setUsers] = useState(null); // null = loading, [] = empty
  const [keys, setKeys] = useState([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [state, setState] = useState({ grants: [], revokes: [] });
  const [saving, setSaving] = useState(false);
  const perms = usePermissions();

  const loadUsers = () => api.get("/users").then(r => setUsers(r.data)).catch(() => setUsers([]));

  useEffect(() => {
    api.get("/permissions/keys").then(r => setKeys(r.data));
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(u =>
      (u.name || "").toLowerCase().includes(needle) ||
      (u.email || "").toLowerCase().includes(needle) ||
      (u.role || "").toLowerCase().includes(needle));
  }, [users, q]);

  // Guard access at UI level (backend also enforces manage_users)
  if (!perms.loading && !perms.has("manage_users")) {
    return (
      <div className="p-8 max-w-md" data-testid="admin-permissions-forbidden">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <Lock size={20} className="text-red-600"/>
          <div>
            <div className="font-display font-semibold text-red-900">Permission required</div>
            <div className="text-xs text-red-700">You don&apos;t have the <b>manage_users</b> permission.</div>
          </div>
        </div>
      </div>
    );
  }

  const openUser = async (u) => {
    setEditing(u);
    try {
      const { data } = await api.get(`/admin/users/${u.user_id}/permissions`);
      setState({ grants: data.grants || [], revokes: data.revokes || [] });
    } catch (e) {
      toast.error(e.response?.data?.detail || "Cannot load");
      setEditing(null);
    }
  };

  const toggle = (list, key) => (list.includes(key) ? list.filter(k => k !== key) : [...list, key]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/users/${editing.user_id}/permissions`, state);
      toast.success("Permissions updated");
      clearPermissionsCache();
      setEditing(null);
      loadUsers();
    } catch (e) { toast.error(e.response?.data?.detail || "Save failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4" data-testid="admin-permissions-page">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900 flex items-center gap-2">
            <Shield size={22} className="text-[#FF6B4E]"/>Permissions
          </h1>
          <p className="text-sm text-slate-500">Grant or revoke specific permissions per user, on top of their role. Grants add capabilities; revokes remove role defaults.</p>
        </div>
        <div className="relative w-64">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400"/>
          <Input placeholder="Search users…" value={q} onChange={e => setQ(e.target.value)}
                 className="pl-8" data-testid="perm-user-search"/>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full dense-table">
          <thead>
            <tr>
              <th>User</th><th>Role</th><th>Grants</th><th>Revokes</th><th></th>
            </tr>
          </thead>
          <tbody>
            {users === null && (
              <tr><td colSpan={5} className="p-8 text-center text-sm text-slate-500" data-testid="perms-loading">
                Loading users…
              </td></tr>
            )}
            {users !== null && filtered.map(u => (
              <tr key={u.user_id} data-testid={`perm-row-${u.user_id}`}>
                <td>
                  <div className="font-semibold text-sm text-slate-900">{u.name}</div>
                  <div className="text-[11px] text-slate-500">{u.email}</div>
                </td>
                <td><span className="pill pill-slate">{humanize(u.role)}</span></td>
                <td className="text-xs">
                  {(u.permissions_grants || []).length
                    ? (u.permissions_grants || []).join(", ")
                    : <span className="text-slate-400">—</span>}
                </td>
                <td className="text-xs">
                  {(u.permissions_revokes || []).length
                    ? <span className="text-red-700">{(u.permissions_revokes || []).join(", ")}</span>
                    : <span className="text-slate-400">—</span>}
                </td>
                <td>
                  <Button variant="outline" size="sm" onClick={() => openUser(u)}
                          data-testid={`perm-edit-${u.user_id}`}>Manage</Button>
                </td>
              </tr>
            ))}
            {users !== null && filtered.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-sm text-slate-500">No users match.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl" data-testid="perm-edit-modal">
          <DialogHeader>
            <DialogTitle>Manage permissions</DialogTitle>
            <DialogDescription className="text-xs">
              {editing?.name} · <span className="mono">{editing?.email}</span> · role <b>{humanize(editing?.role || "")}</b>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-2">
            <div className="grid grid-cols-[1fr_60px_60px] gap-2 text-[10.5px] uppercase tracking-widest font-semibold text-slate-500 border-b border-slate-200 pb-1.5">
              <div>Permission</div>
              <div className="text-center text-emerald-700">Grant</div>
              <div className="text-center text-red-700">Revoke</div>
            </div>
            {keys.map(k => (
              <div key={k.key} className="grid grid-cols-[1fr_60px_60px] gap-2 items-start py-1.5 border-b border-slate-100 last:border-0">
                <div>
                  <div className="font-mono text-[11.5px] text-slate-700">{k.key}</div>
                  <div className="text-xs text-slate-500">{k.label}</div>
                </div>
                <div className="text-center">
                  <input type="checkbox" checked={state.grants.includes(k.key)}
                         onChange={() => setState(s => ({ ...s, grants: toggle(s.grants, k.key) }))}
                         data-testid={`grant-${k.key}`}
                         className="w-4 h-4 accent-emerald-600"/>
                </div>
                <div className="text-center">
                  <input type="checkbox" checked={state.revokes.includes(k.key)}
                         onChange={() => setState(s => ({ ...s, revokes: toggle(s.revokes, k.key) }))}
                         data-testid={`revoke-${k.key}`}
                         className="w-4 h-4 accent-red-600"/>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-[#0B1F3A] hover:bg-[#081733]"
                    data-testid="perm-save-btn">
              <Save size={14} className="mr-1"/>Save permissions
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
