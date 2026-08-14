"""Iteration 7: iteration_6 defect fixes (phantom batch_id, permission-aware read
endpoints, /users gating) + NEW public marketplace endpoints
(/api/public/lenders, /api/public/become-partner)."""
import os

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
_base = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not _base:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE = _base.rstrip("/") + "/api"

SUPER_TOKEN = "test_session_supertoken"
RO_UID, RO_TOKEN = "user_test_agent_ro", "test_session_agent_ro"
QA_UID, QA_TOKEN = "user_test_agent_qa", "test_session_agent_qa"

EXPECTED_TYPES = {
    "Private Bank", "PSU Bank", "Foreign Bank", "Small Finance Bank",
    "NBFC", "Housing Finance", "Specialty NBFC", "Private Credit",
}


def sess(token=None):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    if token:
        s.headers.update({"Authorization": f"Bearer {token}"})
    return s


@pytest.fixture(scope="module")
def sup():
    return sess(SUPER_TOKEN)


@pytest.fixture(scope="module")
def anon():
    return sess()


# ---------------- PUBLIC: LENDER DIRECTORY ----------------
class TestPublicLenders:
    def test_public_lenders_no_auth(self, anon):
        r = anon.get(f"{BASE}/public/lenders")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["total"] == 82, f"expected 82 lenders, got {d['total']}"
        assert len(d["by_type"]) == 8
        assert {g["type"] for g in d["by_type"]} == EXPECTED_TYPES
        assert sum(g["count"] for g in d["by_type"]) == 82
        for g in d["by_type"]:
            assert g["count"] == len(g["names"])
            assert all(isinstance(n, str) and n for n in g["names"])
        assert len(d["all"]) == 82

    def test_no_mongo_id_leak(self, anon):
        assert "_id" not in anon.get(f"{BASE}/public/lenders").text


# ---------------- PUBLIC: BECOME PARTNER ----------------
class TestPublicBecomePartner:
    created = []

    def test_submit_no_auth_and_persist(self, anon, sup):
        payload = {
            "name": "TEST_Partner QA", "mobile": "9876500011",
            "email": "TEST_partner_qa@example.com", "city": "Pune",
            "state": "Maharashtra", "current_business": "DSA",
            "expected_volume": "1-5 Cr", "products": ["business_loan", "lap"],
            "message": "QA automated submission",
        }
        r = anon.post(f"{BASE}/public/become-partner", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["application_id"].startswith("PA-"), d
        assert d["name"] == payload["name"]
        assert d["mobile"] == payload["mobile"]
        assert d["city"] == "Pune"
        assert d["products"] == payload["products"]
        assert d["source"] == "become_partner_page"
        assert d["status"] == "new"
        assert "_id" not in d
        TestPublicBecomePartner.created.append(d["application_id"])

    def test_missing_mobile_422(self, anon):
        r = anon.post(f"{BASE}/public/become-partner", json={"name": "TEST_x"})
        assert r.status_code == 422, r.text

    def test_missing_name_422(self, anon):
        r = anon.post(f"{BASE}/public/become-partner", json={"mobile": "9999999999"})
        assert r.status_code == 422, r.text


# ---------------- FIX: PHANTOM BATCH ID ----------------
class TestPayoutRunNowNoPhantom:
    def test_two_consecutive_runs_second_has_null_batch(self, sup):
        r1 = sup.post(f"{BASE}/payouts/run-now")
        assert r1.status_code == 200, r1.text
        d1 = r1.json()
        r2 = sup.post(f"{BASE}/payouts/run-now")
        assert r2.status_code == 200, r2.text
        d2 = r2.json()
        assert d2.get("batch_id") is None, f"phantom batch returned: {d2}"
        assert d2.get("total_amount") == 0
        assert d2.get("cp_count") == 0 and d2.get("incentive_count") == 0
        # any batch_id returned by the first call must really exist
        listed = {b["batch_id"] for b in sup.get(f"{BASE}/payouts").json()}
        if d1.get("batch_id"):
            assert d1["batch_id"] in listed, "first-call batch_id not persisted"
            assert d1.get("total_amount", 0) > 0

    def test_all_listed_batches_have_ids(self, sup):
        rows = sup.get(f"{BASE}/payouts").json()
        assert isinstance(rows, list)
        for b in rows:
            assert b.get("batch_id")
            assert "_id" not in b


# ---------------- FIX: PERMISSION-AWARE READ ENDPOINTS ----------------
class TestGrantedPermissionReads:
    """sales_agent with release_commissions + create_partner must be able to
    read /partners/performance, /payouts, /payouts/{id}/csv."""

    @pytest.fixture(scope="class")
    def granted(self, sup):
        r = sup.put(f"{BASE}/admin/users/{QA_UID}/permissions",
                    json={"grants": ["release_commissions", "create_partner"], "revokes": []})
        assert r.status_code == 200, r.text
        perms = set(r.json().get("permissions", []))
        assert {"release_commissions", "create_partner"} <= perms, perms
        yield sess(QA_TOKEN)
        sup.put(f"{BASE}/admin/users/{QA_UID}/permissions", json={"grants": [], "revokes": []})

    def test_me_permissions_reflect_grants(self, granted):
        r = granted.get(f"{BASE}/me/permissions")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["role"] == "sales_agent"
        assert "release_commissions" in d["permissions"]

    def test_partners_performance_200(self, granted):
        r = granted.get(f"{BASE}/partners/performance")
        assert r.status_code == 200, r.text
        d = r.json()
        assert "kpis" in d and "rows" in d
        assert isinstance(d["rows"], list) and len(d["rows"]) > 0

    def test_run_now_200(self, granted):
        r = granted.post(f"{BASE}/payouts/run-now")
        assert r.status_code == 200, r.text
        assert "batch_id" in r.json()

    def test_payouts_list_200(self, granted):
        r = granted.get(f"{BASE}/payouts")
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), list)

    def test_payout_csv_200(self, granted, sup):
        rows = sup.get(f"{BASE}/payouts").json()
        if not rows:
            pytest.skip("no payout batch available")
        bid = rows[0]["batch_id"]
        r = granted.get(f"{BASE}/payouts/{bid}/csv")
        assert r.status_code == 200, r.text
        assert "Beneficiary Type" in r.text


