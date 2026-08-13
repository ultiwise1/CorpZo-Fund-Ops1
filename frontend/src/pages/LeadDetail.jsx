import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { inr, humanize, pillClass, fmtDateTime, STAGES, REJECTION_REASONS } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, MessageSquare, PhoneOutgoing, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function LeadDetail() {
  const { uid } = useParams();
  const nav = useNavigate();
  const [d, setD] = useState(null);
  const [note, setNote] = useState("");
  const [duration, setDuration] = useState(0);
  const [outcome, setOutcome] = useState("connected");

  const load = async () => {
    const { data } = await api.get(`/leads/${uid}`);
    setD(data);
  };
  useEffect(() => { load(); }, [uid]);

  const changeStage = async (s) => { await api.patch(`/leads/${uid}`, { stage: s }); toast.success("Stage updated"); load(); };
  const changePriority = async (p) => { await api.patch(`/leads/${uid}`, { priority: p }); load(); };

  const logActivity = async (kind) => {
    if (!note && kind === "note") return;
    await api.post(`/activities`, {
      entity_type: "lead", entity_id: uid, kind,
      summary: note || humanize(kind),
      duration_sec: Number(duration) * 60 || null,
      outcome,
    });
    setNote(""); setDuration(0); toast.success("Logged");
    load();
  };

  const convert = async () => {
    try {
      const { data } = await api.post(`/leads/${uid}/convert`);
      toast.success("Converted to Client + Case");
      nav(`/cases/${data.case.case_uid}`);
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  if (!d) return <div className="text-slate-500">Loading…</div>;
  const l = d.lead;

  return (
    <div className="space-y-4" data-testid="lead-detail-page">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 mono">{l.lead_uid}</div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">{l.name}</h1>
          <div className="text-sm text-slate-500">
            {[l.company, l.city, l.state].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={()=>logActivity("call_out")} data-testid="log-call-btn"><PhoneOutgoing size={14} className="mr-1"/>Log Call</Button>
          {!l.converted && <Button className="bg-orange-600 hover:bg-orange-700" onClick={convert} data-testid="convert-btn">Convert to Client<ArrowRight size={14} className="ml-1"/></Button>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="font-display font-semibold mb-3 text-sm">Overview</h3>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><div className="text-xs text-slate-500">Mobile</div><div className="mono">{l.mobile}</div></div>
              <div><div className="text-xs text-slate-500">Email</div><div>{l.email}</div></div>
              <div><div className="text-xs text-slate-500">Product</div><div>{humanize(l.product)}</div></div>
              <div><div className="text-xs text-slate-500">Requirement</div><div className="num font-semibold">{inr(l.approx_requirement)}</div></div>
              <div><div className="text-xs text-slate-500">Source</div><div>{humanize(l.source)}</div></div>
              <div><div className="text-xs text-slate-500">Borrower Type</div><div>{humanize(l.borrower_type)}</div></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="font-display font-semibold mb-3 text-sm">Log activity</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="col-span-3"><Textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note or call summary…" data-testid="activity-note-input"/></div>
              <div><Label className="text-xs">Duration (min)</Label><Input type="number" value={duration} onChange={e=>setDuration(e.target.value)}/></div>
              <div><Label className="text-xs">Outcome</Label>
                <Select value={outcome} onValueChange={setOutcome}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{["connected","interested","callback","not_interested","no_answer","voicemail","busy"].map(v => <SelectItem key={v} value={v}>{humanize(v)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button size="sm" onClick={()=>logActivity("call_out")}><Phone size={14} className="mr-1"/>Call</Button>
                <Button size="sm" variant="outline" onClick={()=>logActivity("note")}><MessageSquare size={14} className="mr-1"/>Note</Button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4" data-testid="activities-list">
            <h3 className="font-display font-semibold mb-3 text-sm">Activity timeline</h3>
            <div className="space-y-3">
              {d.activities.map(a => (
                <div key={a.activity_id} className="flex gap-3 pb-3 border-b border-slate-100 last:border-0">
                  <div className="w-1.5 h-1.5 mt-2 rounded-full bg-orange-500 shrink-0"/>
                  <div className="flex-1">
                    <div className="text-sm text-slate-900">{a.summary}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {a.author_name} · {fmtDateTime(a.created_at)} {a.duration_sec && ` · ${Math.round(a.duration_sec/60)}m`} {a.outcome && ` · ${humanize(a.outcome)}`}
                    </div>
                  </div>
                  <span className={`pill ${pillClass(a.kind)}`}>{humanize(a.kind)}</span>
                </div>
              ))}
              {d.activities.length===0 && <div className="text-sm text-slate-500">No activity yet.</div>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="font-display font-semibold mb-2 text-sm">Status</h3>
            <Label className="text-xs">Stage</Label>
            <Select value={l.stage} onValueChange={changeStage}>
              <SelectTrigger data-testid="lead-stage-select"><SelectValue/></SelectTrigger>
              <SelectContent className="max-h-64">{STAGES.map(s => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}</SelectContent>
            </Select>
            <Label className="text-xs mt-3 block">Priority</Label>
            <Select value={l.priority} onValueChange={changePriority}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>{["hot","warm","cold"].map(v => <SelectItem key={v} value={v}>{humanize(v)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <h3 className="font-display font-semibold mb-2 text-sm">Rejection reason</h3>
            <Select value={l.rejection_reason || ""} onValueChange={async (v)=>{ await api.patch(`/leads/${uid}`, {rejection_reason: v}); load(); }}>
              <SelectTrigger><SelectValue placeholder="None"/></SelectTrigger>
              <SelectContent>{REJECTION_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
