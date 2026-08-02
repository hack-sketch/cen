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

    # Verify Credit Direction: Booker debited (-12 -> 38), Provider credited (+12 -> 22)
    db_session.refresh(booker)
    db_session.refresh(provider)
    assert booker.credit_balance == 38
    assert provider.credit_balance == 22
