def test_create_event_operational_gating(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society

    owner = create_user(db_session, UserCreate(name="Owner", email="evowner@cen.app", password="password123"), role="owner")
    
    # Non-operational society (coordinator_count = 1)
    soc_non_op = Society(name="Non Op Society", address="1 NonOp Rd", admin_id=owner.id, coordinator_count=1, key="NONOP-SOC")
    db_session.add(soc_non_op)

    # Operational society (coordinator_count = 2)
    soc_op = Society(name="Op Society", address="2 Op Rd", admin_id=owner.id, coordinator_count=2, key="OP-SOC")
    db_session.add(soc_op)
    db_session.commit()

    coord = create_user(db_session, UserCreate(name="Coord Event", email="coordev@cen.app", password="password123"), role="coordinator")
    coord.is_coordinator = True
    coord.society_id = soc_non_op.id
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "coordev@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # Attempt to create event in non-operational society -> Fails 403 Forbidden
    event_payload = {"title": "Cleanup Day", "description": "Park cleaning", "date": "2026-08-01", "volunteersNeeded": 5}
    fail_resp = client.post("/api/v1/events", json=event_payload, headers=headers)
    assert fail_resp.status_code == 403
    assert "Society is not operational" in fail_resp.json()["detail"]

    # Assign coord to operational society -> Succeeds
    coord.society_id = soc_op.id
    db_session.commit()

    succ_resp = client.post("/api/v1/events", json=event_payload, headers=headers)
    assert succ_resp.status_code == 201
    assert succ_resp.json()["title"] == "Cleanup Day"


def test_volunteer_request_and_approval(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.events.models import EventItem

    owner = create_user(db_session, UserCreate(name="Owner", email="owner_vol@cen.app", password="password123"), role="owner")
    soc = Society(name="Vol Society", address="3 Vol Rd", admin_id=owner.id, coordinator_count=2, key="VOL-SOC")
    db_session.add(soc)
    db_session.commit()

    coord = create_user(db_session, UserCreate(name="Coord Vol", email="coordvol@cen.app", password="password123"), role="coordinator")
    coord.is_coordinator = True
    coord.society_id = soc.id

    resident = create_user(db_session, UserCreate(name="Resident Vol", email="resvol@cen.app", password="password123"), role="resident")
    resident.society_id = soc.id
    db_session.commit()

    event = EventItem(title="Tree Plantation", description="Planting trees", date="2026-08-15", created_by_coordinator_id=coord.id, volunteers_needed=10, volunteers="", society_id=soc.id)
    db_session.add(event)
    db_session.commit()

    # 1. Resident requests to volunteer
    res_login = client.post("/api/v1/auth/login", json={"email": "resvol@cen.app", "password": "password123"})
    res_token = res_login.json().get("accessToken") or res_login.json().get("access_token")
    res_headers = {"Authorization": f"Bearer {res_token}"}

    vol_resp = client.post(f"/api/v1/events/{event.id}/volunteer", headers=res_headers)
    assert vol_resp.status_code == 201
    vr_id = vol_resp.json()["id"]

    # 2. Coordinator approves volunteer request
    coord_login = client.post("/api/v1/auth/login", json={"email": "coordvol@cen.app", "password": "password123"})
    coord_token = coord_login.json().get("accessToken") or coord_login.json().get("access_token")
    coord_headers = {"Authorization": f"Bearer {coord_token}"}

    appr_resp = client.post(f"/api/v1/events/volunteer-requests/{vr_id}/approve", headers=coord_headers)
    assert appr_resp.status_code == 200
    assert appr_resp.json()["status"] == "approved"

    # Verify resident ID is appended to event.volunteers list
    db_session.refresh(event)
    assert resident.id in event.volunteers


def test_volunteer_withdrawal(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.events.models import EventItem, VolunteerRequest

    owner = create_user(db_session, UserCreate(name="Owner", email="owner_wdr@cen.app", password="password123"), role="owner")
    soc = Society(name="Wdr Society", address="4 Wdr Rd", admin_id=owner.id, coordinator_count=2, key="WDR-SOC")
    db_session.add(soc)
    db_session.commit()

    resident = create_user(db_session, UserCreate(name="Resident Wdr", email="reswdr@cen.app", password="password123"), role="resident")
    resident.society_id = soc.id
    db_session.commit()

    event = EventItem(title="Book Drive", description="Collecting books", date="2026-08-20", created_by_coordinator_id="c1", volunteers_needed=4, volunteers=resident.id, society_id=soc.id)
    db_session.add(event)
    db_session.commit()

    vr = VolunteerRequest(event_id=event.id, event_title=event.title, resident_id=resident.id, resident_name=resident.name, type="self-requested", status="approved")
    db_session.add(vr)
    db_session.commit()

    # Resident withdraws from event
    login_resp = client.post("/api/v1/auth/login", json={"email": "reswdr@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    wdr_resp = client.post(f"/api/v1/events/volunteer-requests/{vr.id}/withdraw", json={"leaveReason": "Traveling on weekend"}, headers=headers)
    assert wdr_resp.status_code == 200
    assert wdr_resp.json()["status"] == "left"
    assert wdr_resp.json()["leaveReason"] == "Traveling on weekend"

    # Verify resident ID was removed from event.volunteers
    db_session.refresh(event)
    assert resident.id not in event.volunteers


def test_direct_event_leave(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.events.models import EventItem

    owner = create_user(db_session, UserCreate(name="Owner Direct", email="owner_direct@cen.app", password="password123"), role="owner")
    soc = Society(name="Direct Society", address="5 Direct Rd", admin_id=owner.id, coordinator_count=2, key="DIR-SOC")
    db_session.add(soc)
    db_session.commit()

    resident = create_user(db_session, UserCreate(name="Resident Direct", email="resdirect@cen.app", password="password123"), role="resident")
    resident.society_id = soc.id
    db_session.commit()

    event = EventItem(title="Tree Planting", description="Planting trees", date="2026-09-01", created_by_coordinator_id="c2", volunteers_needed=5, volunteers=resident.id, society_id=soc.id)
    db_session.add(event)
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "resdirect@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    leave_resp = client.post(f"/api/v1/events/{event.id}/leave", json={"leaveReason": "Schedule overlap"}, headers=headers)
    assert leave_resp.status_code == 200
    assert resident.id not in leave_resp.json()["volunteers"]

    db_session.refresh(event)
    assert resident.id not in event.volunteers


def test_event_update_complete_and_delete_lifecycle(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.events.models import EventItem

    admin = create_user(
        db_session,
        UserCreate(name="Event Coordinator Admin", email="evadmin@cen.app", password="password123"),
        role="admin",
    )
    soc = Society(name="Event Manage Society", address="10 Manage Way", admin_id=admin.id, coordinator_count=2, key="MNG-SOC")
    db_session.add(soc)
    db_session.commit()

    admin.society_id = soc.id
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "evadmin@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Event
    create_resp = client.post(
        "/api/v1/events",
        json={
            "title": "Initial Community Cleanup",
            "description": "Clean common areas and planting",
            "date": "2026-10-01",
            "startTime": "2026-10-01T09:00:00Z",
            "endTime": "2026-10-01T12:00:00Z",
            "volunteersNeeded": 5,
            "color": "#d1fae5",
            "textColor": "#065f46",
        },
        headers=headers,
    )
    assert create_resp.status_code == 201
    ev_data = create_resp.json()
    event_id = ev_data["id"]

    # 2. Update Event Date & Title
    patch_resp = client.patch(
        f"/api/v1/events/{event_id}",
        json={
            "title": "Autumn Park Cleanup & Solar Demo",
            "date": "2026-10-05",
            "volunteersNeeded": 8,
            "color": "#fef3c7",
        },
        headers=headers,
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["title"] == "Autumn Park Cleanup & Solar Demo"
    assert patch_resp.json()["date"] == "2026-10-05"
    assert patch_resp.json()["volunteersNeeded"] == 8
    assert patch_resp.json()["color"] == "#fef3c7"

    # 3. Mark Event Complete
    complete_resp = client.post(f"/api/v1/events/{event_id}/complete", headers=headers)
    assert complete_resp.status_code == 200
    assert complete_resp.json()["status"] == "completed"

    # 4. Delete Event
    del_resp = client.delete(f"/api/v1/events/{event_id}", headers=headers)
    assert del_resp.status_code == 200

    # 5. Verify Event is deleted
    list_resp = client.get(f"/api/v1/events?society_id={soc.id}", headers=headers)
    assert not any(e["id"] == event_id for e in list_resp.json())


def test_volunteer_rejection_with_reason_and_reinvite_lifecycle(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.events.models import EventItem

    admin = create_user(
        db_session,
        UserCreate(name="Event Host Admin", email="hostadmin@cen.app", password="password123"),
        role="admin",
    )
    soc = Society(name="Rejection Test Society", address="10 Civic Center", admin_id=admin.id, coordinator_count=2, key="REJ-SOC")
    db_session.add(soc)
    db_session.commit()

    admin.society_id = soc.id
    db_session.commit()

    resident = create_user(
        db_session,
        UserCreate(name="Volunteer Applicant", email="applicant@cen.app", password="password123"),
        role="resident",
    )
    resident.society_id = soc.id
    db_session.commit()

    # Create event
    event = EventItem(
        title="Community Art Workshop",
        description="Setting up paints and canvases",
        date="2026-11-15",
        created_by_coordinator_id=admin.id,
        volunteers_needed=2,
        society_id=soc.id,
    )
    db_session.add(event)
    db_session.commit()

    # Resident requests to volunteer
    res_login = client.post("/api/v1/auth/login", json={"email": "applicant@cen.app", "password": "password123"})
    res_token = res_login.json().get("accessToken") or res_login.json().get("access_token")
    res_headers = {"Authorization": f"Bearer {res_token}"}

    req_resp = client.post(f"/api/v1/events/{event.id}/volunteer", headers=res_headers)
    assert req_resp.status_code == 201
    req_id = req_resp.json()["id"]
    assert req_resp.json()["status"] == "pending"

    # Coordinator rejects with reason
    admin_login = client.post("/api/v1/auth/login", json={"email": "hostadmin@cen.app", "password": "password123"})
    admin_token = admin_login.json().get("accessToken") or admin_login.json().get("access_token")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    rej_resp = client.post(
        f"/api/v1/events/volunteer-requests/{req_id}/reject",
        json={"rejectionReason": "Volunteer capacity reached for this shift"},
        headers=admin_headers,
    )
    assert rej_resp.status_code == 200
    assert rej_resp.json()["status"] == "rejected"
    assert rej_resp.json()["rejectionReason"] == "Volunteer capacity reached for this shift"

    # Coordinator later re-invites applicant (slots opened up)
    reinvite_resp = client.post(
        f"/api/v1/events/{event.id}/invite",
        json={"residentId": resident.id},
        headers=admin_headers,
    )
    assert reinvite_resp.status_code == 201
    assert reinvite_resp.json()["status"] == "pending"
    assert reinvite_resp.json()["type"] == "coordinator-invited"
    assert reinvite_resp.json()["rejectionReason"] is None

    # Resident accepts invitation
    acc_resp = client.post(f"/api/v1/events/volunteer-requests/{req_id}/approve", headers=res_headers)
    assert acc_resp.status_code == 200
    assert acc_resp.json()["status"] == "approved"


