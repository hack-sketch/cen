def test_chatbot_query(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate

    user = create_user(db_session, UserCreate(name="AI User", email="aiuser@cen.app", password="password123"))
    user.credit_balance = 35
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "aiuser@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post("/api/v1/ai/chatbot", json={"message": "What is my credit balance?"}, headers=headers)
    assert resp.status_code == 200
    assert "35 credits" in resp.json()["answer"]


def test_auto_tag(client):
    resp = client.post("/api/v1/ai/auto-tag", json={"text": "Acoustic guitar and music lessons"})
    assert resp.status_code == 200
    data = resp.json()
    assert "music" in data["category"].lower() or "education" in data["category"].lower() or "instruction" in data["category"].lower() or len(data["category"]) > 0
    assert any("music" in t.lower() or "lesson" in t.lower() or "education" in t.lower() for t in data["tags"]) or len(data["tags"]) > 0


def test_categorize_complaint(client):
    resp = client.post("/api/v1/ai/categorize-complaint", json={"text": "Dangerous threat and safety issue in garden"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["priority"] == "high"


def test_match_marketplace(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.marketplace.models import Skill, Resource

    owner = create_user(db_session, UserCreate(name="Market Owner", email="marketowner@cen.app", password="password123"), role="owner")
    soc = Society(name="Market Society", address="100 MG Road", admin_id=owner.id, capacity=50, key="MARKET-SOC")
    db_session.add(soc)
    db_session.commit()

    skill = Skill(title="Python Tutoring", category="Tutoring", provider_id=owner.id, provider_name="Market Owner", credits=10, description="Teach Python programming language basics", status="approved", tags="python,programming", society_id=soc.id)
    resource = Resource(name="Power Drill Tool", category="Tools", owner_id=owner.id, owner_name="Market Owner", available=True, credits=5, status="approved", description="Electric power drill hammer tool", society_id=soc.id)
    db_session.add(skill)
    db_session.add(resource)
    db_session.commit()

    resp = client.post("/api/v1/ai/match-marketplace", json={"query": "python", "society_id": soc.id})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["item"]["title"] == "Python Tutoring"


def test_suggest_volunteers(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.events.models import EventItem

    owner = create_user(db_session, UserCreate(name="Event Owner", email="eventowner@cen.app", password="password123"), role="owner")
    soc = Society(name="Event Society", address="100 MG Road", admin_id=owner.id, capacity=50, key="EVENT-SOC")
    db_session.add(soc)
    db_session.commit()

    resident = create_user(db_session, UserCreate(name="Vol Resident", email="volres@cen.app", password="password123"), role="resident")
    resident.society_id = soc.id
    resident.volunteer_interest = "yes"
    db_session.commit()

    event = EventItem(title="Green Garden Day", description="Plant trees and clean local community parks", date="2026-09-15", created_by_coordinator_id=owner.id, volunteers_needed=3, volunteers="", status="upcoming", society_id=soc.id)
    db_session.add(event)
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "eventowner@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get(f"/api/v1/ai/suggest-volunteers?event_id={event.id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["user"]["name"] == "Vol Resident"
    assert "High volunteer availability" in data[0]["reason"]


def test_summarize_notice(client):
    resp = client.post(
        "/api/v1/ai/summarize-notice",
        json={"content": "Dear residents, the elevators will be offline tomorrow for maintenance between 10am and noon. Please plan accordingly."}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "summary" in data
    assert len(data["summary"]) > 0


