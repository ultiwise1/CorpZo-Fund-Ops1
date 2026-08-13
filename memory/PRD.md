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


## Iteration 3 (Feb 2026) — Public marketing + brand refresh
- **Brand palette refreshed** to venturaz-inspired deep-forest-green + gold: `#0F3D2E` foreground, `#1F5B4A` brand green, `#FFD84D` gold accent, `#16A981` vibrant CTA. Typography swapped to Encode Sans across the app; index.css design tokens updated.
- **Vibrant urbanmoney-style landing page** at `/` with: big hero banner (dark-green gradient, concentric-circle motif, product picker chips), colour-tinted product tile grid (per-slug icon + tint), 3-step "How it works" timeline, standalone EMI Calculator strip with gold sliders, 10-lender logo wall, dark "Why CorpZo" band with coloured icon tiles, testimonials with 4.8/5 rating badge, FAQ accordion, and a green→gold gradient final CTA.
- **PublicLayout** header/footer restyled with brand green + gold links; sticky-nav with new logo lockup.
- **Customer dashboard + apply + product detail** re-themed to the new palette (backgrounds `#FAFAF7`, borders `#0F3D2E/10`, CTAs `#1F5B4A`).
- **Internal CRM sidebar** dark-green shell with gold accent left-border on active items; pill classes updated.

## Iteration 4 (Feb 2026) — Illustrations, Global Search, Live Rates
- **Custom product illustrations** — new `ProductArt.jsx` renders a unique on-brand SVG scene per debt product (house, growth chart, building+lock, coin cycle, candlestick, factory, crane, rocket-style, etc.) with per-slug tint + accent colour. Wired into LandingPage grid, ProductsPage catalogue and ProductDetail hero.
- **Global CRM search 2.0** — `/api/search` now covers Leads, Clients, Cases, Applications, **Sanctions, Disbursements, Invoices, Tasks** and Partners. Backend added regex escaping (safe PAN/GSTIN chars) and reverse-lookup of cases via matched clients (PAN/GSTIN/name). Frontend TopBar restyled to the venturaz palette with grouped results, colored group dots, ↑↓ / Enter keyboard navigation, `⌘K` / `Ctrl+K` shortcut, and a helpful empty-state.
- **Live rates on hero chips** — landing-page product chips now display `rate_from` in a gold pill next to the product name, so visitors see the freshest rate without clicking.



## Iteration 5 (Feb 2026) — Doc-Deficiency Opportunities + Weekly Report Export
- **Advisory Opportunity engine** — new `opportunities` collection + `OPP-YYYY-######` UID. `/api/cases/{uid}/doc-deficiency` compares the case's uploaded document categories against the required set (KYC, Corporate, Financial, Banking, GST/Tax, Existing Loans, Security/Collateral, Legal) and returns each missing category mapped to a billable CorpZo service with an indicative fee and SLA. `POST /api/cases/{uid}/opportunities` converts a missing category into a booked opportunity (with dedupe guard, activity log, audit trail, and owner email/in-app notification). `GET /api/opportunities?status=` and `PATCH /api/opportunities/{uid}` support the pipeline board.
- **Case detail — deficiency strip**: Documents tab now shows a doc completeness meter (X/8), each missing category rendered as a tile with service name + est. fee + SLA, and a "Bill it" button that creates the advisory opportunity.
- **Opportunities board** `/opportunities`: sidebar entry (Performance → Opportunities), KPI cards (open / converted / total pipeline value), filterable table, inline dialog to change status (Open → Contacted → Converted → Dropped), edit fee and notes.
- **Weekly report exports**: `GET /api/reports/weekly.xlsx` (openpyxl — 5 sheets: Summary, Pipeline, Sanctions, Disbursements, Revenue) and `GET /api/reports/weekly.pdf` (reportlab — branded A4 with executive summary + pipeline + sanctions tables). Reports page adds "Weekly Excel" + "Weekly PDF" buttons and a live-opportunity banner linking to the board.


## Iteration 6 (Feb 2026) — Urban Money brand pass + Advisory Auto-Assign
- **Brand refresh (CorpZo shapes + Urban Money cues, keeping venturaz palette)**: landing hero now layers the venturaz concentric-circle motif with an Urban-Money-inspired dot-grid overlay, a floating ₹-coin shower motif, and a signature "Hello, borrower! 👋" chat bubble on lime-chartreuse. Added a new lime accent `#C6FF3B` (design token `--brand-lime`) that plays alongside gold. "How it works" is now a premium dark section with connector line, colored icon chips, and huge translucent step numbers. New helpers `.bg-dot-grid` and float keyframe animation in `index.css`.
- **Opportunity auto-assign to advisory desk**: new `db.settings.advisory_desk` document + `GET/PUT /api/settings/advisory-desk` (super_admin / business_head only). `create_opportunity` now assigns to the configured advisory-desk owner and falls back to case sales owner if unset. Admin Settings page rebuilt with brand palette and a dedicated card to pick the advisory desk owner from the Employees master. Verified E2E via curl — setting `EMP-0009` routes the next opportunity to `EMP-0009`.

