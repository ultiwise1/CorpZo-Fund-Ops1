# CorpZo Debt CRM — PRD

## Original problem statement
Build a production-grade internal Debt Origination, Loan Facilitation, Credit Processing and Sales CRM for CorpZo. Manages the complete lifecycle of business and individual loan cases: lead ingestion → qualification → docs → CIBIL → credit assessment → lender submission → sanction → disbursement → fee collection → employee incentives → channel-partner payouts.

## Architecture (implemented Feb 2026)
- **Backend**: FastAPI + MongoDB (motor async), single-file `server.py` with modular helpers: `models.py`, `auth.py`, `storage.py`, `uids.py`, `seed.py`.
- **Frontend**: React 19 + React Router 7 + Tailwind + shadcn/ui. Left-sidebar operations UI with Outfit + IBM Plex Sans typography, refined graphite/terracotta theme.
- **Auth**: Emergent-managed Google Social Login (httpOnly cookies, DB-backed sessions, 7-day expiry, auto-seed super_admin for `corpzoindia@gmail.com`).
- **Storage**: Emergent Object Storage for document uploads with versioning + DB soft-delete.
- **UIDs**: Atomic MongoDB counter-based (`LD-YYYY-######`, `CL-YYYY-######`, `CS-YYYY-######`, `LA-YYYY-######`, `MAN-YYYY-######`, `SN/DB/INV/PAY-YYYY-######`, `EMP-####`, `CP-####`).
- **Bureau / eSign / Payment Gateway / Telephony / WhatsApp / SMS**: Sandbox adapters + Integrations screen (per spec §35).

## Entities & data model
Lead • Client • Case • Employee • ChannelPartner • Document • PDForm • BureauCheck • CreditAssessment • Mandate • Invoice • Payment • Lender • LenderApplication • LenderQuery • Sanction • Disbursement • Incentive • CPCommission • Task • Activity • AuditLog • Notification.

## Implemented (v1 – Feb 2026)
- ✅ Google Sign-in, session cookies, 12-role RBAC
- ✅ Dashboard with pipeline funnel, top lenders, invoice summary, 8 KPIs
- ✅ Leads (CRUD + filters + convert to Client+Case)
- ✅ Clients + 360 view (cases, docs, invoices, mandates, timeline)
- ✅ Cases (list + full-tab detail: Overview, PD, Docs, Bureau, Applications, Queries, Sanctions, Disbursements, Timeline)
- ✅ Lender master (10 seeded Indian lenders — HDFC, ICICI, Axis, Kotak, Bajaj, Tata, ABF, Piramal, IndusInd, Yes)
- ✅ Lender Applications (multi-lender per case), Lender Queries
- ✅ Sanctions & Disbursements (partial + full, multi-tranche)
- ✅ Mandates lifecycle (draft → active)
- ✅ Invoices + Payments (GST/TDS)
- ✅ Employees with target multiplier (2x < 90 days, 3x otherwise), Incentives (accrual + approval)
- ✅ Channel Partners + CP Commissions
- ✅ Tasks with overdue highlight
- ✅ Reports (daily sales, pipeline)
- ✅ Global search (leads, clients, cases, applications, partners)
- ✅ Audit log (every CRUD, status change, upload, override)
- ✅ Activity timeline per lead/client/case
- ✅ Admin: Users & Roles, Audit, Integrations, Settings
- ✅ Sandbox bureau pull with consent flag
- ✅ Emergent Object Storage for document uploads
- ✅ Demo data seeded (30 leads, 10 clients, 15 cases, 8+1 employees, 5 CPs, 10 lenders, ~20 applications, 4 sanctions, 3 disbursements, mandates, invoices, payments, incentives, CP commissions, activities)

