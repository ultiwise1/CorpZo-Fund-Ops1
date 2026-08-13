"""Iteration 5 — Partner CRM v2 (/api/partners/performance, PATCH /api/channel-partners/{uid})
and CAM PDF export (/api/cases/{uid}/cam.pdf). Plus quick regression on weekly reports & search."""
import pytest


# ---------- Partner performance rollup ----------
class TestPartnerPerformance:
    def test_requires_auth(self, anon, base_url):
        r = anon.get(f"{base_url}/api/partners/performance")
        assert r.status_code in (401, 403), r.status_code

    def test_shape_and_kpis(self, client, base_url):
        r = client.get(f"{base_url}/api/partners/performance")
        assert r.status_code == 200, r.text
        d = r.json()
        assert set(["kpis", "period", "rows"]).issubset(d.keys())
        k = d["kpis"]
        for f in ("active_partners", "total_partners", "mtd_disbursement",
                  "mtd_commission_accrued", "overdue_payouts"):
            assert f in k, f
            assert isinstance(k[f], (int, float)), f
        assert k["active_partners"] <= k["total_partners"]
        assert isinstance(d["period"], str) and len(d["period"]) >= 7
        assert len(d["rows"]) >= 5, "expected >=5 seeded channel partners"

    def test_row_fields_and_trend(self, client, base_url):
        rows = client.get(f"{base_url}/api/partners/performance").json()["rows"]
        for row in rows:
            for f in ("partner_uid", "channel_code", "name", "monthly_target",
                      "disbursed_mtd", "disbursed_total", "commission_mtd",
                      "commission_payable", "commission_overdue",
                      "attainment_pct", "trend_labels", "trend_disbursed"):
                assert f in row, f"{f} missing on {row.get('partner_uid')}"
            assert len(row["trend_labels"]) == 6
            assert len(row["trend_disbursed"]) == 6
            # labels chronological YYYY-MM ascending
            assert row["trend_labels"] == sorted(row["trend_labels"])
        assert "_id" not in str(rows[0])

    def test_rows_sorted_by_disbursed_mtd_desc(self, client, base_url):
        rows = client.get(f"{base_url}/api/partners/performance").json()["rows"]
        vals = [r["disbursed_mtd"] for r in rows]
        assert vals == sorted(vals, reverse=True), vals

    def test_kpi_totals_match_rows(self, client, base_url):
        d = client.get(f"{base_url}/api/partners/performance").json()
        rows, k = d["rows"], d["kpis"]
        assert round(sum(r["disbursed_mtd"] for r in rows), 2) == pytest.approx(k["mtd_disbursement"], abs=1)
        assert round(sum(r["commission_mtd"] for r in rows), 2) == pytest.approx(k["mtd_commission_accrued"], abs=1)
        assert round(sum(r["commission_overdue"] for r in rows), 2) == pytest.approx(k["overdue_payouts"], abs=1)
        assert k["active_partners"] == sum(1 for r in rows if r.get("status") == "active")


