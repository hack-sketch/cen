def test_create_skill_and_resource(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society

    owner = create_user(db_session, UserCreate(name="Owner", email="mowner@cen.app", password="password123"), role="owner")
    soc = Society(name="Marketplace Society", address="1 Market St", admin_id=owner.id, capacity=50, key="MP-SOC")
    db_session.add(soc)
    db_session.commit()

    res_user = create_user(db_session, UserCreate(name="Resident Provider", email="resprov@cen.app", password="password123"), role="resident")
    res_user.society_id = soc.id
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "resprov@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # Create Skill
    skill_resp = client.post(
        "/api/v1/marketplace/skills",
        json={"title": "Guitar Lessons", "category": "Music", "credits": 5, "description": "Basic acoustic guitar", "tags": ["music", "guitar"]},
        headers=headers,
    )
    assert skill_resp.status_code == 201
    skill_data = skill_resp.json()
    assert skill_data["status"] == "pending"
    assert skill_data["providerName"] == "Resident Provider"

    # Create Resource
    res_resp = client.post(
        "/api/v1/marketplace/resources",
        json={"name": "Lawn Mower", "category": "Tools", "credits": 3, "description": "Electric mower"},
        headers=headers,
    )
    assert res_resp.status_code == 201
    res_data = res_resp.json()
    assert res_data["status"] == "pending"
    assert res_data["available"] is True


def test_no_self_approval_guard(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.marketplace.models import Skill

    owner = create_user(db_session, UserCreate(name="Owner", email="owner_nsa@cen.app", password="password123"), role="owner")
    soc = Society(name="NSA Society", address="2 NSA St", admin_id=owner.id, capacity=50, key="NSA-SOC")
    db_session.add(soc)
    db_session.commit()

    coord = create_user(db_session, UserCreate(name="Coord Self", email="coordself@cen.app", password="password123"), role="coordinator")
    coord.is_coordinator = True
    coord.society_id = soc.id
    db_session.commit()

    # Create skill owned by coord
    sk = Skill(title="Coord Skill", category="Tech", provider_id=coord.id, provider_name=coord.name, credits=4, description="Tech help", society_id=soc.id)
    db_session.add(sk)
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "coordself@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # Coordinator attempting to approve their own skill listing -> Fails 403 Forbidden
    appr_resp = client.post(f"/api/v1/marketplace/skills/{sk.id}/approve", headers=headers)
    assert appr_resp.status_code == 403
    assert "Coordinators cannot approve their own" in appr_resp.json()["detail"]


def test_approval_by_another_coordinator(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.marketplace.models import Skill

    owner = create_user(db_session, UserCreate(name="Owner", email="owner_appr@cen.app", password="password123"), role="owner")
    soc = Society(name="Appr Society", address="3 Appr St", admin_id=owner.id, capacity=50, key="APPR-SOC")
    db_session.add(soc)
    db_session.commit()

    coord1 = create_user(db_session, UserCreate(name="Coord One", email="coord1@cen.app", password="password123"), role="coordinator")
    coord1.is_coordinator = True
    coord1.society_id = soc.id

    coord2 = create_user(db_session, UserCreate(name="Coord Two", email="coord2@cen.app", password="password123"), role="coordinator")
    coord2.is_coordinator = True
    coord2.society_id = soc.id
    db_session.commit()

    # Skill listed by coord1
    sk = Skill(title="Yoga Class", category="Fitness", provider_id=coord1.id, provider_name=coord1.name, credits=3, description="Morning yoga", society_id=soc.id)
    db_session.add(sk)
    db_session.commit()

    # Login as coord2 (different coordinator) to approve
    login_resp = client.post("/api/v1/auth/login", json={"email": "coord2@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    appr_resp = client.post(f"/api/v1/marketplace/skills/{sk.id}/approve", headers=headers)
    assert appr_resp.status_code == 200
    assert appr_resp.json()["status"] == "approved"


def test_book_skill_and_credit_direction(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.marketplace.models import Skill

    owner = create_user(db_session, UserCreate(name="Owner", email="owner_book@cen.app", password="password123"), role="owner")
    soc = Society(name="Book Society", address="4 Book St", admin_id=owner.id, capacity=50, key="BOOK-SOC")
    db_session.add(soc)
    db_session.commit()

    provider = create_user(db_session, UserCreate(name="Skill Provider", email="provider@cen.app", password="password123"), role="resident")
    provider.society_id = soc.id
    provider.credit_balance = 10

    booker = create_user(db_session, UserCreate(name="Skill Booker", email="booker@cen.app", password="password123"), role="resident")
    booker.society_id = soc.id
    booker.credit_balance = 50
    db_session.commit()

    # Approved skill costing 12 credits
    sk = Skill(title="Bike Repair", category="Services", provider_id=provider.id, provider_name=provider.name, credits=12, description="Fix brakes", status="approved", society_id=soc.id)
    db_session.add(sk)
    db_session.commit()

    # Booker logs in and books skill
    login_resp = client.post("/api/v1/auth/login", json={"email": "booker@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    book_resp = client.post(f"/api/v1/marketplace/skills/{sk.id}/book", headers=headers)
    assert book_resp.status_code == 200
    booking_id = book_resp.json()["id"]
    assert book_resp.json()["status"] == "pending_owner_approval"

    # Provider logs in and approves booking
    prov_login = client.post("/api/v1/auth/login", json={"email": "provider@cen.app", "password": "password123"})
    prov_token = prov_login.json().get("accessToken") or prov_login.json().get("access_token")
    prov_headers = {"Authorization": f"Bearer {prov_token}"}
    
    appr_resp = client.post(f"/api/v1/marketplace/bookings/{booking_id}/approve", headers=prov_headers)
    assert appr_resp.status_code == 200
    assert appr_resp.json()["status"] == "approved"

    # Verify Credit Direction: Booker debited (-12 -> 38), Provider credited (+12 -> 22)
    db_session.refresh(booker)
    db_session.refresh(provider)
    assert booker.credit_balance == 38
    assert provider.credit_balance == 22


def test_coordinator_rejection_requires_reason_and_records_remarks(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.marketplace.models import Skill, Resource

    owner = create_user(db_session, UserCreate(name="Owner", email="owner_rej@cen.app", password="password123"), role="owner")
    soc = Society(name="Rej Society", address="5 Rej St", admin_id=owner.id, capacity=50, key="REJ-SOC")
    db_session.add(soc)
    db_session.commit()

    coord = create_user(db_session, UserCreate(name="Coord Rej", email="coord_rej@cen.app", password="password123"), role="coordinator")
    coord.is_coordinator = True
    coord.society_id = soc.id

    resident = create_user(db_session, UserCreate(name="Resident Prov", email="res_rej@cen.app", password="password123"), role="resident")
    resident.society_id = soc.id
    db_session.commit()

    sk = Skill(title="Unclear Skill", category="General", provider_id=resident.id, provider_name=resident.name, credits=10, description="help with stuff", status="pending", society_id=soc.id)
    res = Resource(name="Broken Lawn Mower", category="Tools", owner_id=resident.id, owner_name=resident.name, available=True, credits=2, description="mower missing blades", status="pending", society_id=soc.id)
    db_session.add(sk)
    db_session.add(res)
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "coord_rej@cen.app", "password": "password123"})
    coord_token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {coord_token}"}

    # 1. Rejecting without reason or empty string fails
    empty_rej_resp = client.post(f"/api/v1/marketplace/skills/{sk.id}/reject", json={"rejectionReason": ""}, headers=headers)
    assert empty_rej_resp.status_code in [400, 422]

    # 2. Rejecting skill with valid feedback succeeds
    valid_rej_resp = client.post(
        f"/api/v1/marketplace/skills/{sk.id}/reject",
        json={"rejectionReason": "Please provide a more detailed syllabus and prerequisite requirements."},
        headers=headers,
    )
    assert valid_rej_resp.status_code == 200
    sk_data = valid_rej_resp.json()
    assert sk_data["status"] == "rejected"
    assert sk_data["rejectionReason"] == "Please provide a more detailed syllabus and prerequisite requirements."

    # 3. Rejecting resource with valid feedback succeeds
    res_rej_resp = client.post(
        f"/api/v1/marketplace/resources/{res.id}/reject",
        json={"rejectionReason": "Tools must be in full working condition with safety guard installed."},
        headers=headers,
    )
    assert res_rej_resp.status_code == 200
    res_data = res_rej_resp.json()
    assert res_data["status"] == "rejected"
    assert res_data["rejectionReason"] == "Tools must be in full working condition with safety guard installed."


def test_resident_edit_and_resubmit_workflow(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.marketplace.models import Skill, Resource

    owner = create_user(db_session, UserCreate(name="Owner", email="owner_edit@cen.app", password="password123"), role="owner")
    soc = Society(name="Edit Society", address="6 Edit St", admin_id=owner.id, capacity=50, key="EDIT-SOC")
    db_session.add(soc)
    db_session.commit()

    coord = create_user(db_session, UserCreate(name="Coord Reviewer", email="coord_rev@cen.app", password="password123"), role="coordinator")
    coord.is_coordinator = True
    coord.society_id = soc.id

    resident = create_user(db_session, UserCreate(name="Resident Editor", email="res_edit@cen.app", password="password123"), role="resident")
    resident.society_id = soc.id
    db_session.commit()

    # Pre-existing rejected listings
    sk = Skill(title="Old Skill", category="General", provider_id=resident.id, provider_name=resident.name, credits=10, description="Old description", status="rejected", rejection_reason="Too vague", society_id=soc.id)
    res = Resource(name="Old Tool", category="Tools", owner_id=resident.id, owner_name=resident.name, available=False, credits=5, description="Needs repair", status="rejected", rejection_reason="Clarify safety", society_id=soc.id)
    db_session.add(sk)
    db_session.add(res)
    db_session.commit()

    # Resident logs in to edit & resubmit
    login_resp = client.post("/api/v1/auth/login", json={"email": "res_edit@cen.app", "password": "password123"})
    res_token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    res_headers = {"Authorization": f"Bearer {res_token}"}

    # 1. Edit skill -> status automatically shifts to pending and rejection_reason is cleared
    edit_sk_resp = client.put(
        f"/api/v1/marketplace/skills/{sk.id}",
        json={
            "title": "Comprehensive Calculus Tutoring",
            "category": "Tutoring",
            "credits": 6,
            "description": "Step-by-step calculus exam preparation with practice sheets.",
            "tags": ["math", "calculus", "tutoring"],
        },
        headers=res_headers,
    )
    assert edit_sk_resp.status_code == 200
    sk_updated = edit_sk_resp.json()
    assert sk_updated["title"] == "Comprehensive Calculus Tutoring"
    assert sk_updated["status"] == "pending"
    assert sk_updated["rejectionReason"] is None

    # 2. Edit resource -> status automatically shifts to pending, available=True, rejection_reason is cleared
    edit_res_resp = client.put(
        f"/api/v1/marketplace/resources/{res.id}",
        json={
            "name": "High-Pressure Washer (Safety Tested)",
            "category": "Tools",
            "credits": 4,
            "description": "Complete washer unit with safety lock and 10m extension hose.",
        },
        headers=res_headers,
    )
    assert edit_res_resp.status_code == 200
    res_updated = edit_res_resp.json()
    assert res_updated["name"] == "High-Pressure Washer (Safety Tested)"
    assert res_updated["status"] == "pending"
    assert res_updated["available"] is True
    assert res_updated["rejectionReason"] is None

    # 3. Coordinator logs in and approves newly resubmitted items
    coord_login = client.post("/api/v1/auth/login", json={"email": "coord_rev@cen.app", "password": "password123"})
    coord_token = coord_login.json().get("accessToken") or coord_login.json().get("access_token")
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    appr_sk = client.post(f"/api/v1/marketplace/skills/{sk.id}/approve", headers=coord_headers)
    assert appr_sk.status_code == 200
    assert appr_sk.json()["status"] == "approved"

    appr_res = client.post(f"/api/v1/marketplace/resources/{res.id}/approve", headers=coord_headers)
    assert appr_res.status_code == 200
    assert appr_res.json()["status"] == "approved"

