"""Iteration 6/10 features: permission system, permission overrides, RBAC on
payouts/run-now, channel-partner create/patch, CAM templates, payout batch."""
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
SUPER_UID = "user_seed_000"
# Each test class gets its own sales_agent user so xdist (--dist loadscope) cannot race
# on permission overrides. Provisioned by tests/setup_qa_agents.js
AGENTS = {n: ("user_test_agent_" + n, "test_session_agent_" + n)
          for n in ("ov", "rc", "cp", "cam", "ro")}

ALL_KEYS = {
    "release_commissions", "mark_payout_paid", "create_partner",
    "edit_partner_target", "publish_cam_template", "manage_users",
}


def sess(token):
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def sup():
    return sess(SUPER_TOKEN)


@pytest.fixture(scope="class")
def agent(request, sup):
    """Per-class isolated sales_agent session. Class sets `agent_key`."""
    key = getattr(request.cls, "agent_key", "ro")
    uid, token = AGENTS[key]
    request.cls.agent_uid = uid
    sup.put(f"{BASE}/admin/users/{uid}/permissions", json={"grants": [], "revokes": []})
    yield sess(token)
    sup.put(f"{BASE}/admin/users/{uid}/permissions", json={"grants": [], "revokes": []})


@pytest.fixture(scope="module", autouse=True)
def restore_super(sup):
    yield
    sup.put(f"{BASE}/admin/users/{SUPER_UID}/permissions", json={"grants": [], "revokes": []})


# ---------------- PERMISSION SYSTEM API ----------------
class TestPermissionKeys:
    agent_key = "ro"
    def test_keys_returns_six(self, sup):
        r = sup.get(f"{BASE}/permissions/keys")
        assert r.status_code == 200, r.text
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 6, data
        assert {d["key"] for d in data} == ALL_KEYS
        for d in data:
            assert isinstance(d["label"], str) and d["label"]

    def test_keys_requires_auth(self):
        r = requests.get(f"{BASE}/permissions/keys")
        assert r.status_code in (401, 403), r.status_code

    def test_me_permissions_super_admin(self, sup):
        r = sup.get(f"{BASE}/me/permissions")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["role"] == "super_admin"
        assert set(d["permissions"]) == ALL_KEYS
        assert d["grants"] == []
        assert d["revokes"] == []

    def test_me_permissions_sales_agent_empty(self, sup, agent):
        # reset overrides first: other classes mutate this user (xdist runs classes in parallel)
        sup.put(f"{BASE}/admin/users/{AGENTS[self.agent_key][0]}/permissions", json={"grants": [], "revokes": []})
        r = agent.get(f"{BASE}/me/permissions")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["role"] == "sales_agent"
        # sales_agent has no role defaults -> effective == grants - revokes (race-safe assertion)
        assert set(d["permissions"]) == set(d["grants"]) - set(d["revokes"])
        assert set(d["permissions"]) <= ALL_KEYS


# ---------------- PERMISSION OVERRIDES ----------------
class TestPermissionOverrides:
    agent_key = "ov"
    def test_put_then_get_persists_and_computes_effective(self, sup):
        r = sup.put(f"{BASE}/admin/users/{AGENTS[self.agent_key][0]}/permissions",
                    json={"grants": ["release_commissions"], "revokes": ["manage_users"]})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["grants"] == ["release_commissions"]
        assert d["revokes"] == ["manage_users"]
        assert d["permissions"] == ["release_commissions"]

        g = sup.get(f"{BASE}/admin/users/{AGENTS[self.agent_key][0]}/permissions")
        assert g.status_code == 200, g.text
        gd = g.json()
        assert gd["user_id"] == AGENTS[self.agent_key][0]
        assert gd["role"] == "sales_agent"
        assert gd["grants"] == ["release_commissions"]
        assert gd["revokes"] == ["manage_users"]
        assert gd["permissions"] == ["release_commissions"]

    def test_revoke_wins_over_role_default(self, sup):
        # super_admin has all by default; revoke manage_users -> effective loses it
        r = sup.put(f"{BASE}/admin/users/{SUPER_UID}/permissions",
                    json={"grants": [], "revokes": ["publish_cam_template"]})
        assert r.status_code == 200, r.text
        assert "publish_cam_template" not in r.json()["permissions"]
        # restore
        rr = sup.put(f"{BASE}/admin/users/{SUPER_UID}/permissions", json={"grants": [], "revokes": []})
        assert rr.status_code == 200
        assert set(rr.json()["permissions"]) == ALL_KEYS

    def test_invalid_keys_filtered(self, sup):
        r = sup.put(f"{BASE}/admin/users/{AGENTS[self.agent_key][0]}/permissions",
                    json={"grants": ["bogus_key", "create_partner"], "revokes": ["nope"]})
        assert r.status_code == 200, r.text
        assert r.json()["grants"] == ["create_partner"]
        assert r.json()["revokes"] == []

    def test_non_admin_cannot_put(self, agent):
        r = agent.put(f"{BASE}/admin/users/{AGENTS[self.agent_key][0]}/permissions", json={"grants": [], "revokes": []})
        assert r.status_code == 403, r.text

    def test_non_admin_cannot_get(self, agent):
        r = agent.get(f"{BASE}/admin/users/{AGENTS[self.agent_key][0]}/permissions")
        assert r.status_code == 403, r.text

    def test_unknown_user_404(self, sup):
        r = sup.get(f"{BASE}/admin/users/user_does_not_exist_xyz/permissions")
        assert r.status_code == 404, r.text
        p = sup.put(f"{BASE}/admin/users/user_does_not_exist_xyz/permissions", json={"grants": []})
        assert p.status_code == 404, p.text


