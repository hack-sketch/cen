def test_owner_and_society_analytics(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society

    owner = create_user(db_session, UserCreate(name="Platform Owner", email="statowner@cen.app", password="password123"), role="owner")
    soc = Society(name="Stats Oasis", address="100 Analytics Way", admin_id=owner.id, capacity=50, key="STAT-SOC")
    db_session.add(soc)
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "statowner@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # Test Owner Global Analytics
    owner_resp = client.get("/api/v1/analytics/owner", headers=headers)
    assert owner_resp.status_code == 200
    owner_data = owner_resp.json()
    assert owner_data["totalSocieties"] >= 1

    # Test Society Performance Analytics
    soc_resp = client.get(f"/api/v1/analytics/society/{soc.id}", headers=headers)
    assert soc_resp.status_code == 200
    soc_data = soc_resp.json()
    assert soc_data["societyName"] == "Stats Oasis"


def test_owner_user_directory_and_permissions(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society, Household

    owner = create_user(db_session, UserCreate(name="Dir Owner", email="dirowner@cen.app", password="password123"), role="owner")
    resident = create_user(db_session, UserCreate(name="Dir Resident", email="dirres@cen.app", password="password123"), role="resident")

    soc = Society(name="Emerald Ridge", address="10 Ridge Way", admin_id=owner.id, capacity=30, key="EMR-100")
    db_session.add(soc)
    db_session.commit()

    hh = Household(society_id=soc.id, unit_number="A-101", max_members=4)
    db_session.add(hh)
    db_session.commit()

    resident.society_id = soc.id
    resident.household_id = hh.id
    db_session.commit()

    login_owner = client.post("/api/v1/auth/login", json={"email": "dirowner@cen.app", "password": "password123"})
    owner_token = login_owner.json()["accessToken"]

    login_res = client.post("/api/v1/auth/login", json={"email": "dirres@cen.app", "password": "password123"})
    res_token = login_res.json()["accessToken"]

    # 1. Owner query /analytics/owner/users -> 200 OK with rich directory
    resp = client.get("/api/v1/analytics/owner/users", headers={"Authorization": f"Bearer {owner_token}"})
    assert resp.status_code == 200
    users_list = resp.json()
    assert len(users_list) >= 2

    res_item = next((u for u in users_list if u["email"] == "dirres@cen.app"), None)
    assert res_item is not None
    assert res_item["name"] == "Dir Resident"
    assert res_item["societyName"] == "Emerald Ridge"
    assert res_item["householdUnit"] == "A-101"

    # 2. Resident query /analytics/owner/users -> 403 Forbidden
    res_forbidden = client.get("/api/v1/analytics/owner/users", headers={"Authorization": f"Bearer {res_token}"})
    assert res_forbidden.status_code == 403

    # 3. Global /users endpoint without society_id -> returns all registered users
    all_users_resp = client.get("/api/v1/users", headers={"Authorization": f"Bearer {owner_token}"})
    assert all_users_resp.status_code == 200
    assert len(all_users_resp.json()) >= 2

