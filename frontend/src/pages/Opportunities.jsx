import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr, humanize, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { HandCoins, ArrowUpRight } from "lucide-react";

const STATUS_TINT = {
  open:      { bg: "bg-[#FFF3D6]", fg: "text-[#8A6600]", label: "Open" },
  contacted: { bg: "bg-[#E4F1FB]", fg: "text-[#1D5A88]", label: "Contacted" },
  converted: { bg: "bg-[#E0F5EC]", fg: "text-[#0F8B6B]", label: "Converted" },
  dropped:   { bg: "bg-[#F1F1F1]", fg: "text-[#666]",    label: "Dropped" },
};

export default function Opportunities() {
  const [rows, setRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sel, setSel] = useState(null);
  const [notes, setNotes] = useState("");

  const load = async () => {
    const url = statusFilter === "all" ? "/opportunities" : `/opportunities?status=${statusFilter}`;
    const { data } = await api.get(url);
    setRows(data);
  };
  useEffect(() => { load(); }, [statusFilter]);

  const update = async (uid, patch) => {
    try { await api.patch(`/opportunities/${uid}`, patch); toast.success("Updated"); load(); setSel(null); }
    catch { toast.error("Update failed"); }
  };

  const totalOpen = rows.filter(r => r.status === "open").reduce((s, r) => s + (r.estimated_fee || 0), 0);
  const totalConverted = rows.filter(r => r.status === "converted").reduce((s, r) => s + (r.estimated_fee || 0), 0);

  return (
    <div className="space-y-5" data-testid="opportunities-page">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F3D2E]">Advisory Opportunities</h1>
          <p className="text-sm text-[#0F3D2E]/60 mt-1">Missing documents on live cases converted into billable CorpZo services.</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="opp-status-filter"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KPI label="Open" v={rows.filter(r=>r.status==="open").length} amt={totalOpen} accent="#D89B00"/>
        <KPI label="Converted" v={rows.filter(r=>r.status==="converted").length} amt={totalConverted} accent="#0F8B6B"/>
        <KPI label="Total" v={rows.length} amt={rows.reduce((s,r)=>s+(r.estimated_fee||0),0)} accent="#1F5B4A"/>
      </div>

      <div className="bg-white border border-[#0F3D2E]/10 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[#0F3D2E]/10 flex items-center gap-2 font-display font-bold text-[#0F3D2E]">
          <HandCoins size={16} className="text-[#16A981]"/> All opportunities
        </div>
        <table className="w-full dense-table">
          <thead><tr>
            <th>UID</th><th>Client</th><th>Service</th><th>From case</th><th className="num-cell">Est. fee</th>
            <th>Status</th><th>Created</th><th></th>
          </tr></thead>
          <tbody>
            {rows.map(r => {
              const s = STATUS_TINT[r.status] || STATUS_TINT.open;
              return (
                <tr key={r.opportunity_uid} data-testid={`opp-row-${r.opportunity_uid}`}>
                  <td className="mono text-xs text-[#0F3D2E]/70">{r.opportunity_uid}</td>
                  <td><div className="font-medium">{r.client_name || "—"}</div><div className="text-xs text-[#0F3D2E]/50">{r.client_mobile}</div></td>
                  <td><div className="font-medium">{r.service_name}</div><div className="text-xs text-[#0F3D2E]/50">from {r.deficient_doc_category}</div></td>
                  <td className="mono text-xs text-[#0F3D2E]/70">{r.source_case_uid}</td>
                  <td className="num-cell font-semibold">{inr(r.estimated_fee)}</td>
                  <td><span className={`pill ${s.bg} ${s.fg}`}>{s.label}</span></td>
                  <td className="text-xs">{fmtDate(r.created_at)}</td>
                  <td><Button size="sm" variant="ghost" onClick={()=>{ setSel(r); setNotes(r.notes||""); }} data-testid={`opp-edit-${r.opportunity_uid}`}><ArrowUpRight size={13}/></Button></td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={8} className="p-10 text-center text-[#0F3D2E]/50">No opportunities yet. Convert missing documents on any case → Documents tab.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* edit dialog */}
      <Dialog open={!!sel} onOpenChange={o => !o && setSel(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Opportunity · {sel?.opportunity_uid}</DialogTitle></DialogHeader>
          {sel && <div className="space-y-3 py-2">
            <div className="text-sm"><b>{sel.service_name}</b> for <b>{sel.client_name || "—"}</b></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-[#0F3D2E]/60 mb-1">Status</div>
                <Select value={sel.status} onValueChange={v => setSel({...sel, status: v})}>
                  <SelectTrigger data-testid="opp-status-select"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="text-xs text-[#0F3D2E]/60 mb-1">Est. fee</div>
                <input type="number" value={sel.estimated_fee || 0} onChange={e=>setSel({...sel, estimated_fee: Number(e.target.value)})}
                  className="w-full h-10 px-3 rounded-md border border-[#0F3D2E]/15 text-sm num" data-testid="opp-fee-input"/>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#0F3D2E]/60 mb-1">Notes</div>
              <Textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} data-testid="opp-notes"/>
            </div>
          </div>}
          <DialogFooter>
            <Button variant="outline" onClick={()=>setSel(null)}>Cancel</Button>
            <Button className="bg-[#1F5B4A] hover:bg-[#0F3D2E] text-white"
              onClick={()=>update(sel.opportunity_uid, {status: sel.status, estimated_fee: sel.estimated_fee, notes})}
              data-testid="opp-save-btn">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function KPI({ label, v, amt, accent }) {
  return (
    <div className="bg-white border border-[#0F3D2E]/10 rounded-xl p-4">
      <div className="text-[10.5px] uppercase tracking-widest font-bold" style={{color: accent}}>{label}</div>
      <div className="font-display text-2xl font-bold text-[#0F3D2E] num mt-1">{v}</div>
      <div className="text-xs text-[#0F3D2E]/55 mt-0.5">{inr(amt)} pipeline</div>
    </div>
  );
}
