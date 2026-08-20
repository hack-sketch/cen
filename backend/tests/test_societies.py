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


def test_society_search_by_name(client, db_session):
    from src.societies.models import Society

    soc1 = Society(name="Emerald Heights", address="100 Emerald Way", key="EMERALD-1", admin_id="u-admin")
    soc2 = Society(name="Sunset Boulevard", address="200 Sunset Rd", key="SUNSET-2", admin_id="u-admin")
    db_session.add_all([soc1, soc2])
    db_session.commit()

    # Search all
    res_all = client.get("/api/v1/societies")
    assert res_all.status_code == 200
    assert len(res_all.json()) >= 2

    # Search by name "Emerald"
    res_emerald = client.get("/api/v1/societies?name=Emerald")
    assert res_emerald.status_code == 200
    emerald_list = res_emerald.json()
    assert any(s["name"] == "Emerald Heights" for s in emerald_list)
    assert not any(s["name"] == "Sunset Boulevard" for s in emerald_list)

    # Search by query "Sunset"
    res_sunset = client.get("/api/v1/societies?query=Sunset")
    assert res_sunset.status_code == 200
    sunset_list = res_sunset.json()
    assert any(s["name"] == "Sunset Boulevard" for s in sunset_list)


def test_resident_leave_society_atomic(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society, Household, JoinRequest

    user = create_user(db_session, UserCreate(name="Leaving Res", email="leave@cen.app", password="password123"), role="resident")
    soc = Society(name="Leave Soc", address="1 Leave Rd", admin_id=user.id, key="LEAVE-1", coordinator_count=1)
    db_session.add(soc)
    db_session.flush()

    hh = Household(id="h-leave-1", society_id=soc.id, unit_number="L-1", claimed=True, claimed_by_user_id=user.id, occupants_count=1)
    db_session.add(hh)
    user.society_id = soc.id
    user.household_id = hh.id
    user.is_coordinator = True
    user.id_proof_uploaded = True
    user.id_proof_verified = True

    # Add a join request that should be wiped
    jr = JoinRequest(user_id=user.id, user_name=user.name, society_id=soc.id, household_id=hh.id, unit_number="L-1", status="approved")
    db_session.add(jr)
    db_session.commit()

    # Login to get token
    login_res = client.post("/api/v1/auth/login", json={"email": "leave@cen.app", "password": "password123"})
    token = login_res.json()["accessToken"]

    # Leave society
    leave_res = client.post("/api/v1/users/me/leave-society", headers={"Authorization": f"Bearer {token}"})
    assert leave_res.status_code == 200
    data = leave_res.json()
    assert data["societyId"] is None
    assert data["householdId"] is None
    assert data["isCoordinator"] is False
    assert data["idProofUploaded"] is False
    assert data["idProofVerified"] is False

    # Check database state
    db_session.refresh(hh)
    assert hh.claimed is False
    assert hh.claimed_by_user_id is None
    assert hh.occupants_count == 0

    # Ensure join requests are wiped
    remaining_jrs = db_session.query(JoinRequest).filter(JoinRequest.user_id == user.id).all()
    assert len(remaining_jrs) == 0

    # Calling leave again should fail with NOT_IN_SOCIETY
    leave_again = client.post("/api/v1/users/me/leave-society", headers={"Authorization": f"Bearer {token}"})
    assert leave_again.status_code == 400
    assert leave_again.json()["code"] == "NOT_IN_SOCIETY"



def test_deactivate_and_login_rejection(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate

    admin = create_user(db_session, UserCreate(name="Admin User", email="admin_deact@cen.app", password="password123"), role="admin")
    res = create_user(db_session, UserCreate(name="Res User", email="res_deact@cen.app", password="password123"), role="resident")

    # Admin logins
    login_adm = client.post("/api/v1/auth/login", json={"email": "admin_deact@cen.app", "password": "password123"})
    adm_token = login_adm.json()["accessToken"]

    # Admin deactivates resident
    deact_res = client.post(f"/api/v1/users/{res.id}/deactivate", headers={"Authorization": f"Bearer {adm_token}"})
    assert deact_res.status_code == 200
    assert deact_res.json()["isActive"] is False

    # Attempt login as deactivated user -> 403 Forbidden
    failed_login = client.post("/api/v1/auth/login", json={"email": "res_deact@cen.app", "password": "password123"})
    assert failed_login.status_code == 403
    assert failed_login.json()["code"] == "ACCOUNT_DEACTIVATED"


def test_coordinator_promotion_with_granular_privileges(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate

    admin = create_user(db_session, UserCreate(name="Admin User 2", email="admin_prom@cen.app", password="password123"), role="admin")
    res = create_user(db_session, UserCreate(name="Res User 2", email="res_prom@cen.app", password="password123"), role="resident")

    login_adm = client.post("/api/v1/auth/login", json={"email": "admin_prom@cen.app", "password": "password123"})
    adm_token = login_adm.json()["accessToken"]

    # Promote with can_manage_onboarding=True, can_deactivate_residents=True
    prom_res = client.post(
        f"/api/v1/users/{res.id}/promote",
        headers={"Authorization": f"Bearer {adm_token}"},
        json={"canManageOnboarding": True, "canDeactivateResidents": True},
    )
    assert prom_res.status_code == 200
    data = prom_res.json()
    assert data["isCoordinator"] is True
    assert data["canManageOnboarding"] is True
    assert data["canDeactivateResidents"] is True


def test_join_request_hierarchical_permissions(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society, Household, JoinRequest

    admin = create_user(db_session, UserCreate(name="Soc Admin", email="soc_adm@cen.app", password="password123"), role="admin")
    soc = Society(name="Perm Soc", address="2 Perm St", admin_id=admin.id, key="PERM-SOC")
    db_session.add(soc)
    db_session.flush()

    hh = Household(id="h-perm-1", society_id=soc.id, unit_number="P-101", claimed=True, claimed_by_user_id=None, occupants_count=1)
    db_session.add(hh)

    primary = create_user(db_session, UserCreate(name="Primary Lead", email="primary_lead@cen.app", password="password123"), role="resident")
    primary.society_id = soc.id
    primary.household_id = hh.id
    primary.is_primary_resident = True
    hh.claimed_by_user_id = primary.id

    secondary = create_user(db_session, UserCreate(name="Secondary Res", email="secondary_res@cen.app", password="password123"), role="resident")
    secondary.society_id = soc.id
    secondary.household_id = hh.id
    secondary.is_primary_resident = False

    applicant = create_user(db_session, UserCreate(name="Applicant User", email="applicant@cen.app", password="password123"), role="resident")

    jr = JoinRequest(
        user_id=applicant.id,
        user_name=applicant.name,
        user_email=applicant.email,
        society_id=soc.id,
        household_id=hh.id,
        unit_number="P-101",
        status="pending",
        approver_type="primary_resident",
        target_approver_id=primary.id,
    )
    db_session.add(jr)
    db_session.commit()

    # 1. Secondary resident tries to approve -> 403 Forbidden
    login_sec = client.post("/api/v1/auth/login", json={"email": "secondary_res@cen.app", "password": "password123"})
    sec_token = login_sec.json()["accessToken"]

    sec_appr = client.post(f"/api/v1/societies/join-requests/{jr.id}/approve", headers={"Authorization": f"Bearer {sec_token}"})
    assert sec_appr.status_code == 403
    assert sec_appr.json()["code"] == "FORBIDDEN_APPROVAL"

    # Secondary resident tries to reject -> 403 Forbidden
    sec_rej = client.post(f"/api/v1/societies/join-requests/{jr.id}/reject", headers={"Authorization": f"Bearer {sec_token}"})
    assert sec_rej.status_code == 403
    assert sec_rej.json()["code"] == "FORBIDDEN_APPROVAL"

    # Secondary resident lists join requests -> receives empty list
    sec_list = client.get(f"/api/v1/societies/{soc.id}/join-requests", headers={"Authorization": f"Bearer {sec_token}"})
    assert sec_list.status_code == 200
    assert len(sec_list.json()) == 0

    # 2. Primary lead approves -> 200 OK
    login_pri = client.post("/api/v1/auth/login", json={"email": "primary_lead@cen.app", "password": "password123"})
    pri_token = login_pri.json()["accessToken"]

    pri_appr = client.post(f"/api/v1/societies/join-requests/{jr.id}/approve", headers={"Authorization": f"Bearer {pri_token}"})
    assert pri_appr.status_code == 200
    assert pri_appr.json()["status"] == "approved"


def test_society_application_rejection_remarks_and_resubmit(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import SocietyApplication

    owner = create_user(db_session, UserCreate(name="Platform Owner", email="owner_app@cen.app", password="password123"), role="owner")
    applicant = create_user(db_session, UserCreate(name="App Creator", email="creator@cen.app", password="password123"), role="resident")

    # 1. Applicant submits application
    login_app = client.post("/api/v1/auth/login", json={"email": "creator@cen.app", "password": "password123"})
    app_token = login_app.json()["accessToken"]

    sub_res = client.post(
        "/api/v1/societies/applications",
        headers={"Authorization": f"Bearer {app_token}"},
        json={
            "societyName": "Green Hills",
            "address": "42 Hill Road",
            "applicantName": "App Creator",
            "applicantContact": "creator@cen.app",
            "reason": "Want community exchange for our neighborhood",
            "residentCount": 120,
            "membersPerHousehold": 4,
            "initialCredits": 15,
        },
    )
    assert sub_res.status_code == 201
    app_data = sub_res.json()
    app_id = app_data["id"]
    assert app_data["status"] == "pending"

    # 2. Owner rejects application with explanation remarks
    login_own = client.post("/api/v1/auth/login", json={"email": "owner_app@cen.app", "password": "password123"})
    own_token = login_own.json()["accessToken"]

    rej_res = client.post(
        f"/api/v1/societies/applications/{app_id}/reject",
        headers={"Authorization": f"Bearer {own_token}"},
        json={"rejectionReason": "Address documentation requires municipal society registration proof."},
    )
    assert rej_res.status_code == 200
    rej_data = rej_res.json()
    assert rej_data["status"] == "rejected"
    assert rej_data["rejectionReason"] == "Address documentation requires municipal society registration proof."

    # 3. Applicant queries their application and receives the remarks
    me_res = client.get("/api/v1/societies/applications/me", headers={"Authorization": f"Bearer {app_token}"})
    assert me_res.status_code == 200
    assert me_res.json()["status"] == "rejected"
    assert me_res.json()["rejectionReason"] == "Address documentation requires municipal society registration proof."

    # 4. Applicant edits and resubmits -> succeeds cleanly (purging old rejected record)
    resub_res = client.post(
        "/api/v1/societies/applications",
        headers={"Authorization": f"Bearer {app_token}"},
        json={
            "societyName": "Green Hills Enclave",
            "address": "42 Hill Road, Registered Block A",
            "applicantName": "App Creator",
            "applicantContact": "creator@cen.app",
            "reason": "Updated with official municipal registration details",
            "residentCount": 120,
            "membersPerHousehold": 4,
            "initialCredits": 15,
        },
    )
    assert resub_res.status_code == 201
    assert resub_res.json()["status"] == "pending"
    assert resub_res.json()["societyName"] == "Green Hills Enclave"


def test_community_suspension_lockdown_guard_and_revocation(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society, Household

    owner = create_user(db_session, UserCreate(name="Sys Owner", email="sysowner@cen.app", password="password123"), role="owner")
    resident = create_user(db_session, UserCreate(name="Lock Resident", email="lockres@cen.app", password="password123"), role="resident")

    soc = Society(name="North Star Society", address="500 Polar Way", admin_id=owner.id, capacity=50, key="NSTR-99")
    db_session.add(soc)
    db_session.commit()

    hh = Household(society_id=soc.id, unit_number="N-101", max_members=4)
    db_session.add(hh)
    db_session.commit()

    resident.society_id = soc.id
    resident.household_id = hh.id
    resident.is_coordinator = True
    db_session.commit()

    owner_login = client.post("/api/v1/auth/login", json={"email": "sysowner@cen.app", "password": "password123"})
    owner_token = owner_login.json()["accessToken"]

    res_login = client.post("/api/v1/auth/login", json={"email": "lockres@cen.app", "password": "password123"})
    res_token = res_login.json()["accessToken"]

    # 1. Owner suspends society with explicit reason
    suspend_res = client.post(
        f"/api/v1/societies/{soc.id}/suspend",
        headers={"Authorization": f"Bearer {owner_token}"},
        json={"reason": "Safety protocol compliance review."},
    )
    assert suspend_res.status_code == 200
    assert suspend_res.json()["status"] == "suspended"
    assert suspend_res.json()["suspensionReason"] == "Safety protocol compliance review."

    # 2. Resident tries to perform an operational call (e.g. list marketplace items) -> Blocked with 403 & SOCIETY_SUSPENDED
    blocked_res = client.get("/api/v1/marketplace/skills", headers={"Authorization": f"Bearer {res_token}"})
    assert blocked_res.status_code == 403
    assert blocked_res.json()["code"] == "SOCIETY_SUSPENDED"
    assert "Safety protocol compliance review" in blocked_res.json()["detail"]

    # 3. Resident can still query /users/me and society details
    me_resp = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {res_token}"})
    assert me_resp.status_code == 200

    soc_resp = client.get(f"/api/v1/societies/{soc.id}")
    assert soc_resp.status_code == 200
    assert soc_resp.json()["status"] == "suspended"

    # 4. Coordinator submits an appeal
    appeal_res = client.post(
        f"/api/v1/societies/{soc.id}/appeal-suspension",
        headers={"Authorization": f"Bearer {res_token}"},
        json={"appealReason": "Safety equipment certified and report attached."},
    )
    assert appeal_res.status_code == 200
    assert appeal_res.json()["suspensionAppeal"] == "Safety equipment certified and report attached."

    # 5. Resident can cleanly leave the suspended society
    leave_res = client.post("/api/v1/users/me/leave-society", headers={"Authorization": f"Bearer {res_token}"})
    assert leave_res.status_code == 200
    assert leave_res.json()["societyId"] is None

    # 6. Owner revokes suspension -> status becomes active
    revoke_res = client.post(f"/api/v1/societies/{soc.id}/revoke-suspension", headers={"Authorization": f"Bearer {owner_token}"})
    assert revoke_res.status_code == 200
    assert revoke_res.json()["status"] == "active"
    assert revoke_res.json()["suspensionReason"] is None




