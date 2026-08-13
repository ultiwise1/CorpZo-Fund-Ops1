export default function AdminSettings() {
  return (
    <div className="space-y-4" data-testid="admin-settings-page">
      <h1 className="font-display text-2xl font-semibold">Settings</h1>
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        <Section title="Products" body="Working Capital, Term Loan, LAP, Home Loan, Business Loan, Personal Loan, CC/OD, Equipment Finance, Project Finance, Construction, SCF, Invoice Discounting, LAS, Structured, Private Credit."/>
        <Section title="Pipeline Stages" body="20 default stages including qualification, PD, credit assessment, mandate, lender submission, sanction, and disbursement. Configurable per product."/>
        <Section title="Rejection Reasons" body="17 preloaded reasons — CIBIL, DPD, FOIR, banking, vintage, geography, sector, collateral, documentation, pricing, obligations, competitor, unable to contact, other."/>
        <Section title="Incentive Rules" body="Configurable multipliers (2x within 90 days, 3x thereafter) with per-employee overrides and per-lender/product uplifts."/>
        <Section title="CP Commission Rules" body="Default 1% of disbursement with min/max caps. Overridable per partner and product."/>
        <Section title="Numbering Formats" body="LD-YYYY-######, CL-YYYY-######, CS-YYYY-######, LA-YYYY-######, MAN-YYYY-######, EMP-####, CP-####."/>
      </div>
    </div>
  );
}
function Section({ title, body }) {
  return <div>
    <div className="text-sm font-semibold text-slate-900">{title}</div>
    <div className="text-sm text-slate-600 mt-0.5">{body}</div>
  </div>;
}
