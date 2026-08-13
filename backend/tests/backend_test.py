"""CorpZo Debt CRM — backend API regression tests.

Covers: auth, dashboard, leads (CRUD + convert), clients, cases, bureau (sandbox),
documents upload, lenders/applications, sanctions, disbursements, mandates,
invoices/payments, employees/incentives/CP/tasks, reports, audit, search, integrations.
Auth: pre-seeded session token via Authorization: Bearer test_session_supertoken.
"""
import io

import pytest

BASE = None


@pytest.fixture(autouse=True)
def _set_base(base_url):
    global BASE
    BASE = base_url


state = {}


# ---------------- AUTH ----------------
class TestAuth:
    def test_me_requires_auth(self, anon):
        r = anon.get(f"{BASE}/api/auth/me")
        assert r.status_code == 401, r.text

    def test_me_with_token(self, client):
        r = client.get(f"{BASE}/api/auth/me")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["email"] == "corpzoindia@gmail.com"
        assert d["role"] == "super_admin"
        assert "_id" not in d

    def test_bad_token_rejected(self, anon):
        r = anon.get(f"{BASE}/api/auth/me", headers={"Authorization": "Bearer nope"})
        assert r.status_code == 401


# ---------------- DASHBOARD ----------------
class TestDashboard:
    def test_summary(self, client):
        r = client.get(f"{BASE}/api/dashboard/summary")
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("kpis", "funnel", "top_lenders", "invoices_summary"):
            assert k in d
        k = d["kpis"]
        assert k["clients"] >= 10
        assert k["cases"] >= 15
        assert k["leads_total"] >= 30
        assert isinstance(d["funnel"], list) and len(d["funnel"]) > 0


