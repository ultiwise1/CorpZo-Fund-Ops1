"""Seed realistic Indian lending demo data on first startup."""
import os
import random
import logging
from datetime import datetime, timezone, timedelta
from uids import gen_uid

log = logging.getLogger("seed")

OWNER_EMAIL = os.environ.get("OWNER_EMAIL", "corpzoindia@gmail.com")


async def already_seeded(db) -> bool:
    doc = await db.system_state.find_one({"_id": "seed"}, {"_id": 0})
    return bool(doc and doc.get("done"))


async def mark_seeded(db):
    await db.system_state.update_one({"_id": "seed"}, {"$set": {"done": True, "at": datetime.now(timezone.utc).isoformat()}}, upsert=True)


def _now():
    return datetime.now(timezone.utc)


def _iso(dt):
    return dt.isoformat()


async def seed_demo(db):
    if await already_seeded(db):
        log.info("Demo data already seeded, skipping")
        return

    log.info("Seeding CorpZo demo data …")
    now = _now()

    # ---------------- Employees (with linked users) ----------------
    employees = [
        {"email": OWNER_EMAIL, "name": "CorpZo Owner", "role": "super_admin", "days": 400, "ctc": 500000},
        {"email": "rohan.mehta@corpzo.example", "name": "Rohan Mehta", "role": "business_head", "days": 350, "ctc": 350000},
        {"email": "priya.iyer@corpzo.example", "name": "Priya Iyer", "role": "sales_manager", "days": 220, "ctc": 180000},
        {"email": "aditya.rao@corpzo.example", "name": "Aditya Rao", "role": "sales_agent", "days": 150, "ctc": 90000},
        {"email": "neha.gupta@corpzo.example", "name": "Neha Gupta", "role": "sales_agent", "days": 40, "ctc": 75000},
        {"email": "vikram.singh@corpzo.example", "name": "Vikram Singh", "role": "credit_head", "days": 500, "ctc": 220000},
        {"email": "ananya.das@corpzo.example", "name": "Ananya Das", "role": "credit_analyst", "days": 180, "ctc": 120000},
        {"email": "rakesh.kumar@corpzo.example", "name": "Rakesh Kumar", "role": "documentation", "days": 300, "ctc": 80000},
        {"email": "sonia.patel@corpzo.example", "name": "Sonia Patel", "role": "finance", "days": 400, "ctc": 130000},
    ]

    emp_docs = []
    manager_uid = None
    for i, e in enumerate(employees):
        emp_uid = await gen_uid(db, "employee")
        user_id = f"user_seed_{i:03d}"
        joining_date = _iso(now - timedelta(days=e["days"]))
        multiplier = 2.0 if e["days"] < 90 else 3.0
        revenue_target = e["ctc"] * multiplier
        emp_doc = {
            "employee_uid": emp_uid,
            "user_id": user_id,
            "email": e["email"],
            "name": e["name"],
            "role": e["role"],
            "manager_uid": manager_uid if e["role"] not in ("super_admin", "business_head") else None,
            "joining_date": joining_date,
            "ctc_monthly": e["ctc"],
            "target_multiplier": multiplier,
            "revenue_target": revenue_target,
            "disbursement_target": revenue_target * 40,
            "login_target": 20,
            "sanction_target": 6,
            "active": True,
            "created_at": _iso(now),
        }
        emp_docs.append(emp_doc)
        if e["role"] == "sales_manager":
            manager_uid = emp_uid

        await db.users.update_one(
            {"email": e["email"]},
            {"$set": {
                "user_id": user_id,
                "email": e["email"],
                "name": e["name"],
                "role": e["role"],
                "employee_uid": emp_uid,
                "active": True,
                "picture": "",
                "created_at": _iso(now),
            }},
            upsert=True,
        )
    if emp_docs:
        await db.employees.insert_many(emp_docs)

    sales_agents = [e for e in emp_docs if e["role"] == "sales_agent"]

    # ---------------- Channel Partners ----------------
    cp_docs = []
    cp_data = [
        ("Rahul Sharma Associates", "Delhi", "DEL"),
        ("Mumbai Finmart", "Mumbai", "MUM"),
        ("Chennai Credit Bridge", "Chennai", "CHE"),
        ("Bangalore Loan Point", "Bangalore", "BLR"),
        ("Ahmedabad Advisory", "Ahmedabad", "AMD"),
    ]
    for name, city, code in cp_data:
        p_uid = await gen_uid(db, "channel_partner")
        cp_docs.append({
            "partner_uid": p_uid,
            "channel_code": f"CP-{code}-{p_uid.split('-')[-1]}",
            "name": name,
            "entity_name": name + " Pvt Ltd",
            "pan": "AAAPP" + str(random.randint(1000, 9999)) + "Z",
            "gst": f"{random.randint(10, 36):02d}AAAPP{random.randint(1000, 9999)}Z1Z5",
            "kyc_status": "verified",
            "bank_account": {"acc_no": str(random.randint(10 ** 9, 10 ** 11)), "ifsc": "HDFC0001234"},
            "agreement_signed": True,
            "products": ["business_loan", "lap", "term_loan"],
            "geography": [city],
            "channel_manager_uid": manager_uid,
            "commission_structure": {"default_pct": 1.0, "min_pct": 0.5, "max_pct": 2.0},
            "status": "active",
            "mobile": f"9{random.randint(100000000, 999999999)}",
            "email": f"contact@{name.lower().replace(' ', '')}.example",
            "city": city, "state": city,
            "created_at": _iso(now),
        })
    await db.channel_partners.insert_many(cp_docs)

    # ---------------- Lenders ----------------
    lender_defs = [
        ("HDFC Bank", "bank", 30_00_000, 100_00_00_000, 8.5, 12.0),
        ("ICICI Bank", "bank", 25_00_000, 80_00_00_000, 8.75, 12.5),
        ("Axis Bank", "bank", 20_00_000, 60_00_00_000, 9.0, 13.0),
        ("Kotak Mahindra Bank", "bank", 15_00_000, 50_00_00_000, 9.25, 13.5),
        ("Bajaj Finserv", "nbfc", 10_00_000, 25_00_00_000, 11.0, 18.0),
        ("Tata Capital", "nbfc", 10_00_000, 30_00_00_000, 10.5, 17.0),
        ("Aditya Birla Finance", "nbfc", 15_00_000, 40_00_00_000, 10.75, 16.5),
        ("Piramal Finance", "nbfc", 25_00_000, 100_00_00_000, 11.5, 17.5),
        ("IndusInd Bank", "bank", 25_00_000, 70_00_00_000, 9.25, 13.25),
        ("Yes Bank", "bank", 20_00_000, 50_00_00_000, 9.5, 13.75),
    ]
    lender_docs = []
    for name, ltype, tmin, tmax, rmin, rmax in lender_defs:
        lender_docs.append({
            "lender_id": f"lender_{name.replace(' ', '').lower()}",
            "name": name, "lender_type": ltype,
            "products": ["business_loan", "term_loan", "lap", "working_capital", "cc_od"],
            "ticket_size_min": tmin, "ticket_size_max": tmax,
            "geography": ["Pan India"],
            "industries": ["manufacturing", "trading", "services", "it"],
            "min_turnover": 1_00_00_000, "min_vintage_years": 3, "min_bureau_score": 700,
            "foir": 55, "ltv": 65,
            "roi_min": rmin, "roi_max": rmax,
            "tenure_min": 12, "tenure_max": 180,
            "collateral_required": ltype == "bank",
            "excluded_sectors": ["real_estate_speculative", "crypto"],
            "tat_days": 12 if ltype == "bank" else 8,
            "rm_name": f"RM {name}", "rm_mobile": f"9{random.randint(100000000, 999999999)}",
            "rm_email": f"rm@{name.split()[0].lower()}.example",
            "notes": "", "active": True, "created_at": _iso(now),
        })
    await db.lenders.insert_many(lender_docs)

    # ---------------- Leads (30) ----------------
    first_names = ["Arjun", "Kavya", "Rohit", "Sneha", "Amit", "Deepa", "Manish", "Kritika", "Suresh", "Pooja"]
    last_names = ["Sharma", "Verma", "Kapoor", "Nair", "Reddy", "Mehta", "Joshi", "Bansal", "Chopra", "Malhotra"]
    company_types = ["Traders", "Industries", "Enterprises", "Solutions", "Ventures", "Exports"]
    cities = [("Delhi", "DL"), ("Mumbai", "MH"), ("Bangalore", "KA"), ("Chennai", "TN"), ("Pune", "MH"), ("Hyderabad", "TS"), ("Ahmedabad", "GJ")]
    products = ["business_loan", "working_capital", "lap", "term_loan", "cc_od", "equipment_finance"]
    sources = ["website", "referral", "google_ads", "meta_ads", "channel_partner", "whatsapp", "manual"]

    lead_docs = []
    for i in range(30):
        fn = random.choice(first_names); ln = random.choice(last_names)
        company = f"{ln} {random.choice(company_types)}"
        city, state = random.choice(cities)
        src = random.choice(sources)
        stage_pool = ["new_lead", "assigned", "contact_attempted", "connected", "qualified", "follow_up", "cold", "not_interested"]
        stage = random.choice(stage_pool)
        cp_uid = None
        if src == "channel_partner":
            cp_uid = random.choice(cp_docs)["partner_uid"]
        lead_uid = await gen_uid(db, "lead")
        assigned = random.choice(sales_agents)["employee_uid"] if sales_agents else None
        lead_docs.append({
            "lead_uid": lead_uid,
            "source": src, "source_detail": "",
            "campaign": "Q1 Push" if src in ("google_ads", "meta_ads") else "",
            "referral": "", "channel_partner_uid": cp_uid,
            "assigned_to": assigned, "original_owner": assigned,
            "borrower_type": "business" if random.random() > 0.3 else "individual",
            "name": f"{fn} {ln}", "company": company,
            "mobile": f"9{random.randint(100000000, 999999999)}",
            "email": f"{fn.lower()}.{ln.lower()}{i}@example.com",
            "city": city, "state": state,
            "product": random.choice(products),
            "approx_requirement": random.choice([25_00_000, 50_00_000, 1_00_00_000, 2_50_00_000, 5_00_00_000]),
            "notes": "", "stage": stage,
            "priority": random.choice(["hot", "warm", "cold"]),
            "probability": random.choice([20, 40, 60, 80]),
            "expected_closure": _iso(now + timedelta(days=random.randint(15, 90))),
            "rejection_reason": None, "client_uid": None, "converted": False, "duplicate_of": None,
            "created_at": _iso(now - timedelta(days=random.randint(0, 45))),
        })
    await db.leads.insert_many(lead_docs)

    # ---------------- Clients (10) — first 10 qualified leads convert ----------------
    client_docs = []
    for i in range(10):
        lead = lead_docs[i]
        cuid = await gen_uid(db, "client")
        client_docs.append({
            "client_uid": cuid, "name": lead["name"], "borrower_type": lead["borrower_type"],
            "company": lead["company"], "pan": f"AAAPP{random.randint(1000, 9999)}Z",
            "cin": f"U74999{lead['state']}{2018 + i}PTC{random.randint(100000, 999999)}",
            "gstin": f"{random.randint(10, 36):02d}AAAPP{random.randint(1000, 9999)}Z1Z5",
            "mobile": lead["mobile"], "email": lead["email"],
            "city": lead["city"], "state": lead["state"],
            "industry": random.choice(["Manufacturing", "Trading", "IT Services", "Retail", "Logistics"]),
            "constitution": random.choice(["Private Limited", "LLP", "Proprietorship", "Partnership"]),
            "incorporation_date": _iso(now - timedelta(days=random.randint(1200, 3600))),
            "relationship_manager": lead["assigned_to"], "channel_partner_uid": lead["channel_partner_uid"],
            "source": lead["source"], "tags": [], "lead_uid": lead["lead_uid"],
            "created_at": _iso(now - timedelta(days=random.randint(0, 30))),
        })
        # Update lead as converted
        await db.leads.update_one({"lead_uid": lead["lead_uid"]}, {"$set": {"converted": True, "client_uid": cuid, "stage": "qualified"}})
    await db.clients.insert_many(client_docs)

    # ---------------- Cases (15) — one client has multiple cases ----------------
    case_docs = []
    for i in range(15):
        client = client_docs[i % 10]
        case_uid = await gen_uid(db, "case")
        stages = ["qualified", "documentation_pending", "documentation_received", "credit_assessment",
                  "mandate_signed", "submitted", "under_credit", "sanctioned", "disbursement_pending",
                  "partially_disbursed", "fully_disbursed"]
        stage = stages[i % len(stages)]
        req = random.choice([50_00_000, 1_00_00_000, 2_00_00_000, 5_00_00_000, 10_00_00_000])
        sanctioned = req if stage in ("sanctioned", "disbursement_pending", "partially_disbursed", "fully_disbursed") else 0
        disbursed = sanctioned if stage == "fully_disbursed" else (sanctioned * 0.5 if stage == "partially_disbursed" else 0)
        case_docs.append({
            "case_uid": case_uid, "client_uid": client["client_uid"],
            "product": random.choice(products), "requirement": req,
            "purpose": random.choice(["Business expansion", "Working capital", "Equipment purchase", "Refinance"]),
            "tenure_months": random.choice([36, 60, 84, 120, 180]),
            "security": "Property (commercial)" if random.random() > 0.5 else "Hypothecation of stock",
            "geography": client["state"], "expected_roi": round(random.uniform(9.0, 14.5), 2),
            "urgency": random.choice(["normal", "high", "urgent"]),
            "sales_owner": client["relationship_manager"],
            "credit_owner": next((e["employee_uid"] for e in emp_docs if e["role"] == "credit_analyst"), None),
            "channel_partner_uid": client["channel_partner_uid"], "source": client["source"],
            "stage": stage,
            "expected_closure": _iso(now + timedelta(days=random.randint(10, 60))),
            "expected_revenue": req * 0.012, "actual_revenue": req * 0.012 if disbursed > 0 else 0,
            "sanctioned_amount": sanctioned, "disbursed_amount": disbursed,
            "lead_uid": client.get("lead_uid"),
            "documentation_pct": {"documentation_pending": 40, "documentation_received": 85,
                                  "credit_assessment": 95, "mandate_signed": 100}.get(stage, 100 if sanctioned else 60),
            "created_at": _iso(now - timedelta(days=random.randint(0, 25))),
        })
    await db.cases.insert_many(case_docs)

    # ---------------- Mandates for sanctioned/disbursed cases ----------------
    mandate_statuses = ["draft", "internal_approval", "sent", "signed", "verified", "active"]
    mandate_docs = []
    for idx, c in enumerate(case_docs):
        if c["stage"] not in ("qualified", "documentation_pending"):
            m_uid = await gen_uid(db, "mandate")
            # Vary statuses so full lifecycle is demonstrable
            m_status = mandate_statuses[idx % len(mandate_statuses)]
            mandate_docs.append({
                "mandate_uid": m_uid, "client_uid": c["client_uid"], "case_uid": c["case_uid"],
                "scope": f"Advisory & Facilitation - {c['product']}",
                "upfront_fee": 25000, "success_fee_pct": 1.0, "min_fee": 50000, "taxes_pct": 18,
                "other_charges": 0, "validity_days": 90, "exclusivity": False,
                "signatory": "Director", "signing_method": "esign",
                "status": m_status, "version": 1,
                "signed_at": _iso(now - timedelta(days=random.randint(5, 30))) if m_status in ("signed","verified","active") else None,
                "document_id": None, "created_by": c["sales_owner"],
                "created_at": _iso(now - timedelta(days=random.randint(10, 40))),
            })
    if mandate_docs:
        await db.mandates.insert_many(mandate_docs)

    # ---------------- Invoices & Payments for cases with mandates ----------------
    inv_docs, pay_docs = [], []
    for m in mandate_docs:
        inv_uid = await gen_uid(db, "invoice")
        amt = m["upfront_fee"]
        gst = 18
        tds = 10
        inv_docs.append({
            "invoice_uid": inv_uid, "client_uid": m["client_uid"], "case_uid": m["case_uid"],
            "mandate_uid": m["mandate_uid"], "amount": amt, "gst_pct": gst, "tds_pct": tds,
            "total_amount": round(amt * (1 + gst / 100) * (1 - tds / 100), 2),
            "status": random.choice(["paid", "part_paid", "pending", "paid", "paid"]),
            "due_date": _iso(now + timedelta(days=15)),
            "created_at": _iso(now - timedelta(days=random.randint(3, 25))),
        })
        if inv_docs[-1]["status"] in ("paid", "part_paid"):
            p_uid = await gen_uid(db, "payment")
            pay_docs.append({
                "payment_uid": p_uid, "invoice_uid": inv_uid, "client_uid": m["client_uid"],
                "amount": amt if inv_docs[-1]["status"] == "paid" else amt / 2,
                "mode": random.choice(["neft", "rtgs", "upi"]),
                "reference": f"TXN{random.randint(10 ** 9, 10 ** 12)}",
                "received_on": _iso(now - timedelta(days=random.randint(1, 20))),
                "remarks": "", "created_at": _iso(now),
            })
    if inv_docs:
        await db.invoices.insert_many(inv_docs)
    if pay_docs:
        await db.payments.insert_many(pay_docs)

    # ---------------- Lender Applications (multi-lender for some cases) ----------------
    app_docs, sanction_docs, disb_docs, cp_comm_docs, incentive_docs = [], [], [], [], []
    for c in case_docs:
        if c["stage"] in ("qualified", "documentation_pending"):
            continue
        num_apps = random.randint(1, 3)
        chosen_lenders = random.sample(lender_docs, k=num_apps)
        for idx, lender in enumerate(chosen_lenders):
            a_uid = await gen_uid(db, "application")
            if c["stage"] in ("fully_disbursed", "partially_disbursed", "disbursement_pending"):
                a_status = "sanctioned" if idx == 0 else random.choice(["rejected", "withdrawn"])
            elif c["stage"] == "sanctioned":
                a_status = "sanctioned" if idx == 0 else random.choice(["under_credit", "rejected"])
            else:
                a_status = random.choice(["submitted", "under_credit", "query_raised"])
            app_docs.append({
                "application_uid": a_uid, "case_uid": c["case_uid"], "client_uid": c["client_uid"],
                "lender_id": lender["lender_id"],
                "submission_date": _iso(now - timedelta(days=random.randint(3, 30))),
                "lender_rm": lender["rm_name"], "lender_login_no": f"APP{random.randint(10 ** 8, 10 ** 10)}",
                "amount_requested": c["requirement"], "product": c["product"], "status": a_status,
                "sanction_amount": c["sanctioned_amount"] if a_status == "sanctioned" else 0,
                "roi": lender["roi_min"] if a_status == "sanctioned" else 0,
                "tenure_months": c["tenure_months"] if a_status == "sanctioned" else 0,
                "fees": c["sanctioned_amount"] * 0.01 if a_status == "sanctioned" else 0,
                "security": c["security"], "conditions": "", "rejection_reason": "" if a_status != "rejected" else "FOIR out of policy",
                "documents_shared": [], "created_by": c["sales_owner"],
                "created_at": _iso(now - timedelta(days=random.randint(3, 30))),
            })

            # Sanction
            if a_status == "sanctioned":
                s_uid = await gen_uid(db, "sanction")
                sanction_docs.append({
                    "sanction_uid": s_uid, "application_uid": a_uid, "case_uid": c["case_uid"],
                    "lender_id": lender["lender_id"], "sanction_amount": c["sanctioned_amount"],
                    "sanction_date": _iso(now - timedelta(days=random.randint(1, 15))),
                    "roi": lender["roi_min"], "benchmark": "REPO", "spread": 2.5,
                    "tenure_months": c["tenure_months"], "emi": round(c["sanctioned_amount"] * 0.0125, 0),
                    "moratorium_months": 3, "security": c["security"], "ltv": 65,
                    "processing_fee_pct": 1.0, "insurance_amount": 25000,
                    "conditions_precedent": "KYC verified; Property valuation received",
                    "conditions_subsequent": "PDCs; NACH mandate",
                    "validity_days": 30, "document_id": None,
                    "status": "ready_for_disbursement" if c["disbursed_amount"] > 0 else "accepted",
                    "created_at": _iso(now - timedelta(days=random.randint(1, 15))),
                })

                # Disbursement
                if c["disbursed_amount"] > 0:
                    tranches = 2 if c["stage"] == "partially_disbursed" else 1
                    for t in range(1, tranches + 1):
                        d_uid = await gen_uid(db, "disbursement")
                        d_amt = c["disbursed_amount"] if tranches == 1 else c["disbursed_amount"]
                        disb_docs.append({
                            "disbursement_uid": d_uid, "case_uid": c["case_uid"],
                            "sanction_uid": s_uid, "lender_id": lender["lender_id"],
                            "amount": d_amt,
                            "requested_date": _iso(now - timedelta(days=random.randint(1, 10))),
                            "disbursement_date": _iso(now - timedelta(days=random.randint(0, 8))),
                            "reference": f"UTR{random.randint(10 ** 11, 10 ** 13)}",
                            "destination": "Borrower Account HDFC ****5678",
                            "status": "completed", "notes": "",
                            "proof_document_id": None, "tranche_no": t,
                            "created_at": _iso(now),
                        })
                        # Employee incentive
                        agent = next((e for e in emp_docs if e["employee_uid"] == c["sales_owner"]), None)
                        if agent:
                            incentive_docs.append({
                                "incentive_id": f"inc_{a_uid[-6:]}_{t}",
                                "employee_uid": agent["employee_uid"],
                                "period": now.strftime("%Y-%m"),
                                "disbursement_amount": d_amt,
                                "revenue_collected": d_amt * 0.01,
                                "calculated_amount": d_amt * 0.001,
                                "override_amount": None, "override_reason": None,
                                "status": random.choice(["accrued", "manager_approved", "paid"]),
                                "approved_by": manager_uid, "paid_on": None,
                                "created_at": _iso(now),
                            })
                        # CP commission
                        if c["channel_partner_uid"]:
                            cp_comm_docs.append({
                                "commission_id": f"cpc_{d_uid[-6:]}",
                                "partner_uid": c["channel_partner_uid"],
                                "case_uid": c["case_uid"],
                                "disbursement_uid": d_uid,
                                "disbursement_amount": d_amt,
                                "commission_pct": 1.0,
                                "commission_amount": d_amt * 0.01,
                                "tds_amount": d_amt * 0.001,
                                "payable_amount": d_amt * 0.009,
                                "status": random.choice(["accrued", "approved", "paid"]),
                                "paid_on": None, "created_at": _iso(now),
                            })
    if app_docs:
        await db.applications.insert_many(app_docs)
    if sanction_docs:
        await db.sanctions.insert_many(sanction_docs)
    if disb_docs:
        await db.disbursements.insert_many(disb_docs)
    if cp_comm_docs:
        await db.cp_commissions.insert_many(cp_comm_docs)
    if incentive_docs:
        await db.incentives.insert_many(incentive_docs)

    # ---------------- PDs ----------------
    pd_docs = []
    for c in case_docs[:10]:
        pd_docs.append({
            "pd_id": f"pd_{c['case_uid'][-6:]}",
            "case_uid": c["case_uid"], "client_uid": c["client_uid"],
            "template": "business" if random.random() > 0.3 else "individual",
            "data": {
                "turnover": random.choice([5_00_00_000, 10_00_00_000, 25_00_00_000]),
                "ebitda_pct": round(random.uniform(8, 18), 1),
                "pat_pct": round(random.uniform(4, 11), 1),
                "net_worth": random.choice([2_00_00_000, 5_00_00_000, 12_00_00_000]),
                "existing_debt": random.choice([50_00_000, 1_00_00_000, 3_00_00_000]),
                "banking_avg_balance": random.choice([25_00_000, 75_00_000, 1_50_00_000]),
                "vintage_years": random.randint(4, 15),
            },
            "version": 1, "conducted_by": c["sales_owner"],
            "conducted_on": _iso(now - timedelta(days=random.randint(5, 30))),
            "created_at": _iso(now),
        })
    if pd_docs:
        await db.pds.insert_many(pd_docs)

    # ---------------- Tasks (overdue + upcoming) ----------------
    task_docs = []
    for i, c in enumerate(case_docs[:8]):
        t_uid = await gen_uid(db, "task")
        overdue = i % 2 == 0
        task_docs.append({
            "task_id": t_uid,
            "title": random.choice(["Follow-up call", "Collect bank statement", "Send sanction to client", "Query response due"]),
            "description": "",
            "owner_uid": c["sales_owner"], "created_by": c["sales_owner"],
            "case_uid": c["case_uid"], "client_uid": c["client_uid"],
            "lead_uid": None, "application_uid": None,
            "priority": random.choice(["normal", "high", "urgent"]),
            "due_date": _iso(now + timedelta(days=-2 if overdue else random.randint(1, 5))),
            "status": "open" if overdue else random.choice(["open", "in_progress"]),
            "origin": "follow_up",
            "created_at": _iso(now - timedelta(days=random.randint(1, 10))),
        })
    if task_docs:
        await db.tasks.insert_many(task_docs)

    # ---------------- Activities ----------------
    activity_docs = []
    for c in case_docs:
        for k in range(random.randint(2, 5)):
            activity_docs.append({
                "activity_id": f"act_{c['case_uid'][-6:]}_{k}",
                "entity_type": "case", "entity_id": c["case_uid"],
                "kind": random.choice(["call_out", "note", "status_change", "whatsapp"]),
                "author_uid": c["sales_owner"] or "system",
                "author_name": next((e["name"] for e in emp_docs if e["employee_uid"] == c["sales_owner"]), "System"),
                "summary": random.choice([
                    "Outbound call — client interested",
                    "Documents partially received",
                    "Escalated to credit head",
                    "Shared updated CAM with lender",
                    "Lender query responded",
                ]),
                "details": {}, "duration_sec": random.choice([120, 240, 360, 480]),
                "outcome": random.choice(["connected", "interested", "callback"]),
                "next_followup": _iso(now + timedelta(days=random.randint(1, 5))),
                "created_at": _iso(now - timedelta(days=random.randint(0, 20), hours=random.randint(0, 12))),
            })
    if activity_docs:
        await db.activities.insert_many(activity_docs)

    await mark_seeded(db)
    log.info("Demo data seed complete")


