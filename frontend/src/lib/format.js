// Indian currency & number formatting

export function inr(n) {
  if (n === null || n === undefined || isNaN(n)) return "₹0";
  const num = Number(n);
  const sign = num < 0 ? "-" : "";
  const abs = Math.abs(num);
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}

export function inrFull(n) {
  if (n === null || n === undefined || isNaN(n)) return "₹0";
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function fmtDate(d) {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateTime(d) {
  if (!d) return "-";
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export function timeAgo(d) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  const diff = (Date.now() - dt.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 30 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return fmtDate(d);
}

const STAGE_STYLE = {
  new_lead: "pill-blue",
  assigned: "pill-blue",
  contact_attempted: "pill-slate",
  connected: "pill-blue",
  qualified: "pill-green",
  requirement_pd: "pill-terr",
  documentation_pending: "pill-amber",
  documentation_received: "pill-blue",
  credit_assessment: "pill-terr",
  mandate_pending: "pill-amber",
  mandate_signed: "pill-green",
  lender_mapping: "pill-blue",
  submitted: "pill-blue",
  under_credit: "pill-terr",
  sanctioned: "pill-green",
  documentation_conditions: "pill-amber",
  disbursement_pending: "pill-amber",
  partially_disbursed: "pill-blue",
  fully_disbursed: "pill-green",
  closed: "pill-slate",
  follow_up: "pill-amber",
  cold: "pill-slate",
  rejected: "pill-red",
  not_interested: "pill-slate",
  not_eligible: "pill-red",
  unable_to_contact: "pill-slate",
  escalated: "pill-red",
  duplicate: "pill-slate",
  lost: "pill-red",
  paid: "pill-green",
  part_paid: "pill-amber",
  pending: "pill-amber",
  overdue: "pill-red",
  cancelled: "pill-slate",
  refunded: "pill-slate",
  active: "pill-green",
  draft: "pill-slate",
  signed: "pill-green",
  approved: "pill-green",
  accrued: "pill-amber",
  received: "pill-blue",
  open: "pill-amber",
  in_progress: "pill-blue",
  done: "pill-green",
  hot: "pill-red",
  warm: "pill-amber",
  cold: "pill-slate",
};

export function pillClass(status) {
  return STAGE_STYLE[status] || "pill-slate";
}

export function humanize(s) {
  if (!s) return "";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const PRODUCTS = [
  "working_capital","cc_od","term_loan","lap","home_loan","business_loan","personal_loan",
  "equipment_finance","project_finance","construction_finance","supply_chain_finance",
  "invoice_discounting","loan_against_securities","structured_finance","private_credit","other",
];

export const STAGES = [
  "new_lead","assigned","contact_attempted","connected","qualified","requirement_pd",
  "documentation_pending","documentation_received","credit_assessment","mandate_pending",
  "mandate_signed","lender_mapping","submitted","under_credit","sanctioned",
  "documentation_conditions","disbursement_pending","partially_disbursed","fully_disbursed","closed",
];

export const REJECTION_REASONS = [
  "CIBIL","DPD","Low turnover","FOIR","Banking","Insufficient vintage","Geography","Sector",
  "Collateral","Documentation","Pricing","Existing obligations","Lender rejection",
  "Client withdrew","Competitor","Unable to contact","Other",
];