# ---------- PATCH channel partner ----------
class TestPatchChannelPartner:
    def _first(self, client, base_url):
        return client.get(f"{base_url}/api/partners/performance").json()["rows"][0]

    def test_patch_target_persists_and_updates_attainment(self, client, base_url):
        row = self._first(client, base_url)
        uid = row["partner_uid"]
        original = row["monthly_target"]
        try:
            r = client.patch(f"{base_url}/api/channel-partners/{uid}",
                             json={"monthly_target": 7500000})
            assert r.status_code == 200, r.text
            body = r.json()
            assert body["partner_uid"] == uid
            assert body["monthly_target"] == 7500000
            assert "_id" not in body

            # GET verifies persistence + derived attainment
            after = [x for x in client.get(f"{base_url}/api/partners/performance").json()["rows"]
                     if x["partner_uid"] == uid][0]
            assert after["monthly_target"] == 7500000
            expected = round(after["disbursed_mtd"] / 7500000 * 100, 1)
            assert after["attainment_pct"] == pytest.approx(expected, abs=0.2)
        finally:
            client.patch(f"{base_url}/api/channel-partners/{uid}",
                         json={"monthly_target": original})

    def test_disallowed_fields_ignored(self, client, base_url):
        row = self._first(client, base_url)
        uid = row["partner_uid"]
        r = client.patch(f"{base_url}/api/channel-partners/{uid}",
                         json={"partner_uid": "CP-HACKED", "commission_total": 999,
                              "notes": "TEST_QA note"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["partner_uid"] == uid
        assert body.get("commission_total", None) in (None, 0)
        assert body.get("notes") == "TEST_QA note"

    def test_unknown_partner_404(self, client, base_url):
        r = client.patch(f"{base_url}/api/channel-partners/CP-DOES-NOT-EXIST",
                         json={"monthly_target": 1})
        assert r.status_code == 404, r.status_code

    def test_patch_requires_auth(self, anon, base_url):
        r = anon.patch(f"{base_url}/api/channel-partners/CP-0001", json={"monthly_target": 1})
        assert r.status_code in (401, 403), r.status_code


# ---------- CAM PDF ----------
class TestCamPdf:
    CASE = "CS-2026-000015"

    def test_pdf_ok(self, client, base_url):
        r = client.get(f"{base_url}/api/cases/{self.CASE}/cam.pdf")
        assert r.status_code == 200, r.text[:300]
        assert "application/pdf" in r.headers.get("content-type", "")
        assert r.content[:5] == b"%PDF-"
        assert len(r.content) > 1500, len(r.content)

    def test_pdf_unknown_case_404(self, client, base_url):
        r = client.get(f"{base_url}/api/cases/CS-9999-999999/cam.pdf")
        assert r.status_code == 404, r.status_code

    def test_pdf_requires_auth(self, anon, base_url):
        r = anon.get(f"{base_url}/api/cases/{self.CASE}/cam.pdf")
        assert r.status_code in (401, 403), r.status_code


# ---------- CAM assessment save/persist ----------
class TestCamAssessment:
    CASE = "CS-2026-000015"

    def test_assessment_save_and_read(self, client, base_url):
        payload = {"ratios": {"dscr": 0.8, "current_ratio": 2, "foir": 70},
                   "flags": [{"level": "red", "title": "TEST_QA flag", "id": 1}],
                   "recommendation": "conditional_approve"}
        r = client.post(f"{base_url}/api/cases/{self.CASE}/assessment", json=payload)
        assert r.status_code == 200, r.text
        saved = r.json()
        assert saved["ratios"]["dscr"] == 0.8
        assert "_id" not in saved
        # read back via case detail (assessment embedded)
        back = client.get(f"{base_url}/api/cases/{self.CASE}").json()["assessment"]
        assert float(back["ratios"]["dscr"]) == 0.8
        assert float(back["ratios"]["foir"]) == 70
        assert "TEST_QA flag" in [x.get("title") for x in (back.get("flags") or []) if isinstance(x, dict)]
        assert back["recommendation"] == "conditional_approve"


# ---------- Regression spot checks ----------
class TestRegression:
    def test_weekly_xlsx(self, client, base_url):
        r = client.get(f"{base_url}/api/reports/weekly.xlsx")
        assert r.status_code == 200 and len(r.content) > 1000

    def test_weekly_pdf(self, client, base_url):
        r = client.get(f"{base_url}/api/reports/weekly.pdf")
        assert r.status_code == 200 and r.content[:5] == b"%PDF-"

    def test_global_search(self, client, base_url):
        r = client.get(f"{base_url}/api/search", params={"q": "Rohit"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert isinstance(d, dict)
        total = sum(len(v) for v in d.values() if isinstance(v, list))
        assert total > 0, d

    def test_channel_partners_list(self, client, base_url):
        r = client.get(f"{base_url}/api/channel-partners")
        assert r.status_code == 200
        assert len(r.json()) >= 5
