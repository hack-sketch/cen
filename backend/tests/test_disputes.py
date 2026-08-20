import pytest
from src.auth.service import create_user
from src.users.schemas import UserCreate
from src.societies.models import Society, Household
from src.disputes.models import Dispute


def test_file_and_resolve_trade_dispute(client, db_session):
    # Setup owner and society
    owner = create_user(db_session, UserCreate(name="Dispute Owner", email="dispowner@cen.app", password="password123"), role="owner")
    soc = Society(name="Dispute Society", address="10 Dispute Way", admin_id=owner.id, coordinator_count=2, key="DISP-SOC")
    db_session.add(soc)
    db_session.commit()

    hh = Household(society_id=soc.id, unit_number="A-101", max_members=4)
    db_session.add(hh)
    db_session.commit()

    # Create Primary Resident and Coordinator
    res = create_user(db_session, UserCreate(name="Resident Disputer", email="resdisp@cen.app", password="password123"), role="resident")
    res.society_id = soc.id
    res.household_id = hh.id
    res.is_primary_resident = True

    coord = create_user(db_session, UserCreate(name="Coord Mediator", email="coordmed@cen.app", password="password123"), role="coordinator")
    coord.society_id = soc.id
    coord.is_coordinator = True

    db_session.commit()

    # Login as resident
    login_resp = client.post("/api/v1/auth/login", json={"email": "resdisp@cen.app", "password": "password123"})
    res_token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    res_headers = {"Authorization": f"Bearer {res_token}"}

    # File trade dispute
    dispute_payload = {
        "bookingId": "bk-demo-101",
        "itemTitle": "Lawn Mower Lending",
        "itemType": "resource",
        "buyerId": res.id,
        "buyerName": res.name,
        "ownerId": coord.id,
        "ownerName": coord.name,
        "reason": "Resource was defective upon delivery."
    }

    file_resp = client.post("/api/v1/disputes", json=dispute_payload, headers=res_headers)
    assert file_resp.status_code == 201
    disp_data = file_resp.json()
    assert disp_data["reason"] == dispute_payload["reason"]
    assert disp_data["status"] == "open"
    dispute_id = disp_data["id"]

    # Login as coordinator to resolve dispute
    coord_login = client.post("/api/v1/auth/login", json={"email": "coordmed@cen.app", "password": "password123"})
    coord_token = coord_login.json().get("accessToken") or coord_login.json().get("access_token")
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    # List disputes for society
    list_resp = client.get(f"/api/v1/disputes?society_id={soc.id}", headers=coord_headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1

    # Update dispute status to resolved
    status_payload = {
        "status": "resolved",
        "resolutionNotes": "Mediated settlement agreed: resource replaced."
    }
    status_resp = client.put(f"/api/v1/disputes/{dispute_id}/status", json=status_payload, headers=coord_headers)
    assert status_resp.status_code == 200
    assert status_resp.json()["status"] == "resolved"
    assert "Mediated settlement" in status_resp.json()["resolutionNotes"]


def test_secondary_participant_justification_authorization(client, db_session):
    owner = create_user(db_session, UserCreate(name="Platform Owner", email="disp_owner@cen.app", password="password123"), role="owner")
    soc = Society(name="Fair Trade Society", address="200 Commerce Blvd", admin_id=owner.id, coordinator_count=1, key="FAIR-1")
    db_session.add(soc)
    db_session.commit()

    hh1 = Household(society_id=soc.id, unit_number="B-101", max_members=4)
    hh2 = Household(society_id=soc.id, unit_number="B-102", max_members=4)
    hh3 = Household(society_id=soc.id, unit_number="B-103", max_members=4)
    db_session.add_all([hh1, hh2, hh3])
    db_session.commit()

    buyer = create_user(db_session, UserCreate(name="Alice Buyer", email="alice@cen.app", password="password123"), role="resident")
    buyer.society_id = soc.id
    buyer.household_id = hh1.id

    seller = create_user(db_session, UserCreate(name="Bob Seller", email="bob@cen.app", password="password123"), role="resident")
    seller.society_id = soc.id
    seller.household_id = hh2.id

    outsider = create_user(db_session, UserCreate(name="Charlie Outsider", email="charlie@cen.app", password="password123"), role="resident")
    outsider.society_id = soc.id
    outsider.household_id = hh3.id

    db_session.commit()

    # Login tokens
    b_token = client.post("/api/v1/auth/login", json={"email": "alice@cen.app", "password": "password123"}).json()["accessToken"]
    s_token = client.post("/api/v1/auth/login", json={"email": "bob@cen.app", "password": "password123"}).json()["accessToken"]
    o_token = client.post("/api/v1/auth/login", json={"email": "charlie@cen.app", "password": "password123"}).json()["accessToken"]

    # 1. Buyer (filer) initiates dispute
    file_res = client.post(
        "/api/v1/disputes",
        headers={"Authorization": f"Bearer {b_token}"},
        json={
            "bookingId": "bk-trade-999",
            "itemTitle": "Drill Set Rental",
            "itemType": "resource",
            "buyerId": buyer.id,
            "buyerName": buyer.name,
            "ownerId": seller.id,
            "ownerName": seller.name,
            "reason": "Missing battery pack upon pickup.",
        },
    )
    assert file_res.status_code == 201
    dispute_id = file_res.json()["id"]
    assert file_res.json()["buyerId"] == buyer.id
    assert file_res.json()["ownerId"] == seller.id

    # 2. Secondary Participant (Seller - Bob) posts his defense/justification note -> Authorised 200 OK
    seller_note_res = client.put(
        f"/api/v1/disputes/{dispute_id}/note",
        headers={"Authorization": f"Bearer {s_token}"},
        json={"note": "Battery was fully charged and placed inside the plastic storage case."},
    )
    assert seller_note_res.status_code == 200
    assert seller_note_res.json()["ownerNote"] == "Battery was fully charged and placed inside the plastic storage case."

    # 3. Primary Filer (Buyer - Alice) posts her follow-up statement -> Authorised 200 OK
    buyer_note_res = client.post(
        f"/api/v1/disputes/{dispute_id}/note",
        headers={"Authorization": f"Bearer {b_token}"},
        json={"note": "Checked the case upon opening; battery slot was completely empty."},
    )
    assert buyer_note_res.status_code == 200
    assert buyer_note_res.json()["buyerNote"] == "Checked the case upon opening; battery slot was completely empty."

    # 4. Unrelated third party resident attempts to post note -> 403 Forbidden
    outsider_res = client.put(
        f"/api/v1/disputes/{dispute_id}/note",
        headers={"Authorization": f"Bearer {o_token}"},
        json={"note": "Random comment from neighbor."},
    )
    assert outsider_res.status_code == 403
    assert "not an authorized participant" in outsider_res.json()["detail"]

