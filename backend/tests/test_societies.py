def test_submit_and_approve_society_application(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate

    # Create Owner user
    owner = create_user(db_session, UserCreate(name="Owner", email="owner@cen.app", password="password123"), role="owner")
    
    # Create Applicant user
    applicant = create_user(db_session, UserCreate(name="Applicant Admin", email="applicant@cen.app", password="password123"), role="resident")

    # 1. Submit application
    app_payload = {
        "societyName": "Green Valley Society",
        "type": "Residential Apartment",
        "address": "100 Green Rd",
        "applicantName": applicant.name,
        "applicantContact": applicant.email,
        "reason": "Building a resilient community network",
        "residentCount": 150,
        "initialCredits": 15,
    }
    app_resp = client.post("/api/v1/societies/applications", json=app_payload)
    assert app_resp.status_code == 201
    app_data = app_resp.json()
    app_id = app_data["id"]

    # 2. Login as Owner & Approve Application
    login_resp = client.post("/api/v1/auth/login", json={"email": "owner@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    approve_resp = client.post(
        f"/api/v1/societies/applications/{app_id}/approve",
        json={"capacity": 150, "initialCredits": 15},
        headers=headers,
    )
    assert approve_resp.status_code == 200
    soc_data = approve_resp.json()
    assert soc_data["name"] == "Green Valley Society"
    assert soc_data["capacity"] == 150
    assert soc_data["initialCredits"] == 15
    assert "key" in soc_data

    # Check applicant user is now admin
    db_session.refresh(applicant)
    assert applicant.role == "admin"
    assert applicant.society_id == soc_data["id"]


def test_household_bulk_generation_and_capacity_cap(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society

    # Create Owner and Society with capacity 5
    owner = create_user(db_session, UserCreate(name="Owner", email="owner2@cen.app", password="password123"), role="owner")
    soc = Society(
        name="Small Society",
        address="1 Small Rd",
        admin_id=owner.id,
        capacity=5,
        initial_credits=10,
        key="SMALL-SOC",
    )
    db_session.add(soc)
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "owner2@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # Bulk add 4 units (A-101 to A-104) -> Succeeds
    bulk_payload = {
        "societyId": soc.id,
        "blocks": ["A"],
        "startUnit": 101,
        "endUnit": 104,
        "formatPattern": "{Block}-{Unit}",
    }
    resp = client.post("/api/v1/households/bulk", json=bulk_payload, headers=headers)
    assert resp.status_code == 201
    assert len(resp.json()) == 4

    # Attempting to add 2 more units (5 + 2 = 6 > capacity 5) -> Fails with CAPACITY_EXCEEDED
    bulk_fail_payload = {
        "societyId": soc.id,
        "blocks": ["A"],
        "startUnit": 105,
        "endUnit": 106,
        "formatPattern": "{Block}-{Unit}",
    }
    resp_fail = client.post("/api/v1/households/bulk", json=bulk_fail_payload, headers=headers)
    assert resp_fail.status_code == 400
    assert resp_fail.json()["code"] == "CAPACITY_EXCEEDED"


def test_join_request_approval_grants_initial_credits(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society, Household

    # Create Admin, Resident, Society (initialCredits = 20), and Household
    admin = create_user(db_session, UserCreate(name="Admin", email="adminsoc@cen.app", password="password123"), role="admin")
    soc = Society(name="Credit Society", address="2 Credit Rd", admin_id=admin.id, capacity=50, initial_credits=20, key="CRED-SOC")
    db_session.add(soc)
    db_session.commit()
    admin.society_id = soc.id
    db_session.commit()

    hh = Household(society_id=soc.id, unit_number="A-101")
    db_session.add(hh)
    db_session.commit()

    resident = create_user(db_session, UserCreate(name="New Resident", email="newres@cen.app", password="password123"), role="resident")
    assert resident.credit_balance == 0

    # Login as Resident and submit join request
    res_login = client.post("/api/v1/auth/login", json={"email": "newres@cen.app", "password": "password123"})
    res_token = res_login.json().get("accessToken") or res_login.json().get("access_token")
    res_headers = {"Authorization": f"Bearer {res_token}"}

    jr_resp = client.post(
        "/api/v1/societies/join-requests",
        json={"societyId": soc.id, "householdId": hh.id, "unitNumber": "A-101"},
        headers=res_headers,
    )
    assert jr_resp.status_code == 201
    jr_id = jr_resp.json()["id"]

    # Login as Admin and approve join request
    admin_login = client.post("/api/v1/auth/login", json={"email": "adminsoc@cen.app", "password": "password123"})
    admin_token = admin_login.json().get("accessToken") or admin_login.json().get("access_token")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    appr_resp = client.post(f"/api/v1/societies/join-requests/{jr_id}/approve", headers=admin_headers)
    assert appr_resp.status_code == 200

    # Verify Resident was granted initial_credits (20) and linked to society
    db_session.refresh(resident)
    assert resident.society_id == soc.id
    assert resident.household_id == hh.id
    assert resident.credit_balance == 20


def test_minimum_2_coordinators_operational_rule(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society

    owner = create_user(db_session, UserCreate(name="Owner", email="owner3@cen.app", password="password123"), role="owner")
    soc = Society(name="Gated Society", address="3 Gated Rd", admin_id=owner.id, capacity=50, coordinator_count=1, key="GATE-SOC")
    db_session.add(soc)
    db_session.commit()

    resp1 = client.get(f"/api/v1/societies/{soc.id}")
    assert resp1.status_code == 200
    assert resp1.json()["isOperational"] is False

    # Upgrade coordinator_count to 2
    soc.coordinator_count = 2
    db_session.commit()

    resp2 = client.get(f"/api/v1/societies/{soc.id}")
    assert resp2.status_code == 200
    assert resp2.json()["isOperational"] is True
