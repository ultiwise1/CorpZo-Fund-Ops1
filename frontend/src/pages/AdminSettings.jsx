import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { humanize } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Handshake, ShieldCheck, Save, Info } from "lucide-react";

export default function AdminSettings() {
  const [advOwner, setAdvOwner] = useState("");
  const [initialOwner, setInitialOwner] = useState("");
  const [employees, setEmployees] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/employees").then(r => setEmployees(r.data));
    api.get("/settings/advisory-desk").then(r => {
      setAdvOwner(r.data.owner_employee_uid || "");
      setInitialOwner(r.data.owner_employee_uid || "");
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.put("/settings/advisory-desk", { owner_employee_uid: advOwner || null });
      setInitialOwner(advOwner);
      toast.success("Advisory desk owner updated");
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
    finally { setSaving(false); }
  };

  const dirty = advOwner !== initialOwner;

  return (
    <div className="space-y-5" data-testid="admin-settings-page">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F3D2E]">Settings</h1>
        <p className="text-sm text-[#0F3D2E]/60 mt-1">System-wide defaults, routing and numbering rules.</p>
      </div>

      {/* Advisory desk auto-assign */}
      <div className="bg-white border border-[#0F3D2E]/10 rounded-xl p-6" data-testid="advisory-desk-card">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFD84D]/20 border border-[#FFD84D]/40 flex items-center justify-center shrink-0">
            <Handshake size={22} className="text-[#8A6600]"/>
          </div>
          <div className="flex-1">
            <div className="font-display text-lg font-bold text-[#0F3D2E]">Advisory desk auto-assign</div>
            <p className="text-sm text-[#0F3D2E]/60 mt-0.5">
              Every new advisory opportunity created from a missing document will be assigned to this owner.
              If unset, opportunities fall back to the case sales owner.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-full sm:w-96">
                <Select value={advOwner || "__none__"} onValueChange={v => setAdvOwner(v === "__none__" ? "" : v)}>
                  <SelectTrigger data-testid="advisory-owner-select"><SelectValue placeholder="Pick advisory desk owner"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None (fall back to sales owner) —</SelectItem>
                    {employees.map(e => (
                      <SelectItem key={e.employee_uid} value={e.employee_uid}>
                        {e.name} · {humanize(e.role)} · {e.employee_uid}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button disabled={!dirty || saving} onClick={save}
                className="bg-[#1F5B4A] hover:bg-[#0F3D2E] text-white disabled:opacity-40"
                data-testid="save-advisory-owner-btn">
                <Save size={14} className="mr-1.5"/>{saving ? "Saving…" : "Save"}
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-[#0F3D2E]/50">
              <Info size={12}/> Only super_admin and business_head can change this.
            </div>
          </div>
        </div>
      </div>

      {/* Static config reference */}
      <div className="bg-white border border-[#0F3D2E]/10 rounded-xl p-6 space-y-4" data-testid="settings-reference">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[#16A981]"/>
          <div className="font-display font-bold text-[#0F3D2E]">Configuration reference</div>
        </div>
        <Section title="Products" body="Home Loan, Business Loan, LAP, Personal Loan, Working Capital, CC/OD, Term Loan, Equipment Finance, Project Finance, Construction, SCF, Invoice Discounting, LAS, Structured Finance, Private Credit."/>
        <Section title="Pipeline stages" body="20 default stages including qualification, PD, credit assessment, mandate, lender submission, sanction, and disbursement. Configurable per product."/>
        <Section title="Rejection reasons" body="17 preloaded reasons — CIBIL, DPD, FOIR, banking, vintage, geography, sector, collateral, documentation, pricing, obligations, competitor, unable to contact, other."/>
        <Section title="Incentive rules" body="Configurable multipliers (2x within 90 days, 3x thereafter) with per-employee overrides and per-lender/product uplifts."/>
        <Section title="CP commission rules" body="Default 1% of disbursement with min/max caps. Overridable per partner and product."/>
        <Section title="Numbering formats" body="LD-YYYY-######, CL-YYYY-######, CS-YYYY-######, LA-YYYY-######, MAN-YYYY-######, OPP-YYYY-######, EMP-####, CP-####."/>
      </div>
    </div>
  );
}

function Section({ title, body }) {
  return <div>
    <div className="text-sm font-bold text-[#0F3D2E]">{title}</div>
    <div className="text-sm text-[#0F3D2E]/65 mt-0.5">{body}</div>
  </div>;
}
