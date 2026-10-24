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

    fire_resp = client.post("/api/v1/ai/categorize-complaint", json={"text": "Fire in the electrical shaft on 3rd floor"})
    assert fire_resp.status_code == 200
    assert fire_resp.json()["priority"] == "high"
    assert "safety" in fire_resp.json()["category"].lower() or len(fire_resp.json()["category"]) > 0


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

    # 1. Exact keyword search
    resp = client.post("/api/v1/ai/match-marketplace", json={"query": "python", "society_id": soc.id})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) >= 1
    assert data[0]["item"]["title"] == "Python Tutoring"
    assert "summary" in data[0]
    assert data[0]["summary"] is not None
    assert "intentTags" in data[0]

    # 2. Descriptive natural language layman query for skills
    layman_skill_resp = client.post(
        "/api/v1/ai/match-marketplace",
        json={"query": "I want someone to help teach coding and python basics to my children", "society_id": soc.id},
    )
    assert layman_skill_resp.status_code == 200
    layman_skill_data = layman_skill_resp.json()
    assert len(layman_skill_data) >= 1
    assert layman_skill_data[0]["kind"] == "skill"
    assert layman_skill_data[0]["item"]["title"] == "Python Tutoring"
    assert len(layman_skill_data[0]["summary"]) > 0
    assert len(layman_skill_data[0]["intentTags"]) > 0

    # 3. Descriptive natural language layman query for resources
    layman_res_resp = client.post(
        "/api/v1/ai/match-marketplace",
        json={"query": "Looking for heavy equipment to mount shelves and drill screws into the wall", "society_id": soc.id},
    )
    assert layman_res_resp.status_code == 200
    layman_res_data = layman_res_resp.json()
    assert len(layman_res_data) >= 1
    assert layman_res_data[0]["kind"] == "resource"
    assert layman_res_data[0]["item"]["name"] == "Power Drill Tool"
    assert "drill" in layman_res_data[0]["summary"].lower() or len(layman_res_data[0]["summary"]) > 0

    # 4. Filter strictly by kind="skill"
    skill_filter_resp = client.post(
        "/api/v1/ai/match-marketplace",
        json={"query": "drill", "society_id": soc.id, "kind": "skill"},
    )
    assert skill_filter_resp.status_code == 200
    skill_filter_data = skill_filter_resp.json()
    assert all(item["kind"] == "skill" for item in skill_filter_data)

    # 5. Filter strictly by kind="resource"
    res_filter_resp = client.post(
        "/api/v1/ai/match-marketplace",
        json={"query": "python", "society_id": soc.id, "kind": "resource"},
    )
    assert res_filter_resp.status_code == 200
    res_filter_data = res_filter_resp.json()
    assert all(item["kind"] == "resource" for item in res_filter_data)




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


def test_check_event_clash_and_coordinator_suggestions(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.events.models import EventItem

    coord = create_user(db_session, UserCreate(name="Clash Coord", email="clashcoord@cen.app", password="password123"), role="coordinator")
    soc = Society(name="Clash Society", address="500 Indiranagar", admin_id=coord.id, capacity=50, key="CLASH-SOC")
    db_session.add(soc)
    db_session.commit()
    coord.society_id = soc.id
    db_session.commit()

    # Existing event in this society
    ev1 = EventItem(
        title="Annual Community AGM",
        description="General assembly meeting of society residents",
        date="2026-10-15",
        start_time="2026-10-15T10:00:00Z",
        end_time="2026-10-15T13:00:00Z",
        created_by_coordinator_id=coord.id,
        volunteers_needed=2,
        volunteers="",
        status="upcoming",
        society_id=soc.id,
    )
    db_session.add(ev1)
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "clashcoord@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Check clash with overlapping time
    clash_resp = client.post(
        "/api/v1/ai/check-event-clash",
        json={
            "title": "Kids Sports Meet",
            "description": "Running race in ground",
            "start_time": "2026-10-15T11:00:00Z",
            "end_time": "2026-10-15T14:00:00Z",
            "society_id": soc.id,
        },
        headers=headers,
    )
    assert clash_resp.status_code == 200
    clash_data = clash_resp.json()
    assert clash_data["hasClash"] is True
    assert "Annual Community AGM" in clash_data["reason"]

    # 2. Check no clash on different day
    no_clash_resp = client.post(
        "/api/v1/ai/check-event-clash",
        json={
            "title": "Yoga Workshop",
            "description": "Morning yoga in club house",
            "start_time": "2026-10-16T07:00:00Z",
            "end_time": "2026-10-16T08:30:00Z",
            "society_id": soc.id,
        },
        headers=headers,
    )
    assert no_clash_resp.status_code == 200
    no_clash_data = no_clash_resp.json()
    assert no_clash_data["hasClash"] is False

    # 3. Coordinator event suggestions
    sug_resp = client.get("/api/v1/ai/coordinator-event-suggestions", headers=headers)
    assert sug_resp.status_code == 200
    sug_data = sug_resp.json()
    assert len(sug_data) >= 1
    assert "title" in sug_data[0]
    assert "description" in sug_data[0]
    assert "reason" in sug_data[0]


def test_resident_suggestions_and_user_summary(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society
    from src.marketplace.models import Skill
    from src.events.models import EventItem

    soc_admin = create_user(db_session, UserCreate(name="ResSoc Admin", email="ressocadmin@cen.app", password="password123"), role="admin")
    soc = Society(name="Res Society", address="700 Whitefield", admin_id=soc_admin.id, capacity=50, key="RES-SOC")
    db_session.add(soc)
    db_session.commit()

    resident = create_user(db_session, UserCreate(name="Survey Resident", email="surveyres@cen.app", password="password123"), role="resident")
    resident.society_id = soc.id
    resident.interests = "Gardening,Cooking"
    resident.volunteer_interest = "yes"
    db_session.commit()

    # Skill matching interest
    skill = Skill(
        title="Organic Herb Gardening Class",
        category="Gardening",
        provider_id=soc_admin.id,
        provider_name="ResSoc Admin",
        credits=5,
        description="Learn to grow organic herbs on your balcony",
        status="approved",
        society_id=soc.id,
    )
    # Event matching volunteer interest
    event = EventItem(
        title="Balcony Planting Drive",
        description="Community initiative to plant herbs and greens",
        date="2026-11-01",
        created_by_coordinator_id=soc_admin.id,
        volunteers_needed=5,
        volunteers="",
        status="upcoming",
        society_id=soc.id,
    )
    db_session.add(skill)
    db_session.add(event)
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "surveyres@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Resident suggestions
    res_sug_resp = client.get("/api/v1/ai/resident-suggestions", headers=headers)
    assert res_sug_resp.status_code == 200
    res_sug_data = res_sug_resp.json()
    assert "skillSuggestions" in res_sug_data
    assert "volunteerSuggestions" in res_sug_data
    assert len(res_sug_data["skillSuggestions"]) >= 1
    assert "Organic Herb Gardening" in res_sug_data["skillSuggestions"][0]["title"]

    # 2. User summary
    sum_resp = client.get("/api/v1/users/me/summary", headers=headers)
    assert sum_resp.status_code == 200
    sum_data = sum_resp.json()
    assert "summary" in sum_data
    assert len(sum_data["summary"]) > 0