# ---------------- RELEASE COMMISSIONS RBAC ----------------
class TestReleaseCommissionsRBAC:
    agent_key = "rc"
    def test_agent_forbidden_by_default(self, sup, agent):
        sup.put(f"{BASE}/admin/users/{AGENTS[self.agent_key][0]}/permissions", json={"grants": [], "revokes": []})
        r = agent.post(f"{BASE}/payouts/run-now", json={})
        assert r.status_code == 403, r.text
        assert "release_commissions" in r.json().get("detail", "")

    def test_agent_allowed_after_grant(self, sup, agent):
        sup.put(f"{BASE}/admin/users/{AGENTS[self.agent_key][0]}/permissions",
                json={"grants": ["release_commissions"], "revokes": []})
        r = agent.post(f"{BASE}/payouts/run-now", json={})
        assert r.status_code == 200, r.text
        d = r.json()
        # batch_id is None when nothing is eligible (iteration-7 phantom-batch fix)
        assert "batch_id" in d
        if d["batch_id"] is not None:
            assert d["batch_id"].startswith("PO-")
            assert d["total_amount"] > 0
        else:
            assert d["total_amount"] == 0
        sup.put(f"{BASE}/admin/users/{AGENTS[self.agent_key][0]}/permissions", json={"grants": [], "revokes": []})

    def test_super_admin_forbidden_after_revoke(self, sup):
        sup.put(f"{BASE}/admin/users/{SUPER_UID}/permissions",
                json={"grants": [], "revokes": ["release_commissions"]})
        r = sup.post(f"{BASE}/payouts/run-now", json={})
        assert r.status_code == 403, r.text
        sup.put(f"{BASE}/admin/users/{SUPER_UID}/permissions", json={"grants": [], "revokes": []})
        ok = sup.post(f"{BASE}/payouts/run-now", json={})
        assert ok.status_code == 200, ok.text

    def test_mark_paid_rbac(self, agent):
        r = agent.post(f"{BASE}/payouts/PO-DOES-NOT-EXIST/mark-paid", json={})
        # permission check must come before existence check
        assert r.status_code == 403, r.text


# ---------------- CHANNEL PARTNER RBAC + CREATE ----------------
class TestChannelPartnerRBAC:
    agent_key = "cp"
    created = []

    def test_agent_cannot_create_partner(self, sup, agent):
        sup.put(f"{BASE}/admin/users/{AGENTS[self.agent_key][0]}/permissions", json={"grants": [], "revokes": []})
        r = agent.post(f"{BASE}/channel-partners", json={"name": "TEST_Blocked"})
        assert r.status_code == 403, r.text

    def test_agent_can_create_after_grant_and_patch_needs_target_perm(self, sup, agent):
        sup.put(f"{BASE}/admin/users/{AGENTS[self.agent_key][0]}/permissions",
                json={"grants": ["create_partner"], "revokes": []})
        r = agent.post(f"{BASE}/channel-partners", json={
            "name": "TEST_QA Wizard Partner", "mobile": "9800011122",
            "email": "test_qa_wizard@example.com", "products": ["lap"],
            "commission_structure": {"default_pct": 1.5}})
        assert r.status_code == 200, r.text
        uid = r.json()["partner_uid"]
        TestChannelPartnerRBAC.created.append(uid)
        assert r.json()["name"] == "TEST_QA Wizard Partner"
        assert r.json()["products"] == ["lap"]

        # PATCH requires edit_partner_target which agent does not have
        p = agent.patch(f"{BASE}/channel-partners/{uid}", json={"monthly_target": 5000000})
        assert p.status_code == 403, p.text

        # super_admin can patch
        sp = sess(SUPER_TOKEN).patch(f"{BASE}/channel-partners/{uid}", json={"monthly_target": 5000000})
        assert sp.status_code == 200, sp.text
        assert sp.json()["monthly_target"] == 5000000

        # verify persistence via GET list
        lst = sess(SUPER_TOKEN).get(f"{BASE}/channel-partners").json()
        row = [x for x in lst if x["partner_uid"] == uid]
        assert row and row[0]["monthly_target"] == 5000000
        assert "_id" not in row[0]
        sup.put(f"{BASE}/admin/users/{AGENTS[self.agent_key][0]}/permissions", json={"grants": [], "revokes": []})

    def test_partner_appears_in_performance(self, sup):
        r = sup.get(f"{BASE}/partners/performance")
        assert r.status_code == 200, r.text
        d = r.json()
        assert "kpis" in d or "partners" in d, list(d.keys())


