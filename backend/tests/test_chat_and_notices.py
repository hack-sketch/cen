def test_send_and_get_chat_messages(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate

    u1 = create_user(db_session, UserCreate(name="Alice", email="alice@cen.app", password="password123"))
    u2 = create_user(db_session, UserCreate(name="Bob", email="bob@cen.app", password="password123"))

    login_resp = client.post("/api/v1/auth/login", json={"email": "alice@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # Send message from Alice to Bob
    send_resp = client.post(
        "/api/v1/chat/messages",
        json={"receiverId": u2.id, "content": "Hi Bob, can I borrow your drill?"},
        headers=headers,
    )
    assert send_resp.status_code == 200
    msg_data = send_resp.json()
    assert msg_data["content"] == "Hi Bob, can I borrow your drill?"
    assert msg_data["senderName"] == "Alice"

    # Get conversation history between Alice and Bob
    hist_resp = client.get(f"/api/v1/chat/messages?otherUserId={u2.id}", headers=headers)
    assert hist_resp.status_code == 200
    history = hist_resp.json()
    assert len(history) == 1
    assert history[0]["content"] == "Hi Bob, can I borrow your drill?"


def test_create_and_list_notices(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society

    admin = create_user(db_session, UserCreate(name="Admin", email="noticeadmin@cen.app", password="password123"), role="admin")
    soc = Society(name="Notice Society", address="Notice St", admin_id=admin.id, capacity=20, key="NOT-SOC")
    db_session.add(soc)
    db_session.commit()
    admin.society_id = soc.id
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "noticeadmin@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    post_resp = client.post(
        "/api/v1/notices",
        json={
            "societyId": soc.id,
            "title": "Water Shutdown Notice",
            "content": "Water maintenance tomorrow at 10 AM",
            "category": "Maintenance",
        },
        headers=headers,
    )
    assert post_resp.status_code == 200
    n_data = post_resp.json()
    assert n_data["title"] == "Water Shutdown Notice"

    list_resp = client.get(f"/api/v1/notices?societyId={soc.id}", headers=headers)
    assert list_resp.status_code == 200
    notices = list_resp.json()
    assert len(notices) == 1
    assert notices[0]["title"] == "Water Shutdown Notice"
