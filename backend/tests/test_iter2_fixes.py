"""Iteration-2 retest: validation (422), invoice totals, dashboard/report keys,
document doc-completeness + versioning, seeded data volumes."""
import io

import pytest


# ---------------- RETEST-1: validation & invoice math ----------------
class TestValidation:
    def test_task_missing_due_date_defaults(self, client, base_url):
        r = client.post(f"{base_url}/api/tasks", json={"title": "TEST_QA task no due"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["due_date"], "due_date should be defaulted"
        assert d["title"] == "TEST_QA task no due"
        assert d["status"] == "open"

    def test_task_missing_title_422(self, client, base_url):
        r = client.post(f"{base_url}/api/tasks", json={"due_date": "2026-12-31"})
        assert r.status_code == 422, f"expected 422 got {r.status_code}: {r.text}"

    def test_task_empty_body_422(self, client, base_url):
        r = client.post(f"{base_url}/api/tasks", json={})
        assert r.status_code == 422, f"expected 422 got {r.status_code}: {r.text}"

    def test_invoice_missing_amount_422(self, client, base_url, ent):
        r = client.post(f"{base_url}/api/invoices", json={"client_uid": ent["client_uid"]})
        assert r.status_code == 422, f"expected 422 got {r.status_code}: {r.text}"

    def test_invoice_missing_client_422(self, client, base_url):
        r = client.post(f"{base_url}/api/invoices", json={"amount": 1000})
        assert r.status_code == 422, f"expected 422 got {r.status_code}: {r.text}"

    def test_payment_missing_fields_422(self, client, base_url):
        r = client.post(f"{base_url}/api/payments", json={"amount": 100})
        assert r.status_code == 422, f"expected 422 got {r.status_code}: {r.text}"

    def test_invoice_total_amount_gst_tds(self, client, base_url, ent):
        r = client.post(f"{base_url}/api/invoices", json={
            "client_uid": ent["client_uid"], "case_uid": ent["case_uid"],
            "amount": 100000, "gst_pct": 18, "tds_pct": 10})
        assert r.status_code == 200, r.text
        inv = r.json()
        expected = round(100000 * 1.18 * 0.9, 2)
        assert inv["total_amount"] == expected, inv
        # persisted
        invs = client.get(f"{base_url}/api/invoices").json()
        cur = next(i for i in invs if i["invoice_uid"] == inv["invoice_uid"])
        assert cur["total_amount"] == expected
        assert cur["status"] == "pending"

        # partial payment of base amount must NOT mark paid
        p = client.post(f"{base_url}/api/payments", json={
            "invoice_uid": inv["invoice_uid"], "client_uid": ent["client_uid"],
            "amount": 100000, "mode": "neft", "reference": "TEST_QA-I2-P1"})
        assert p.status_code == 200, p.text
        cur = next(i for i in client.get(f"{base_url}/api/invoices").json()
                   if i["invoice_uid"] == inv["invoice_uid"])
        assert cur["status"] == "part_paid", cur

        # pay the remainder -> paid
        rest = round(expected - 100000, 2)
        p2 = client.post(f"{base_url}/api/payments", json={
            "invoice_uid": inv["invoice_uid"], "client_uid": ent["client_uid"],
            "amount": rest, "mode": "neft", "reference": "TEST_QA-I2-P2"})
        assert p2.status_code == 200, p2.text
        cur = next(i for i in client.get(f"{base_url}/api/invoices").json()
                   if i["invoice_uid"] == inv["invoice_uid"])
        assert cur["status"] == "paid", cur


# ---------------- RETEST-2: aggregation contract keys ----------------
class TestAggregationKeys:
    def test_dashboard_keys(self, client, base_url):
        r = client.get(f"{base_url}/api/dashboard/summary")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["funnel"] and all("stage" in x and "_id" not in x for x in d["funnel"]), d["funnel"]
        assert d["top_lenders"] and all("lender_id" in x and "_id" not in x for x in d["top_lenders"])
        assert d["invoices_summary"] and all("status" in x and "_id" not in x for x in d["invoices_summary"])
        assert d["kpis"]["leads_total"] >= 30

    def test_pipeline_report_keys(self, client, base_url):
        r = client.get(f"{base_url}/api/reports/pipeline")
        assert r.status_code == 200, r.text
        rows = r.json()
        assert isinstance(rows, list) and rows
        assert all("stage" in x and "_id" not in x for x in rows), rows[:3]
        assert all(isinstance(x["count"], int) for x in rows)


# ---------------- RETEST-3: documentation_pct + version chain ----------------
class TestDocCompleteness:
    def test_upload_updates_documentation_pct_and_versions(self, client, base_url, ent):
        case_uid = ent["case_uid"]
        before = client.get(f"{base_url}/api/cases/{case_uid}").json()["case"]
        start_pct = before.get("documentation_pct", 0)

        def upload(category, doc_type, content):
            files = {"file": (f"{doc_type}.txt", io.BytesIO(content), "text/plain")}
            data = {"client_uid": ent["client_uid"], "case_uid": case_uid,
                    "category": category, "doc_type": doc_type}
            return client.post(f"{base_url}/api/documents/upload", files=files, data=data)

        r1 = upload("KYC", "TEST_QA_pan", b"v1")
        assert r1.status_code == 200, r1.text
        assert r1.json()["version"] == 1
        assert r1.json()["category"] == "KYC"
        pct1 = client.get(f"{base_url}/api/cases/{case_uid}").json()["case"]["documentation_pct"]
        assert pct1 > start_pct or pct1 > 0, f"pct did not update: {start_pct}->{pct1}"

        r2 = upload("Financials", "TEST_QA_itr", b"v1")
        assert r2.status_code == 200, r2.text
        pct2 = client.get(f"{base_url}/api/cases/{case_uid}").json()["case"]["documentation_pct"]
        assert pct2 > pct1, f"second category did not raise pct: {pct1}->{pct2}"

        # version chain on same doc_type
        r3 = upload("KYC", "TEST_QA_pan", b"v2")
        assert r3.status_code == 200 and r3.json()["version"] == 2, r3.text
        r4 = upload("KYC", "TEST_QA_pan", b"v3")
        assert r4.status_code == 200 and r4.json()["version"] == 3, r4.text

        docs = client.get(f"{base_url}/api/documents", params={"case_uid": case_uid}).json()
        chain = {d["document_id"]: d for d in docs if d["doc_type"] == "TEST_QA_pan"}
        v1 = next(d for d in chain.values() if d["version"] == 1)
        v2 = next(d for d in chain.values() if d["version"] == 2)
        v3 = next(d for d in chain.values() if d["version"] == 3)
        assert v1["superseded_by"] == v2["document_id"]
        assert v2["superseded_by"] == v3["document_id"]
        assert v3["superseded_by"] is None
        # pct must not exceed 100
        pct3 = client.get(f"{base_url}/api/cases/{case_uid}").json()["case"]["documentation_pct"]
        assert 0 < pct3 <= 100


# ---------------- RETEST-4: seeded supplemental data ----------------
class TestSeededData:
    def test_documents_seeded(self, client, base_url):
        docs = client.get(f"{base_url}/api/documents").json()
        assert len(docs) >= 40, f"only {len(docs)} documents"
        assert all("_id" not in d for d in docs)
        cats = {d.get("category") for d in docs}
        assert len(cats) >= 3, cats

    def test_lender_queries_seeded(self, client, base_url):
        qs = client.get(f"{base_url}/api/lender-queries").json()
        assert len(qs) >= 6, f"only {len(qs)} queries"
        case_uid = qs[0]["case_uid"]
        f = client.get(f"{base_url}/api/lender-queries", params={"case_uid": case_uid})
        assert f.status_code == 200
        assert len(f.json()) >= 1
        assert all(x["case_uid"] == case_uid for x in f.json())

    def test_mandates_varied_statuses(self, client, base_url):
        ms = client.get(f"{base_url}/api/mandates").json()
        assert len(ms) >= 6, f"only {len(ms)} mandates"
        statuses = {m["status"] for m in ms}
        expected = {"draft", "internal_approval", "sent", "signed", "verified", "active"}
        missing = expected - statuses
        assert not missing, f"missing mandate statuses: {missing} (present: {statuses})"

    def test_bureau_checks_present(self, client, base_url):
        cases = client.get(f"{base_url}/api/cases").json()
        found = 0
        for c in cases[:15]:
            d = client.get(f"{base_url}/api/cases/{c['case_uid']}").json()
            if d.get("bureau"):
                found += 1
        assert found >= 1, "no seeded bureau checks on any case"