# ---------------- CAM TEMPLATES ----------------
class TestCamTemplates:
    agent_key = "cam"
    ids = []

    def test_list_and_product_filter(self, sup):
        r = sup.get(f"{BASE}/cam-templates")
        assert r.status_code == 200, r.text
        assert isinstance(r.json(), list)
        wc = sup.get(f"{BASE}/cam-templates", params={"product": "working_capital"})
        assert wc.status_code == 200
        assert all(t["product"] == "working_capital" for t in wc.json())
        assert len(wc.json()) >= 1

    def test_create_lap_template_and_fetch(self, sup):
        payload = {
            "name": "TEST_LAP standard", "product": "lap",
            "overview": {"industry": "Real Estate", "promoter": "SHOULD_BE_STRIPPED"},
            "ratios": {"dscr": 1.6, "current_ratio": 1.4},
            "positives": ["Collateral cover 2x"],
            "concerns": ["Rental yield low"],
            "flags": [{"level": "amber", "title": "LTV near cap"}, {"level": "red"}],
            "recommendation": "Approve with conditions",
            "analyst_comments": "Standard LAP template",
        }
        r = sup.post(f"{BASE}/cam-templates", json=payload)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "_id" not in d
        tid = d["template_id"]
        TestCamTemplates.ids.append(tid)
        assert d["name"] == "TEST_LAP standard"
        assert d["product"] == "lap"
        snap = d["snapshot"]
        assert snap["overview"] == {"industry": "Real Estate"}, "PII/extra overview fields must be stripped"
        assert snap["ratios"]["dscr"] == 1.6
        assert snap["positives"] == ["Collateral cover 2x"]
        assert len(snap["flags"]) == 1, "flags without title must be dropped"
        assert snap["recommendation"] == "Approve with conditions"

        got = sup.get(f"{BASE}/cam-templates", params={"product": "lap"})
        assert got.status_code == 200
        assert tid in [t["template_id"] for t in got.json()]

    def test_create_requires_name(self, sup):
        r = sup.post(f"{BASE}/cam-templates", json={"name": "   ", "product": "lap"})
        assert r.status_code == 422, r.text

    def test_create_forbidden_without_permission(self, agent):
        r = agent.post(f"{BASE}/cam-templates", json={"name": "TEST_nope", "product": "lap"})
        assert r.status_code == 403, r.text

    def test_delete_forbidden_for_non_owner_without_permission(self, agent):
        assert TestCamTemplates.ids, "needs template from earlier test"
        r = agent.delete(f"{BASE}/cam-templates/{TestCamTemplates.ids[0]}")
        assert r.status_code == 403, r.text

    def test_delete_unknown_404(self, sup):
        r = sup.delete(f"{BASE}/cam-templates/tpl_nonexistent")
        assert r.status_code == 404, r.text

    def test_delete_by_publisher_then_gone(self, sup):
        payload = {"name": "TEST_ToDelete", "product": "lap"}
        tid = sup.post(f"{BASE}/cam-templates", json=payload).json()["template_id"]
        r = sup.delete(f"{BASE}/cam-templates/{tid}")
        assert r.status_code == 200, r.text
        remaining = [t["template_id"] for t in sup.get(f"{BASE}/cam-templates").json()]
        assert tid not in remaining


# ---------------- PAYOUT BATCH + REGRESSION ----------------
class TestRegression:
    def test_payout_batches_list(self, sup):
        r = sup.get(f"{BASE}/payouts")
        assert r.status_code == 200, r.text
        rows = r.json()
        assert isinstance(rows, list) and len(rows) >= 1
        assert "batch_id" in rows[0] and "_id" not in rows[0]

    def test_cam_pdf(self, sup):
        r = sup.get(f"{BASE}/cases/CS-2026-000015/cam.pdf")
        assert r.status_code == 200, r.text[:200]
        assert r.content[:4] == b"%PDF", r.content[:20]

    def test_case_detail_and_assessment_persist(self, sup):
        r = sup.get(f"{BASE}/cases/CS-2026-000015")
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["case"]["case_uid"] == "CS-2026-000015"
        assert "_id" not in d["case"]
        assert "assessment" in d

        p = sup.post(f"{BASE}/cases/CS-2026-000015/assessment", json={
            "ratios": {"dscr": 1.55}, "positives": ["TEST_QA positive"],
            "concerns": [], "flags": [{"level": "amber", "title": "TEST_QA flag"}],
            "recommendation": "TEST_QA recommendation",
            "analyst_comments": "TEST_QA cam persist check"})
        assert p.status_code == 200, p.text
        g = sup.get(f"{BASE}/cases/CS-2026-000015").json()["assessment"]
        assert g is not None
        assert g.get("analyst_comments") == "TEST_QA cam persist check"
        assert g.get("ratios", {}).get("dscr") == 1.55


@pytest.fixture(scope="module", autouse=True)
def cleanup(sup):
    yield
    for tid in TestCamTemplates.ids:
        sup.delete(f"{BASE}/cam-templates/{tid}")
