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
