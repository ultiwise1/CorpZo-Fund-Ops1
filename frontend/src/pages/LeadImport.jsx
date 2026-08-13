import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { humanize } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

const FIELDS = [
  { key: "name", label: "Name *" },
  { key: "mobile", label: "Mobile" },
  { key: "email", label: "Email" },
  { key: "company", label: "Company" },
  { key: "pan", label: "PAN" },
  { key: "gstin", label: "GSTIN" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "product", label: "Product" },
  { key: "approx_requirement", label: "Requirement (₹)" },
  { key: "source", label: "Source" },
  { key: "borrower_type", label: "Borrower Type" },
  { key: "priority", label: "Priority" },
  { key: "notes", label: "Notes" },
];

export default function LeadImport() {
  const [step, setStep] = useState(1);
  const [raw, setRaw] = useState("");
  const [header, setHeader] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [result, setResult] = useState(null);
  const nav = useNavigate();

  const parse = () => {
    const lines = raw.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) { toast.error("Need header + at least 1 row"); return; }
    const sep = lines[0].includes("\t") ? "\t" : ",";
    const h = lines[0].split(sep).map(s => s.trim());
    const r = lines.slice(1).map(l => l.split(sep).map(s => s.trim()));
    setHeader(h); setRows(r);
    // heuristic auto-mapping
    const m = {};
    h.forEach((col, i) => {
      const l = col.toLowerCase();
      FIELDS.forEach(f => {
        if (l === f.key || l.includes(f.key.replace("_"," ")) || (f.key === "approx_requirement" && (l.includes("amount") || l.includes("requirement"))))
          m[f.key] = i;
      });
    });
    setMapping(m); setStep(2);
  };

  const buildPayload = () => rows.map((r) => {
    const obj = {};
    FIELDS.forEach(f => {
      const idx = mapping[f.key];
      if (idx !== undefined && idx !== "" && r[idx] !== undefined) obj[f.key] = r[idx];
    });
    return obj;
  });

  const preview = () => setStep(3);

  const doImport = async () => {
    const payload = buildPayload();
    try {
      const { data } = await api.post("/leads/import", { rows: payload });
      setResult(data); setStep(4);
      toast.success(`${data.counts.imported} imported`);
    } catch (e) { toast.error(e.response?.data?.detail || "Import failed"); }
  };

  const StepDot = ({ n, label }) => (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step >= n ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-500"}`}>{n}</div>
      <span className={`text-sm ${step >= n ? "text-slate-900 font-medium" : "text-slate-500"}`}>{label}</span>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl" data-testid="lead-import-page">
      <div>
        <h1 className="font-display text-2xl font-semibold">Import Leads</h1>
        <p className="text-sm text-slate-500">Paste from Excel/Google Sheets, map columns, dedupe by mobile / PAN / GSTIN, and load hundreds of leads in one go.</p>
      </div>

      <div className="flex items-center gap-6 bg-white border border-slate-200 rounded-lg p-4">
        <StepDot n={1} label="Paste"/>
        <div className="h-px flex-1 bg-slate-200"/>
        <StepDot n={2} label="Map columns"/>
        <div className="h-px flex-1 bg-slate-200"/>
        <StepDot n={3} label="Preview"/>
        <div className="h-px flex-1 bg-slate-200"/>
        <StepDot n={4} label="Result"/>
      </div>

      {step === 1 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3" data-testid="import-step-paste">
          <p className="text-sm text-slate-600">Paste rows with a header. Tab-separated (from Excel) or comma-separated both work.</p>
          <Textarea rows={12} value={raw} onChange={e=>setRaw(e.target.value)} placeholder="Name,Mobile,Email,Company,City,Product,Requirement&#10;Rahul Sharma,9876543210,rahul@x.com,Sharma Traders,Mumbai,business_loan,2500000" data-testid="import-paste-area"/>
          <div className="flex justify-end"><Button onClick={parse} data-testid="import-parse-btn"><Upload size={14} className="mr-1"/>Parse</Button></div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4" data-testid="import-step-map">
          <p className="text-sm text-slate-600">Map your columns to CorpZo fields. Auto-detected picks are pre-filled.</p>
          <div className="grid grid-cols-2 gap-3">
            {FIELDS.map(f => (
              <div key={f.key} className="flex items-center gap-2">
                <div className="w-40 text-sm text-slate-700">{f.label}</div>
                <Select value={String(mapping[f.key] ?? "")} onValueChange={(v)=>setMapping({...mapping, [f.key]: v === "none" ? "" : parseInt(v)})}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="—"/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— skip —</SelectItem>
                    {header.map((h, i) => <SelectItem key={i} value={String(i)}>{h}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={()=>setStep(1)}>Back</Button>
            <Button onClick={preview} data-testid="import-preview-btn">Preview {rows.length} rows</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden" data-testid="import-step-preview">
          <div className="p-4 flex justify-between items-center border-b border-slate-200">
            <div className="text-sm text-slate-500"><span className="font-semibold text-slate-900">{rows.length}</span> rows ready</div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={()=>setStep(2)}>Back</Button>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={doImport} data-testid="import-run-btn">Import {rows.length} leads</Button>
            </div>
          </div>
          <div className="max-h-[50vh] overflow-auto">
            <table className="w-full dense-table">
              <thead><tr>{FIELDS.filter(f=>mapping[f.key] !== undefined && mapping[f.key] !== "").map(f => <th key={f.key}>{humanize(f.key)}</th>)}</tr></thead>
              <tbody>
                {buildPayload().slice(0,50).map((r, i) => (
                  <tr key={i}>{FIELDS.filter(f=>mapping[f.key] !== undefined && mapping[f.key] !== "").map(f => <td key={f.key} className="text-xs">{r[f.key]}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === 4 && result && (
        <div className="space-y-3" data-testid="import-step-result">
          <div className="grid grid-cols-3 gap-3">
            <Card icon={CheckCircle2} label="Imported" value={result.counts.imported} tone="green"/>
            <Card icon={AlertTriangle} label="Duplicates" value={result.counts.duplicates} tone="amber"/>
            <Card icon={XCircle} label="Errors" value={result.counts.errors} tone="red"/>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="text-xs text-slate-500 mb-2">Batch ID</div>
            <div className="mono text-sm">{result.batch_id}</div>
          </div>
          {result.duplicates?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2 text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">Skipped duplicates</div>
              <table className="w-full dense-table">
                <thead><tr><th>Row</th><th>Input</th><th>Match</th></tr></thead>
                <tbody>{result.duplicates.map((d,i) => <tr key={i}><td className="num-cell">{d.row+1}</td><td className="text-xs">{d.input?.name || d.input?.mobile || d.input?.email}</td><td className="mono text-xs">{d.match?.lead_uid || d.match?.client_uid} · {d.match?.name}</td></tr>)}</tbody>
              </table>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>{ setStep(1); setRaw(""); setRows([]); setHeader([]); setResult(null); }}>Import more</Button>
            <Button onClick={()=>nav("/leads")}>Go to Leads</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ icon: Icon, label, value, tone }) {
  const tones = { green: "text-emerald-700 bg-emerald-50", amber: "text-amber-700 bg-amber-50", red: "text-red-700 bg-red-50" };
  return <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-md flex items-center justify-center ${tones[tone]}`}><Icon size={20}/></div>
    <div><div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</div><div className="text-xl font-display font-semibold num">{value}</div></div>
  </div>;
}
