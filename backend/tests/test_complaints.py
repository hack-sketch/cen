def test_file_public_and_private_complaint(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society

    admin = create_user(db_session, UserCreate(name="Admin", email="compadmin@cen.app", password="password123"), role="admin")
    soc = Society(name="Comp Society", address="1 Comp Rd", admin_id=admin.id, capacity=50, key="COMP-SOC")
    db_session.add(soc)
    db_session.commit()

    admin.society_id = soc.id
    db_session.commit()

    coord = create_user(db_session, UserCreate(name="Target Coord", email="targetcoord@cen.app", password="password123"), role="coordinator")
    coord.is_coordinator = True
    coord.society_id = soc.id

    resident = create_user(db_session, UserCreate(name="Filer Resident", email="filer@cen.app", password="password123"), role="resident")
    resident.society_id = soc.id
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "filer@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # Public complaint
    pub_resp = client.post(
        "/api/v1/complaints",
        json={"title": "Noisy Elevator", "description": "Elevator makes loud noise", "category": "Maintenance", "isPrivate": False},
        headers=headers,
    )
    assert pub_resp.status_code == 201
    assert pub_resp.json()["isPrivate"] is False

    # Private complaint targeting coordinator
    priv_resp = client.post(
        "/api/v1/complaints",
        json={"title": "Unprofessional Behavior", "description": "Coordinator rude at meeting", "category": "Behavior", "targetCoordinatorId": coord.id},
        headers=headers,
    )
    assert priv_resp.status_code == 201
    assert priv_resp.json()["isPrivate"] is True
    assert priv_resp.json()["targetCoordinatorId"] == coord.id


def test_private_complaint_visibility_rule(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.complaints.models import Complaint

    owner = create_user(db_session, UserCreate(name="Owner", email="compowner@cen.app", password="password123"), role="owner")
    
    admin = create_user(db_session, UserCreate(name="Society Admin", email="sadmin@cen.app", password="password123"), role="admin")
    soc = Society(name="Vis Society", address="2 Vis Rd", admin_id=admin.id, capacity=50, key="VIS-SOC")
    db_session.add(soc)
    db_session.commit()

    admin.society_id = soc.id
    
    target_coord = create_user(db_session, UserCreate(name="Target Coord", email="tcoord@cen.app", password="password123"), role="coordinator")
    target_coord.is_coordinator = True
    target_coord.society_id = soc.id

    filer = create_user(db_session, UserCreate(name="Filer", email="filer2@cen.app", password="password123"), role="resident")
    filer.society_id = soc.id
    db_session.commit()

    # Private complaint filed by filer against target_coord
    priv_comp = Complaint(
        title="Biased Allocation",
        description="Favored certain residents",
        filed_by_user_id=filer.id,
        filed_by_user_name=filer.name,
        target_coordinator_id=target_coord.id,
        is_private=True,
        society_id=soc.id,
    )
    db_session.add(priv_comp)
    db_session.commit()

    # 1. Admin queries complaints -> CAN see private complaint
    adm_login = client.post("/api/v1/auth/login", json={"email": "sadmin@cen.app", "password": "password123"})
    adm_token = adm_login.json().get("accessToken") or adm_login.json().get("access_token")
    adm_resp = client.get(f"/api/v1/complaints?society_id={soc.id}", headers={"Authorization": f"Bearer {adm_token}"})
    assert adm_resp.status_code == 200
    assert len(adm_resp.json()) == 1

    # 2. Target Coordinator queries complaints -> CANNOT see private complaint against them
    coord_login = client.post("/api/v1/auth/login", json={"email": "tcoord@cen.app", "password": "password123"})
    coord_token = coord_login.json().get("accessToken") or coord_login.json().get("access_token")
    coord_resp = client.get(f"/api/v1/complaints?society_id={soc.id}", headers={"Authorization": f"Bearer {coord_token}"})
    assert coord_resp.status_code == 200
    assert len(coord_resp.json()) == 0

    # 3. Owner queries complaints -> CANNOT see private complaint against coordinator
    own_login = client.post("/api/v1/auth/login", json={"email": "compowner@cen.app", "password": "password123"})
    own_token = own_login.json().get("accessToken") or own_login.json().get("access_token")
    own_resp = client.get(f"/api/v1/complaints?society_id={soc.id}", headers={"Authorization": f"Bearer {own_token}"})
    assert own_resp.status_code == 200
    assert len(own_resp.json()) == 0


def test_resolve_complaint(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.complaints.models import Complaint

    admin = create_user(db_session, UserCreate(name="Society Admin", email="resadmin@cen.app", password="password123"), role="admin")
    soc = Society(name="Res Society", address="3 Res Rd", admin_id=admin.id, capacity=50, key="RES-SOC")
    db_session.add(soc)
    db_session.commit()
    admin.society_id = soc.id

    coord = create_user(db_session, UserCreate(name="Coord User", email="rescoord@cen.app", password="password123"), role="coordinator")
    coord.is_coordinator = True
    coord.society_id = soc.id

    filer = create_user(db_session, UserCreate(name="Filer User", email="resfiler@cen.app", password="password123"), role="resident")
    filer.society_id = soc.id
    db_session.commit()

    priv_comp = Complaint(title="Private Issue", description="Detail", filed_by_user_id=filer.id, filed_by_user_name=filer.name, target_coordinator_id=coord.id, is_private=True, society_id=soc.id)
    db_session.add(priv_comp)
    db_session.commit()

    # Coordinator attempting to resolve private complaint -> Rejects 403 Forbidden
    coord_login = client.post("/api/v1/auth/login", json={"email": "rescoord@cen.app", "password": "password123"})
    coord_token = coord_login.json().get("accessToken") or coord_login.json().get("access_token")
    coord_fail = client.post(f"/api/v1/complaints/{priv_comp.id}/resolve", json={"resolutionNotes": "Dismissed"}, headers={"Authorization": f"Bearer {coord_token}"})
    assert coord_fail.status_code == 403

    # Admin resolves private complaint -> Succeeds
    adm_login = client.post("/api/v1/auth/login", json={"email": "resadmin@cen.app", "password": "password123"})
    adm_token = adm_login.json().get("accessToken") or adm_login.json().get("access_token")
    adm_succ = client.post(f"/api/v1/complaints/{priv_comp.id}/resolve", json={"resolutionNotes": "Addressed during meeting"}, headers={"Authorization": f"Bearer {adm_token}"})
    assert adm_succ.status_code == 200
    assert adm_succ.json()["status"] == "resolved"
    assert adm_succ.json()["resolutionNotes"] == "Addressed during meeting"