## Iteration 7 (Feb 2026) — Login Fix + Glass/Liquid/Neon + Product Hero
- **BUG FIX — CRM login was dead**: `PublicLayout` footer had "Internal CRM →" pointing to `/dashboard` and "Channel Partner Portal →" pointing to `/partner/dashboard`. When unauthenticated, App.js catch-all bounced these paths back to the landing page. Both links now route to `/login`. Added first-class **"CRM login"** text link in the public header (visible on all breakpoints) next to the Sign-in button and a "Back to corpzo.com" affordance on the login page. `data-testid`s: `footer-crm-login`, `footer-partner-login`, `crm-login-link`. **Testing agent verified — 5/5 flows, 100% pass**.
- **Login page fully rebuilt**: dark forest-green canvas with two animated liquid-morph blobs (lime + cyan), dot-grid overlay, glass-dark sign-in card, neon-lime "The operating system for CorpZo's debt business." headline, three glass feature chips, white→lime hover-glow on the Google button.
- **Glass morphism + liquid morphism**: new CSS utilities — `.glass`, `.glass-strong`, `.glass-dark`, `.glass-light`, `.liquid-blob`, `.liquid-blob-2`, `.liquid-blob-3` with `morph`/`morph2` keyframe loops. Landing hero uses three morphing blobs (lime → cyan → gold-emerald) + a glass-strong translucent panel behind the quick-apply card.
- **Neon accents**: `.neon-lime`, `.neon-cyan`, `.neon-gold`, `.neon-glow`, `.neon-glow-hover`, `.neon-ring`. Applied to the "40+ lenders." headline word, "Zero cost until sanction" pill, hero "Explore all products" CTA (lime glow), and Login page headline.
- **Product hero illustrations**: new `ProductHero.jsx` renders a full-width illustrated banner per product with a borrower character (family / individual / engineer / business person) placed in-scene alongside the product motif — plus concentric rings, floating ₹ coins, a liquid-morph accent blob, and a glass-light caption card. Wired into `ProductDetail.jsx` for all 15 products.



## Iteration 8 (Feb 2026) — Navy/Coral/Gold theme + Mobile Hamburger + Lender Wall
- **Theme pivot** — User rejected the deep-forest-green public palette. Swapped hero + CTAs + accent surfaces to **Deep Navy `#081733` → `#0B1F3A` → `#1B3A6B`** with **Coral `#FF6B4E`** and **Gold `#FFD84D`** accents. Landing hero, EMI calculator strip, Why CorpZo band, Final CTA, PublicLayout header/footer, and product tiles refreshed. Mobile-hero liquid blobs toned down (opacity + size clamped below `md`) so the navy reads correctly on phones.
- **Mobile hamburger menu** for the public site (`PublicLayout.jsx`) — new `[data-testid=mobile-menu-toggle]` opens `[data-testid=mobile-menu]` slide-down with Products, EMI Calculator, Apply, Partners, **CRM login (`mobile-crm-login`)** and Sign in / Sign up. Body scroll locked while open, auto-closes on link click. Fixes P1 bug where CRM login was hidden on mobile.
- **Massive lender wall** (`LandingPage.jsx` — `[data-testid=lender-wall]`) — 60 named lender tiles across scheduled banks, PSU banks, foreign banks, NBFCs, HFCs, small-finance banks and private-credit funds, arranged in a dense 3/4/6/8-col responsive grid with hover lift, "120+ Lender Partners" gold badge, "₹2,500 Cr+ disbursed" coral badge, and "+60 more partners onboarding this quarter" footer chip.
- **`inr()` fix** — `lib/format.js` now uses `maximumFractionDigits: 0` in the sub-₹1L branch so Monthly EMI reads `₹21,494` not `₹21,494.57`.
- **Testing** — `iteration_4.json`: 12/12 requested public+regression flows PASS (hero theme, product grid, lender wall (60 tiles), EMI reactivity, FAQ, hamburger → mobile CRM login → /login route, hero quick-apply creates LD-2026-000056 with `source=website`, weekly.xlsx + weekly.pdf both 200, global search, opportunities API).
