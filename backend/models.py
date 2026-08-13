"""Pydantic models & shared enums for CorpZo Debt CRM."""
from __future__ import annotations
from datetime import datetime, timezone
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field, ConfigDict
import uuid


# ---------- Enums (kept as string constants for MongoDB simplicity) ----------
ROLES = [
    "super_admin", "business_head", "sales_manager", "sales_agent",
    "credit_head", "credit_analyst", "documentation", "operations",
    "finance", "compliance", "channel_manager", "channel_partner",
]

LEAD_STAGES = [
    "new_lead", "assigned", "contact_attempted", "connected", "qualified",
    "requirement_pd", "documentation_pending", "documentation_received",
    "credit_assessment", "mandate_pending", "mandate_signed",
    "lender_mapping", "submitted", "under_credit", "sanctioned",
    "documentation_conditions", "disbursement_pending",
    "partially_disbursed", "fully_disbursed", "closed",
    "follow_up", "cold", "rejected", "not_interested", "not_eligible",
    "unable_to_contact", "escalated", "duplicate", "lost",
]

PRODUCTS = [
    "working_capital", "cc_od", "term_loan", "lap", "home_loan",
    "business_loan", "personal_loan", "equipment_finance",
    "project_finance", "construction_finance", "supply_chain_finance",
    "invoice_discounting", "loan_against_securities",
    "structured_finance", "private_credit", "other",
]

BORROWER_TYPES = ["business", "individual"]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def new_id(prefix: str = "id") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


# ---------- Base ----------
class TSModel(BaseModel):
    model_config = ConfigDict(extra="ignore")