async def seed_supplemental(db):
    """Idempotently add data that early seeds may have missed: documents, lender queries."""
    now = _now()

    # Backfill documents if none exist
    if await db.documents.count_documents({}) == 0:
        cases = await db.cases.find({"stage": {"$nin": ["qualified", "new_lead"]}}, {"_id": 0}).limit(8).to_list(8)
        cats = ["KYC", "Corporate", "Financial", "Banking", "GST/Tax"]
        docs = []
        for c in cases:
            for i, cat in enumerate(cats):
                doc_id = f"doc_seed_{c['case_uid'][-6:]}_{i}"
                docs.append({
                    "document_id": doc_id,
                    "client_uid": c["client_uid"], "case_uid": c["case_uid"],
                    "category": cat, "doc_type": f"{cat} document",
                    "financial_period": "FY24-25" if cat == "Financial" else None,
                    "version": 1, "storage_path": None,
                    "original_filename": f"{cat.replace('/', '_')}_{c['case_uid']}.pdf",
                    "content_type": "application/pdf", "size": 245000,
                    "uploaded_by": "system", "uploaded_at": _iso(now - timedelta(days=random.randint(2, 20))),
                    "status": random.choice(["valid", "received", "under_review"]),
                    "verified_by": None, "verified_at": None, "expiry_date": None,
                    "tags": [], "notes": "Seed sample — not stored in object storage.",
                    "superseded_by": None,
                })
            # update completeness
            pct = min(100, int(round(len(cats) * 100 / 12)))
            await db.cases.update_one({"case_uid": c["case_uid"]}, {"$set": {"documentation_pct": max(pct, 40)}})
        if docs:
            await db.documents.insert_many(docs)
            log.info(f"Seeded {len(docs)} sample documents")

    # Backfill lender queries if none exist
    if await db.lender_queries.count_documents({}) == 0:
        apps = await db.applications.find({"status": {"$in": ["under_credit", "query_raised", "submitted"]}}, {"_id": 0}).limit(6).to_list(6)
        queries = []
        query_texts = [
            "Please share last 12 months bank statement",
            "GST 3B and 2A returns for FY24-25 needed",
            "Directors' PAN + Aadhaar copies pending",
            "Property valuation report required",
            "Clarify related-party transactions in FY23",
            "MSME certificate copy needed for benefit rates",
        ]
        for i, a in enumerate(apps):
            queries.append({
                "query_id": f"q_seed_{a['application_uid'][-6:]}",
                "application_uid": a["application_uid"], "case_uid": a["case_uid"],
                "query_text": query_texts[i % len(query_texts)],
                "raised_by": "lender", "assigned_to": None,
                "required_document": None,
                "due_date": _iso(now + timedelta(days=random.randint(-2, 5))),
                "response": None, "attachment_id": None,
                "status": random.choice(["open", "awaiting_client", "responded"]),
                "created_at": _iso(now - timedelta(days=random.randint(1, 7))),
            })
        if queries:
            await db.lender_queries.insert_many(queries)
            log.info(f"Seeded {len(queries)} lender queries")

    # Ensure at least a handful of partners have current-month activity so the
    # Partner CRM v2 dashboard doesn't read as empty on a fresh env.
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    partner_cases = await db.cases.find(
        {"channel_partner_uid": {"$ne": None}, "sanctioned_amount": {"$gt": 0}},
        {"_id": 0}
    ).to_list(20)
    partner_case_uids = [c["case_uid"] for c in partner_cases]
    # Count MTD partner-linked disbursements (not any disbursement).
    partner_mtd = await db.disbursements.count_documents({
        "case_uid": {"$in": partner_case_uids},
        "disbursement_date": {"$gte": _iso(month_start)},
    }) if partner_case_uids else 0

    if partner_mtd < 3 and partner_cases:
        random.shuffle(partner_cases)
        seeded = 0
        month_targets = {}
        for c in partner_cases:
            pu = c["channel_partner_uid"]
            if pu in month_targets:
                continue
            month_targets[pu] = True
            amt = float(min(c.get("sanctioned_amount") or 0, c.get("requirement") or 0) or 5_000_000)
            # a comfortable target: 3-6x this month's disbursement
            monthly_target = round(amt * random.choice([3, 4, 5, 6]), -5)
            # Backfill target if missing / zero
            await db.channel_partners.update_one(
                {"partner_uid": pu, "$or": [
                    {"monthly_target": {"$exists": False}},
                    {"monthly_target": 0},
                    {"monthly_target": None},
                ]},
                {"$set": {"monthly_target": monthly_target}},
            )
            # Idempotency guard: skip if we already inserted a seed_mtd disbursement for this partner
            already = await db.disbursements.count_documents(
                {"case_uid": c["case_uid"], "notes": "seed_mtd"}
            )
            if already > 0:
                continue

            d_uid = f"DB-MTD-{c['case_uid'][-4:]}"
            disb_amt = round(amt * random.uniform(0.2, 0.5), -3)
            disb_date = _iso(month_start + timedelta(days=random.randint(1, min(10, now.day))))
            await db.disbursements.insert_one({
                "disbursement_uid": d_uid,
                "sanction_uid": f"SN-SEED-{c['case_uid'][-4:]}",
                "case_uid": c["case_uid"],
                "lender_uid": c.get("preferred_lender") or "L-HDFC",
                "amount": disb_amt,
                "disbursement_date": disb_date,
                "utr_number": f"UTR{random.randint(10**11, 10**12 - 1)}",
                "tranche_no": 1,
                "notes": "seed_mtd",
                "created_at": disb_date,
            })
            await db.cp_commissions.insert_one({
                "commission_id": f"cpc_mtd_{c['case_uid'][-6:]}",
                "partner_uid": pu, "case_uid": c["case_uid"],
                "disbursement_uid": d_uid, "disbursement_amount": disb_amt,
                "commission_pct": 1.0, "commission_amount": disb_amt * 0.01,
                "tds_amount": disb_amt * 0.001, "payable_amount": disb_amt * 0.009,
                "status": "accrued", "paid_on": None,
                "created_at": disb_date,
            })
            seeded += 1
            if seeded >= 3:
                break
        if seeded:
            log.info(f"Seeded {seeded} current-month partner disbursements + commissions")
