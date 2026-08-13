import os

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
_base = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not _base:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = _base.rstrip("/")
TOKEN = "test_session_supertoken"


@pytest.fixture(scope="session")
def base_url():
    return BASE_URL


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Authorization": f"Bearer {TOKEN}"})
    return s


@pytest.fixture(scope="session")
def anon():
    return requests.Session()


@pytest.fixture(scope="session")
def ent(client):
    """Create a fresh lead -> convert to client+case. Session scoped per xdist worker."""
    r = client.post(f"{BASE_URL}/api/leads", json={
        "name": "TEST_QA Fixture", "company": "TEST_QA Fixture Pvt Ltd",
        "mobile": "9800000001", "email": "test_qa_fixture@example.com",
        "city": "Pune", "state": "MH", "product": "business_loan",
        "approx_requirement": 6000000, "priority": "warm"})
    assert r.status_code == 200, r.text
    lead_uid = r.json()["lead_uid"]
    c = client.post(f"{BASE_URL}/api/leads/{lead_uid}/convert", json={})
    assert c.status_code == 200, c.text
    d = c.json()
    return {"lead_uid": lead_uid,
            "client_uid": d["client"]["client_uid"],
            "case_uid": d["case"]["case_uid"]}


@pytest.fixture(scope="session")
def application(client, ent):
    """Create a lender application on the fixture case."""
    lenders = client.get(f"{BASE_URL}/api/lenders").json()
    lender_id = lenders[0]["lender_id"]
    r = client.post(f"{BASE_URL}/api/applications", json={
        "case_uid": ent["case_uid"], "lender_id": lender_id,
        "amount_requested": 5000000, "lender_rm": "TEST_QA RM"})
    assert r.status_code == 200, r.text
    return {"application_uid": r.json()["application_uid"], "lender_id": lender_id}