## Backlog (Phases 2-4 to deepen)
### P0
- CAM-Lite full form UI (Green/Amber/Red flags, positives/concerns/analyst comments) — API exists
- Structured PD form UI per template (business/individual) — API exists, needs richer UI
- Excel/CSV lead import wizard with column mapping
### P1
- Real bureau API connectors (CIBIL/Experian/CRIF/Equifax) via Settings
- eSign integration adapter with signed mandate PDF generation
- Payment gateway link generation
- Rules/automation engine (Hot lead SLA, doc-100% → Credit review task, sanction → notify)
- CorpZo advisory service opportunity generator on document deficiency
- Notifications centre + email/WhatsApp/SMS adapters
### P2
- Channel Partner portal (read-only view for CPs)
- Client borrower lifecycle reminders (renewal 30/60/90/180)
- Document expiry alerts
- Configurable incentive-rule engine UI

## User personas
- Super Admin / Business Head — full pipeline + finance + team overview
- Sales Manager — team performance, allocation, escalations
- Sales Agent — my leads, hot pipeline, tasks, target/incentive
- Credit Head / Analyst — cases awaiting review, docs, bureau, flags
- Documentation — doc room, deficiency
- Finance — mandates, invoices, collections, incentive/CP payouts
- Compliance / Audit — full audit log
- Channel Manager — partner performance, commissions
- Channel Partner — restricted portal (future)

## Iteration 2 (Feb 2026) — Extensions
### New capabilities
- **CAM Full Form**: Complete Credit Assessment inside every case (Overview, Financials, Banking, Ratios, Positives/Concerns, Green/Amber/Red flags with add/remove, Indicative eligibility, Recommendation, Analyst Comments) — `/api/cases/{uid}/assessment`.
- **Excel/Sheets Lead Import**: 4-step wizard (paste → map → preview → import) with auto column heuristics and dedupe against existing leads and clients by mobile / email / PAN / GSTIN / company — `/api/leads/import`.
- **Renewal Radar** `/renewals`: every fully-disbursed case bucketed by 30/60/90/180 days to maturity with RM ownership, so refinance/top-up leads never slip.
- **Auto Follow-up Rules**: `.emergent/crons.yml` schedules `/api/cron/hot-leads` every 15 min. Hot leads silent for 24h → notification for owner + manager, urgent task (`origin=auto_followup`) auto-created, lead moved to `escalated`.
- **Super Admin Invite Users**: `/api/users/invite` (super_admin only). Admin Users screen has an Invite dialog that auto-creates the user + Employee UID, with a partner picker when role=channel_partner.
- **Fence & Guardrail (RBAC row-level)**: `scope_query(user, entity)` in `server.py` filters `/leads`, `/clients`, `/cases`, `/tasks`:
  - super_admin/business_head/finance/compliance/operations → unrestricted
  - sales_manager/channel_manager → own team (self + direct reports)
  - sales_agent → own records
  - credit_analyst → cases where credit_owner=self
  - channel_partner → only records with matching channel_partner_uid; case objects are sanitised of `credit_owner`, `expected_revenue`, `actual_revenue`.
- **Partner Portal** `/partner/*`: automatically served when `user.role=channel_partner`. Dedicated sidebar with Dashboard (KPIs), My Referrals (case status only), My Commissions. Partner cannot access super-admin routes (invite returns 403 verified).

### Notification Centre (P1 groundwork)
- `/api/notifications` list + `/api/notifications/{id}/read` — populated by hot-lead cron.

### Files added / modified in iter2
- `backend`: `scope_query`, `require_user` returns user, `/users/invite`, `/leads/import`, `/renewals`, `/cron/hot-leads`, `/notifications`, `WEBHOOK_CRON_SECRET`.
- `frontend/pages`: `CAM.jsx`, `Renewals.jsx`, `LeadImport.jsx`, `PartnerPortal.jsx`.
- `frontend/components/layout/PartnerSidebar.jsx`.
- `frontend/App.js`: partner-role early routing, /leads/import + /renewals routes.
- `.emergent/crons.yml`: hot-leads-24h @ */15 * * * *.

## Still on the backlog (P1/P2)
- Real Bureau connectors (CIBIL/Experian/CRIF/Equifax) via Settings
- eSign integration & signed mandate PDF generation
- Payment gateway link generation
- Email/WhatsApp/SMS delivery adapters (notifications currently in-app only)
- CorpZo advisory service opportunity generator on document deficiency
- Configurable incentive/CP-commission rule engine UI
- Manager escalation SLA rules (extension of hot-lead cron)
- CP portal document exchange