class TestUngrantedAgentBlocked:
    @pytest.fixture(scope="class")
    def ro(self, sup):
        sup.put(f"{BASE}/admin/users/{RO_UID}/permissions", json={"grants": [], "revokes": []})
        return sess(RO_TOKEN)

    def test_users_list_403_for_plain_agent(self, ro):
        r = ro.get(f"{BASE}/users")
        assert r.status_code == 403, r.text

    def test_users_list_401_unauth(self, anon):
        r = anon.get(f"{BASE}/users")
        assert r.status_code == 401, r.text

    def test_users_list_200_for_super(self, sup):
        r = sup.get(f"{BASE}/users")
        assert r.status_code == 200, r.text
        assert len(r.json()) > 0

    def test_payouts_403(self, ro):
        assert ro.get(f"{BASE}/payouts").status_code == 403

    def test_partners_performance_403(self, ro):
        assert ro.get(f"{BASE}/partners/performance").status_code == 403

    def test_run_now_403(self, ro):
        assert ro.post(f"{BASE}/payouts/run-now").status_code == 403


# ---------------- REGRESSION: earlier public + reporting endpoints ----------------
class TestRegression:
    def test_public_products(self, anon):
        r = anon.get(f"{BASE}/public/products")
        assert r.status_code == 200, r.text
        assert len(r.json()) > 0

    def test_partner_kpis_super(self, sup):
        r = sup.get(f"{BASE}/partners/performance")
        assert r.status_code == 200, r.text

    def test_cam_templates(self, sup):
        r = sup.get(f"{BASE}/cam-templates")
        assert r.status_code == 200, r.text

    def test_global_search(self, sup):
        r = sup.get(f"{BASE}/search", params={"q": "a"})
        assert r.status_code == 200, r.text

    def test_opportunities(self, sup):
        r = sup.get(f"{BASE}/opportunities")
        assert r.status_code == 200, r.text

    def test_weekly_xlsx(self, sup):
        r = sup.get(f"{BASE}/reports/weekly.xlsx")
        assert r.status_code == 200, r.text
        assert len(r.content) > 1000

    def test_weekly_pdf(self, sup):
        r = sup.get(f"{BASE}/reports/weekly.pdf")
        assert r.status_code == 200, r.text
        assert r.content[:4] == b"%PDF"


def teardown_module(module):
    """Remove QA-created partner applications."""
    try:
        import pymongo
        from dotenv import dotenv_values as dv
        env = dv("/app/backend/.env")
        cli = pymongo.MongoClient(env["MONGO_URL"])
        cli[env["DB_NAME"]].partner_applications.delete_many({"name": {"$regex": "^TEST_"}})
        cli.close()
    except Exception as e:  # pragma: no cover
        print(f"cleanup skipped: {e}")
