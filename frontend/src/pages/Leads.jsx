import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { inr, humanize, pillClass, timeAgo, STAGES } from "@/lib/format";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [stage, setStage] = useState("");
  const [priority, setPriority] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:"", mobile:"", email:"", company:"", city:"", state:"",
    product:"business_loan", approx_requirement: 5000000, source:"manual", priority:"warm", borrower_type:"business" });
  const nav = useNavigate();

  const load = async () => {
    const params = new URLSearchParams();
    if (stage) params.set("stage", stage);
    if (priority) params.set("priority", priority);
    if (q) params.set("q", q);
    const { data } = await api.get(`/leads?${params.toString()}`);
    setLeads(data);
  };
  useEffect(() => { load(); }, [stage, priority]);

  const submit = async () => {
    try {
      await api.post("/leads", form);
      toast.success("Lead created");
      setOpen(false); load();
    } catch (e) { toast.error("Failed to create lead"); }
  };

  return (
    <div className="space-y-4" data-testid="leads-page">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-900">Leads</h1>
          <p className="text-sm text-slate-500">Every prospective borrower — no matter the source.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-900 hover:bg-slate-800" data-testid="new-lead-btn"><Plus size={15} className="mr-1"/>New Lead</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create new lead</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="col-span-2"><Label>Name</Label><Input data-testid="lead-name-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
              <div><Label>Mobile</Label><Input data-testid="lead-mobile-input" value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})}/></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              <div className="col-span-2"><Label>Company</Label><Input value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/></div>
              <div><Label>City</Label><Input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></div>
              <div><Label>State</Label><Input value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/></div>
              <div><Label>Product</Label>
                <Select value={form.product} onValueChange={v=>setForm({...form,product:v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{["business_loan","working_capital","term_loan","lap","home_loan","personal_loan","cc_od","equipment_finance"].map(p => <SelectItem key={p} value={p}>{humanize(p)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Requirement (₹)</Label><Input type="number" value={form.approx_requirement} onChange={e=>setForm({...form,approx_requirement:Number(e.target.value)})}/></div>
              <div><Label>Source</Label>
                <Select value={form.source} onValueChange={v=>setForm({...form,source:v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{["manual","website","referral","google_ads","meta_ads","whatsapp","channel_partner"].map(s => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Priority</Label>
                <Select value={form.priority} onValueChange={v=>setForm({...form,priority:v})}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>{["hot","warm","cold"].map(s => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={()=>setOpen(false)}>Cancel</Button>
              <Button className="bg-slate-900 hover:bg-slate-800" onClick={submit} data-testid="submit-lead-btn">Create Lead</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2 items-center bg-white border border-slate-200 rounded-lg p-3">
        <Filter size={14} className="text-slate-400"/>
        <Input placeholder="Search name, mobile, UID…" className="w-72" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter' && load()} data-testid="lead-search"/>
        <Select value={stage} onValueChange={v=>setStage(v==='all'?'':v)}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Stage"/></SelectTrigger>
          <SelectContent><SelectItem value="all">All stages</SelectItem>{STAGES.map(s => <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={priority} onValueChange={v=>setPriority(v==='all'?'':v)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Priority"/></SelectTrigger>
          <SelectContent><SelectItem value="all">All priorities</SelectItem><SelectItem value="hot">Hot</SelectItem><SelectItem value="warm">Warm</SelectItem><SelectItem value="cold">Cold</SelectItem></SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={load}>Apply</Button>
        <div className="ml-auto text-xs text-slate-500 num">{leads.length} lead(s)</div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="max-h-[65vh] overflow-auto">
          <table className="w-full dense-table" data-testid="leads-table">
            <thead><tr>
              <th>UID</th><th>Name / Company</th><th>Mobile</th><th>Product</th>
              <th className="num-cell">Requirement</th><th>Source</th><th>Priority</th>
              <th>Stage</th><th>Created</th>
            </tr></thead>
            <tbody>
              {leads.map(l => (
                <tr key={l.lead_uid} className="cursor-pointer" onClick={()=>nav(`/leads/${l.lead_uid}`)} data-testid={`lead-row-${l.lead_uid}`}>
                  <td className="mono text-xs">{l.lead_uid}</td>
                  <td><div className="font-medium text-slate-900">{l.name}</div><div className="text-xs text-slate-500">{l.company || l.email}</div></td>
                  <td className="mono text-xs">{l.mobile}</td>
                  <td>{humanize(l.product)}</td>
                  <td className="num-cell">{inr(l.approx_requirement)}</td>
                  <td>{humanize(l.source)}</td>
                  <td><span className={`pill ${pillClass(l.priority)}`}>{humanize(l.priority)}</span></td>
                  <td><span className={`pill ${pillClass(l.stage)}`}>{humanize(l.stage)}</span></td>
                  <td className="text-xs text-slate-500">{timeAgo(l.created_at)}</td>
                </tr>
              ))}
              {leads.length===0 && <tr><td colSpan={9} className="p-8 text-center text-slate-500">No leads yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