# ---------------- LEADS ----------------
class TestLeads:
    def test_list_leads(self, client):
        r = client.get(f"{BASE}/api/leads")
        assert r.status_code == 200, r.text
        leads = r.json()
        assert len(leads) >= 30
        assert leads[0]["lead_uid"].startswith("LD-")
        assert "stage" in leads[0]
        assert all("_id" not in x for x in leads)

    def test_create_lead_and_persist(self, client):
        payload = {"name": "TEST_QA Lead", "company": "TEST_QA Pvt Ltd", "mobile": "9812345670",
                   "email": "test_qa@example.com", "city": "Pune", "state": "MH",
                   "product": "business_loan", "approx_requirement": 7500000, "priority": "hot"}
        r = client.post(f"{BASE}/api/leads", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["lead_uid"].startswith("LD-2026-")
        assert d["name"] == payload["name"]
        assert d["stage"] == "new_lead"
        state["lead_uid"] = d["lead_uid"]

        g = client.get(f"{BASE}/api/leads/{d['lead_uid']}")
        assert g.status_code == 200
        assert g.json()["lead"]["company"] == payload["company"]

    def test_patch_lead_stage(self, client):
        uid = state["lead_uid"]
        r = client.patch(f"{BASE}/api/leads/{uid}", json={"stage": "qualified", "probability": 70})
        assert r.status_code == 200, r.text
        assert r.json()["stage"] == "qualified"
        g = client.get(f"{BASE}/api/leads/{uid}").json()
        assert g["lead"]["stage"] == "qualified"
        assert any(a["kind"] == "status_change" for a in g["activities"])

    def test_lead_404(self, client):
        r = client.get(f"{BASE}/api/leads/LD-9999-999999")
        assert r.status_code == 404

    def test_convert_lead(self, client):
        uid = state["lead_uid"]
        r = client.post(f"{BASE}/api/leads/{uid}/convert", json={})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["client"]["client_uid"].startswith("CL-2026-")
        assert d["case"]["case_uid"].startswith("CS-2026-")
        state["client_uid"] = d["client"]["client_uid"]
        state["case_uid"] = d["case"]["case_uid"]

    def test_convert_twice_rejected(self, client):
        r = client.post(f"{BASE}/api/leads/{state['lead_uid']}/convert", json={})
        assert r.status_code == 400, r.text


# ---------------- CLIENTS ----------------
class TestClients:
    def test_list(self, client):
        r = client.get(f"{BASE}/api/clients")
        assert r.status_code == 200
        assert len(r.json()) >= 10

    def test_detail_360(self, client, ent):
        r = client.get(f"{BASE}/api/clients/{ent['client_uid']}")
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("client", "cases", "documents", "invoices", "mandates", "activities"):
            assert k in d
        assert len(d["cases"]) >= 1

    def test_patch_client(self, client, ent):
        r = client.patch(f"{BASE}/api/clients/{ent['client_uid']}", json={"city": "Mumbai"})
        assert r.status_code == 200, r.text
        g = client.get(f"{BASE}/api/clients/{ent['client_uid']}").json()
        assert g["client"]["city"] == "Mumbai"


# ---------------- CASES ----------------
class TestCases:
    def test_list(self, client):
        r = client.get(f"{BASE}/api/cases")
        assert r.status_code == 200
        assert len(r.json()) >= 15

    def test_detail_tabs(self, client, ent):
        r = client.get(f"{BASE}/api/cases/{ent['case_uid']}")
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("case", "applications", "sanctions", "disbursements", "documents",
                  "pds", "activities", "tasks", "bureau", "queries"):
            assert k in d, f"missing {k}"

    def test_patch_case_stage_logs_activity(self, client, ent):
        uid = ent["case_uid"]
        r = client.patch(f"{BASE}/api/cases/{uid}", json={"stage": "under_credit"})
        assert r.status_code == 200, r.text
        assert r.json()["stage"] == "under_credit"
        acts = client.get(f"{BASE}/api/cases/{uid}").json()["activities"]
        assert any(a["kind"] == "status_change" for a in acts)

    def test_pd_create(self, client, ent):
        r = client.post(f"{BASE}/api/cases/{ent['case_uid']}/pd",
                        json={"template": "business", "data": {"note": "TEST_pd"}})
        assert r.status_code == 200, r.text
        assert r.json()["case_uid"] == ent["case_uid"]


# ---------------- BUREAU (sandbox) ----------------
class TestBureau:
    def test_consent_required(self, client, ent):
        r = client.post(f"{BASE}/api/cases/{ent['case_uid']}/bureau", json={"consent": False})
        assert r.status_code == 400, r.text

    def test_pull_sandbox(self, client, ent):
        r = client.post(f"{BASE}/api/cases/{ent['case_uid']}/bureau",
                        json={"consent": True, "provider": "cibil"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["is_sandbox"] is True
        assert 300 <= d["score"] <= 900
        assert d["provider"] == "cibil"


# ---------------- DOCUMENTS ----------------
class TestDocuments:
    def test_upload_and_list(self, client, ent):
        files = {"file": ("test_qa.txt", io.BytesIO(b"TEST_QA content"), "text/plain")}
        data = {"client_uid": ent["client_uid"], "case_uid": ent["case_uid"],
                "category": "KYC", "doc_type": "pan_card"}
        r = client.post(f"{BASE}/api/documents/upload", files=files, data=data)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["version"] == 1
        assert d["client_uid"] == ent["client_uid"]
        state["document_id"] = d["document_id"]

        lst = client.get(f"{BASE}/api/documents", params={"case_uid": ent["case_uid"]})
        assert lst.status_code == 200
        assert any(x["document_id"] == d["document_id"] for x in lst.json())

    def test_versioning(self, client, ent):
        files = {"file": ("test_qa_v2.txt", io.BytesIO(b"TEST_QA v2"), "text/plain")}
        data = {"client_uid": ent["client_uid"], "case_uid": ent["case_uid"],
                "category": "KYC", "doc_type": "pan_card"}
        r = client.post(f"{BASE}/api/documents/upload", files=files, data=data)
        assert r.status_code == 200, r.text
        assert r.json()["version"] == 2

    def test_download(self, client):
        r = client.get(f"{BASE}/api/documents/{state['document_id']}/download")
        assert r.status_code == 200, r.text
        assert b"TEST_QA" in r.content

    def test_verify_document(self, client):
        r = client.patch(f"{BASE}/api/documents/{state['document_id']}", json={"status": "valid"})
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "valid"
        assert r.json()["verified_by"]


# ---------------- LENDERS & APPLICATIONS ----------------
class TestLenders:
    def test_list_lenders(self, client):
        r = client.get(f"{BASE}/api/lenders")
        assert r.status_code == 200
        lenders = r.json()
        assert len(lenders) >= 10
        state["lender_id"] = lenders[0]["lender_id"]

    def test_suggest(self, client, ent):
        r = client.get(f"{BASE}/api/lenders/suggest/{ent['case_uid']}")
        assert r.status_code == 200, r.text
        sug = r.json()
        assert isinstance(sug, list) and len(sug) > 0
        assert "score" in sug[0]

    def test_create_application(self, client, ent):
        r = client.post(f"{BASE}/api/applications", json={
            "case_uid": ent["case_uid"], "lender_id": state["lender_id"],
            "amount_requested": 5000000, "lender_rm": "TEST_RM"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["application_uid"].startswith("LA-")
        state["application_uid"] = d["application_uid"]

    def test_patch_application(self, client):
        r = client.patch(f"{BASE}/api/applications/{state['application_uid']}",
                         json={"status": "under_process"})
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "under_process"

    def test_lender_query_flow(self, client, ent):
        r = client.post(f"{BASE}/api/lender-queries", json={
            "application_uid": state["application_uid"], "case_uid": ent["case_uid"],
            "query_text": "TEST_QA need GST returns"})
        assert r.status_code == 200, r.text
        qid = r.json().get("query_id")
        assert qid
        u = client.patch(f"{BASE}/api/lender-queries/{qid}", json={"status": "resolved"})
        assert u.status_code == 200, u.text
        assert u.json()["status"] == "resolved"


# ---------------- SANCTIONS & DISBURSEMENTS ----------------
class TestSanctionDisbursement:
    def test_create_sanction_updates_case_and_app(self, client, ent, application):
        r = client.post(f"{BASE}/api/sanctions", json={
            "application_uid": application["application_uid"], "case_uid": ent["case_uid"],
            "lender_id": application["lender_id"], "sanction_amount": 4000000, "roi": 11.5,
            "tenure_months": 60})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["sanction_uid"].startswith("SN-")
        state["sanction_uid"] = d["sanction_uid"]

        case = client.get(f"{BASE}/api/cases/{ent['case_uid']}").json()["case"]
        assert case["stage"] == "sanctioned"
        assert case["sanctioned_amount"] >= 4000000
        app = client.patch(f"{BASE}/api/applications/{application['application_uid']}", json={})
        assert app.json()["status"] == "sanctioned"

    def test_partial_then_full_disbursement(self, client, ent, application):
        r = client.post(f"{BASE}/api/disbursements", json={
            "case_uid": ent["case_uid"], "sanction_uid": state["sanction_uid"],
            "amount": 1000000, "reference": "TEST_QA-TR1"})
        assert r.status_code == 200, r.text
        assert r.json()["tranche_no"] == 1
        case = client.get(f"{BASE}/api/cases/{ent['case_uid']}").json()["case"]
        assert case["stage"] == "partially_disbursed", case["stage"]

        r2 = client.post(f"{BASE}/api/disbursements", json={
            "case_uid": ent["case_uid"], "sanction_uid": state["sanction_uid"],
            "amount": 3000000, "reference": "TEST_QA-TR2"})
        assert r2.status_code == 200, r2.text
        assert r2.json()["tranche_no"] == 2
        case = client.get(f"{BASE}/api/cases/{ent['case_uid']}").json()["case"]
        assert case["stage"] == "fully_disbursed", case["stage"]

    def test_disbursement_bad_sanction(self, client, ent):
        r = client.post(f"{BASE}/api/disbursements", json={
            "case_uid": ent["case_uid"], "sanction_uid": "SN-0000-000000", "amount": 1})
        assert r.status_code == 404

    def test_incentive_accrued(self, client):
        r = client.get(f"{BASE}/api/incentives")
        assert r.status_code == 200
        assert len(r.json()) > 0


# ---------------- MANDATES / INVOICES / PAYMENTS ----------------
class TestBilling:
    def test_mandate_lifecycle(self, client, ent):
        r = client.post(f"{BASE}/api/mandates", json={
            "client_uid": ent["client_uid"], "case_uid": ent["case_uid"],
            "scope": "TEST_QA mandate", "success_fee_pct": 1.2, "upfront_fee": 25000})
        assert r.status_code == 200, r.text
        muid = r.json()["mandate_uid"]
        state["mandate_uid"] = muid
        for st in ["internal_approval", "sent", "signed", "verified", "active"]:
            u = client.patch(f"{BASE}/api/mandates/{muid}", json={"status": st})
            assert u.status_code == 200, u.text
            assert u.json()["status"] == st
        assert client.get(f"{BASE}/api/mandates").status_code == 200

    def test_invoice_and_payment(self, client, ent):
        r = client.post(f"{BASE}/api/invoices", json={
            "client_uid": ent["client_uid"], "case_uid": ent["case_uid"],
            "mandate_uid": state.get("mandate_uid"), "amount": 100000, "gst_pct": 18})
        assert r.status_code == 200, r.text
        inv = r.json()
        state["invoice_uid"] = inv["invoice_uid"]
        assert inv["amount"] == 100000
        # payment status is computed against GST/TDS inclusive total_amount
        total = inv["total_amount"]
        assert total == round(100000 * 1.18, 2), inv

        p = client.post(f"{BASE}/api/payments", json={
            "invoice_uid": inv["invoice_uid"], "client_uid": ent["client_uid"],
            "amount": total / 2, "mode": "neft", "reference": "TEST_QA-P1"})
        assert p.status_code == 200, p.text
        invs = client.get(f"{BASE}/api/invoices").json()
        cur = next(i for i in invs if i["invoice_uid"] == inv["invoice_uid"])
        assert cur["status"] == "part_paid", cur["status"]

        p2 = client.post(f"{BASE}/api/payments", json={
            "invoice_uid": inv["invoice_uid"], "client_uid": ent["client_uid"],
            "amount": total / 2, "mode": "neft", "reference": "TEST_QA-P2"})
        assert p2.status_code == 200, p2.text
        invs = client.get(f"{BASE}/api/invoices").json()
        cur = next(i for i in invs if i["invoice_uid"] == inv["invoice_uid"])
        assert cur["status"] == "paid", cur["status"]
        assert client.get(f"{BASE}/api/payments").status_code == 200


# ---------------- MASTERS / MISC LISTS ----------------
class TestListEndpoints:
    @pytest.mark.parametrize("path,min_count", [
        ("/api/employees", 9), ("/api/channel-partners", 1), ("/api/cp-commissions", 0),
        ("/api/tasks", 1), ("/api/audit-logs", 1), ("/api/users", 1),
        ("/api/sanctions", 1), ("/api/disbursements", 1), ("/api/applications", 1),
        ("/api/lender-queries", 0), ("/api/documents", 1), ("/api/incentives", 1),
    ])
    def test_list(self, client, path, min_count):
        r = client.get(f"{BASE}{path}")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= min_count, f"{path} returned {len(data)}"
        assert all("_id" not in x for x in data)

    def test_requires_auth(self, anon):
        for path in ["/api/leads", "/api/cases", "/api/clients", "/api/dashboard/summary"]:
            assert anon.get(f"{BASE}{path}").status_code == 401, path


# ---------------- REPORTS / SEARCH / INTEGRATIONS ----------------
class TestReportsSearch:
    def test_reports_daily(self, client):
        r = client.get(f"{BASE}/api/reports/daily")
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), list)

    def test_reports_pipeline(self, client):
        r = client.get(f"{BASE}/api/reports/pipeline")
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), (list, dict))

    def test_search(self, client):
        r = client.get(f"{BASE}/api/search", params={"q": "Bansal"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert isinstance(d, dict)
        assert ("leads" in d) or ("clients" in d)

    def test_integrations(self, client):
        r = client.get(f"{BASE}/api/integrations")
        assert r.status_code == 200, r.text
        d = r.json()
        items = d if isinstance(d, list) else d.get("integrations", [])
        assert len(items) > 0
        keys = {i.get("key") or i.get("name"): i.get("status") for i in items}
        assert any(v == "connected" for v in keys.values())
        assert any(v == "sandbox" for v in keys.values())

    def test_employee_patch(self, client):
        emps = client.get(f"{BASE}/api/employees").json()
        uid = emps[-1]["employee_uid"]
        r = client.patch(f"{BASE}/api/employees/{uid}", json={"target_monthly": 12345678})
        assert r.status_code == 200, r.text
        assert r.json()["target_monthly"] == 12345678

    def test_task_create_and_complete(self, client, ent):
        r = client.post(f"{BASE}/api/tasks", json={"title": "TEST_QA task",
                                                   "case_uid": ent["case_uid"],
                                                   "due_date": "2026-12-31"})
        assert r.status_code == 200, r.text
        tid = r.json().get("task_id")
        assert tid
        u = client.patch(f"{BASE}/api/tasks/{tid}", json={"status": "completed"})
        assert u.status_code == 200, u.text
        assert u.json()["status"] == "completed"