# ---------- User / Auth ----------
class User(TSModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = ""
    role: str = "sales_agent"
    employee_uid: Optional[str] = None
    active: bool = True
    created_at: str = Field(default_factory=now_iso)


# ---------- Employee ----------
class Employee(TSModel):
    employee_uid: str
    user_id: Optional[str] = None
    email: str
    name: str
    role: str
    manager_uid: Optional[str] = None
    joining_date: str
    ctc_monthly: float = 0
    target_multiplier: float = 3.0
    revenue_target: float = 0
    disbursement_target: float = 0
    login_target: int = 0
    sanction_target: int = 0
    active: bool = True
    created_at: str = Field(default_factory=now_iso)


# ---------- Channel Partner ----------
class ChannelPartner(TSModel):
    partner_uid: str
    channel_code: str
    name: str
    entity_name: Optional[str] = ""
    pan: Optional[str] = ""
    gst: Optional[str] = ""
    kyc_status: str = "pending"
    bank_account: Dict[str, Any] = Field(default_factory=dict)
    agreement_signed: bool = False
    products: List[str] = Field(default_factory=list)
    geography: List[str] = Field(default_factory=list)
    channel_manager_uid: Optional[str] = None
    commission_structure: Dict[str, Any] = Field(default_factory=dict)
    status: str = "active"
    mobile: str = ""
    email: str = ""
    city: str = ""
    state: str = ""
    created_at: str = Field(default_factory=now_iso)


# ---------- Lead ----------
class Lead(TSModel):
    lead_uid: str
    source: str = "manual"
    source_detail: Optional[str] = ""
    campaign: Optional[str] = ""
    referral: Optional[str] = ""
    channel_partner_uid: Optional[str] = None
    assigned_to: Optional[str] = None
    original_owner: Optional[str] = None
    borrower_type: str = "business"
    name: str
    company: Optional[str] = ""
    mobile: str = ""
    email: str = ""
    city: str = ""
    state: str = ""
    product: str = "business_loan"
    approx_requirement: float = 0
    notes: Optional[str] = ""
    stage: str = "new_lead"
    priority: str = "warm"  # hot/warm/cold
    probability: int = 30
    expected_closure: Optional[str] = None
    rejection_reason: Optional[str] = None
    client_uid: Optional[str] = None
    converted: bool = False
    duplicate_of: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- Client / Borrower ----------
class Client(TSModel):
    client_uid: str
    name: str
    borrower_type: str = "business"
    company: Optional[str] = ""
    pan: Optional[str] = ""
    cin: Optional[str] = ""
    gstin: Optional[str] = ""
    mobile: str = ""
    email: str = ""
    city: str = ""
    state: str = ""
    industry: Optional[str] = ""
    constitution: Optional[str] = ""
    incorporation_date: Optional[str] = None
    relationship_manager: Optional[str] = None
    channel_partner_uid: Optional[str] = None
    source: str = "manual"
    tags: List[str] = Field(default_factory=list)
    lead_uid: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- Case ----------
class Case(TSModel):
    case_uid: str
    client_uid: str
    product: str
    requirement: float = 0
    purpose: Optional[str] = ""
    tenure_months: int = 60
    security: Optional[str] = ""
    geography: Optional[str] = ""
    expected_roi: float = 0
    urgency: str = "normal"
    sales_owner: Optional[str] = None
    credit_owner: Optional[str] = None
    channel_partner_uid: Optional[str] = None
    source: str = "manual"
    stage: str = "new_lead"
    expected_closure: Optional[str] = None
    expected_revenue: float = 0
    actual_revenue: float = 0
    sanctioned_amount: float = 0
    disbursed_amount: float = 0
    lead_uid: Optional[str] = None
    documentation_pct: int = 0
    created_at: str = Field(default_factory=now_iso)


# ---------- Personal Discussion ----------
class PDForm(TSModel):
    pd_id: str
    case_uid: str
    client_uid: str
    template: str  # "business" | "individual"
    data: Dict[str, Any] = Field(default_factory=dict)
    version: int = 1
    conducted_by: str
    conducted_on: str = Field(default_factory=now_iso)
    created_at: str = Field(default_factory=now_iso)


# ---------- Document ----------
class Document(TSModel):
    document_id: str
    client_uid: str
    case_uid: Optional[str] = None
    category: str
    doc_type: str
    financial_period: Optional[str] = None
    version: int = 1
    storage_path: Optional[str] = None
    original_filename: Optional[str] = None
    content_type: Optional[str] = None
    size: int = 0
    uploaded_by: str
    uploaded_at: str = Field(default_factory=now_iso)
    status: str = "received"
    verified_by: Optional[str] = None
    verified_at: Optional[str] = None
    expiry_date: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    notes: Optional[str] = ""
    superseded_by: Optional[str] = None


# ---------- Bureau ----------
class BureauCheck(TSModel):
    bureau_id: str
    client_uid: str
    case_uid: Optional[str] = None
    provider: str  # cibil/experian/crif/equifax
    consent_captured: bool = False
    consent_at: Optional[str] = None
    pulled_at: str = Field(default_factory=now_iso)
    reference_number: str
    score: int = 0
    accounts: int = 0
    enquiries: int = 0
    dpd_current: int = 0
    overdue_amount: float = 0
    written_off: float = 0
    settlements: int = 0
    utilisation: float = 0
    raw_report: Dict[str, Any] = Field(default_factory=dict)
    is_sandbox: bool = True


# ---------- Credit Assessment ----------
class CreditAssessment(TSModel):
    assessment_id: str
    case_uid: str
    client_uid: str
    overview: Dict[str, Any] = Field(default_factory=dict)
    financials: Dict[str, Any] = Field(default_factory=dict)
    banking: Dict[str, Any] = Field(default_factory=dict)
    ratios: Dict[str, Any] = Field(default_factory=dict)
    positives: List[str] = Field(default_factory=list)
    concerns: List[str] = Field(default_factory=list)
    flags: List[Dict[str, Any]] = Field(default_factory=list)
    indicative_eligibility: float = 0
    analyst_comments: str = ""
    recommendation: str = ""
    prepared_by: Optional[str] = None
    prepared_at: str = Field(default_factory=now_iso)


# ---------- Mandate ----------
class Mandate(TSModel):
    mandate_uid: str
    client_uid: str
    case_uid: str
    scope: str
    upfront_fee: float = 0
    success_fee_pct: float = 0
    min_fee: float = 0
    taxes_pct: float = 18
    other_charges: float = 0
    validity_days: int = 90
    exclusivity: bool = False
    signatory: str = ""
    signing_method: str = "esign"  # esign | physical
    status: str = "draft"  # draft, internal_approval, sent, viewed, signed, verified, active
    version: int = 1
    signed_at: Optional[str] = None
    document_id: Optional[str] = None
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- Invoice / Payment ----------
class Invoice(TSModel):
    invoice_uid: str
    client_uid: str
    case_uid: Optional[str] = None
    mandate_uid: Optional[str] = None
    amount: float
    gst_pct: float = 18
    tds_pct: float = 0
    status: str = "pending"  # pending, part_paid, paid, overdue, cancelled, refunded
    due_date: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class Payment(TSModel):
    payment_uid: str
    invoice_uid: str
    client_uid: str
    amount: float
    mode: str = "neft"
    reference: str = ""
    received_on: str
    remarks: Optional[str] = ""
    created_at: str = Field(default_factory=now_iso)


# ---------- Lender ----------
class Lender(TSModel):
    lender_id: str
    name: str
    lender_type: str  # bank, nbfc, hfc, dfc
    products: List[str] = Field(default_factory=list)
    ticket_size_min: float = 0
    ticket_size_max: float = 0
    geography: List[str] = Field(default_factory=list)
    industries: List[str] = Field(default_factory=list)
    min_turnover: float = 0
    min_vintage_years: float = 0
    min_bureau_score: int = 700
    foir: float = 55
    ltv: float = 70
    roi_min: float = 8.5
    roi_max: float = 18
    tenure_min: int = 12
    tenure_max: int = 180
    collateral_required: bool = False
    excluded_sectors: List[str] = Field(default_factory=list)
    tat_days: int = 15
    rm_name: str = ""
    rm_mobile: str = ""
    rm_email: str = ""
    notes: str = ""
    active: bool = True
    created_at: str = Field(default_factory=now_iso)


# ---------- Lender Application ----------
class LenderApplication(TSModel):
    application_uid: str
    case_uid: str
    client_uid: str
    lender_id: str
    submission_date: Optional[str] = None
    lender_rm: str = ""
    lender_login_no: str = ""
    amount_requested: float
    product: str
    status: str = "mapped"  # mapped, docs_prepared, submitted, login_confirmed, under_credit, query_raised, query_responded, approved, sanctioned, rejected, withdrawn
    sanction_amount: float = 0
    roi: float = 0
    tenure_months: int = 0
    fees: float = 0
    security: str = ""
    conditions: str = ""
    rejection_reason: str = ""
    documents_shared: List[str] = Field(default_factory=list)
    created_by: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- Lender Query ----------
class LenderQuery(TSModel):
    query_id: str
    application_uid: str
    case_uid: str
    query_text: str
    raised_by: str = "lender"  # lender/internal
    assigned_to: Optional[str] = None
    required_document: Optional[str] = None
    due_date: Optional[str] = None
    response: Optional[str] = None
    attachment_id: Optional[str] = None
    status: str = "open"  # open, awaiting_client, awaiting_internal, responded, closed
    created_at: str = Field(default_factory=now_iso)


# ---------- Sanction ----------
class Sanction(TSModel):
    sanction_uid: str
    application_uid: str
    case_uid: str
    lender_id: str
    sanction_amount: float
    sanction_date: str
    roi: float
    benchmark: str = "REPO"
    spread: float = 0
    tenure_months: int
    emi: float = 0
    moratorium_months: int = 0
    security: str = ""
    ltv: float = 0
    processing_fee_pct: float = 0
    insurance_amount: float = 0
    conditions_precedent: str = ""
    conditions_subsequent: str = ""
    validity_days: int = 30
    document_id: Optional[str] = None
    status: str = "received"  # received, internal_review, client_shared, accepted, rejected, docs_pending, ready_for_disbursement
    created_at: str = Field(default_factory=now_iso)


# ---------- Disbursement ----------
class Disbursement(TSModel):
    disbursement_uid: str
    case_uid: str
    sanction_uid: str
    lender_id: str
    amount: float
    requested_date: Optional[str] = None
    disbursement_date: str
    reference: str = ""
    destination: str = ""
    status: str = "completed"  # requested, processed, completed
    notes: str = ""
    proof_document_id: Optional[str] = None
    tranche_no: int = 1
    created_at: str = Field(default_factory=now_iso)


# ---------- Employee Incentive ----------
class Incentive(TSModel):
    incentive_id: str
    employee_uid: str
    period: str  # e.g. 2026-02
    disbursement_amount: float = 0
    revenue_collected: float = 0
    calculated_amount: float = 0
    override_amount: Optional[float] = None
    override_reason: Optional[str] = None
    status: str = "calculated"  # calculated, accrued, manager_approved, finance_approved, payable, paid
    approved_by: Optional[str] = None
    paid_on: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- Channel Partner Commission ----------
class CPCommission(TSModel):
    commission_id: str
    partner_uid: str
    case_uid: str
    disbursement_uid: str
    disbursement_amount: float
    commission_pct: float
    commission_amount: float
    tds_amount: float = 0
    payable_amount: float = 0
    status: str = "accrued"  # accrued, approved, paid
    paid_on: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- Task ----------
class Task(TSModel):
    task_id: str
    title: str
    description: str = ""
    owner_uid: str
    created_by: str
    case_uid: Optional[str] = None
    client_uid: Optional[str] = None
    lead_uid: Optional[str] = None
    application_uid: Optional[str] = None
    priority: str = "normal"  # low, normal, high, urgent
    due_date: str
    status: str = "open"  # open, in_progress, done, cancelled
    origin: str = "manual"  # follow_up, missing_doc, lender_query, etc
    created_at: str = Field(default_factory=now_iso)


# ---------- Communication / Activity ----------
class Activity(TSModel):
    activity_id: str
    entity_type: str  # lead/client/case
    entity_id: str
    kind: str  # call_in, call_out, meeting, note, whatsapp, email, status_change, upload
    author_uid: str
    author_name: str
    summary: str
    details: Dict[str, Any] = Field(default_factory=dict)
    duration_sec: Optional[int] = None
    outcome: Optional[str] = None
    next_followup: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


# ---------- Audit Log ----------
class AuditLog(TSModel):
    audit_id: str
    actor_uid: str
    actor_name: str
    entity_type: str
    entity_id: str
    action: str
    before: Optional[Dict[str, Any]] = None
    after: Optional[Dict[str, Any]] = None
    ip: Optional[str] = None
    at: str = Field(default_factory=now_iso)


# ---------- Notification ----------
class Notification(TSModel):
    notification_id: str
    user_id: str
    title: str
    body: str = ""
    link: Optional[str] = None
    kind: str = "info"
    read: bool = False
    created_at: str = Field(default_factory=now_iso)


# ---------- Settings / config ----------
class ConfigItem(TSModel):
    key: str
    value: Any
    updated_at: str = Field(default_factory=now_iso)
