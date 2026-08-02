def test_get_wallet_balance(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate

    user = create_user(db_session, UserCreate(name="Wallet User", email="wuser@cen.app", password="password123"))
    user.credit_balance = 45
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "wuser@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/api/v1/wallet/balance", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["creditBalance"] == 45


def test_successful_credit_transfer(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate

    sender = create_user(db_session, UserCreate(name="Sender User", email="sender@cen.app", password="password123"))
    receiver = create_user(db_session, UserCreate(name="Receiver User", email="receiver@cen.app", password="password123"))

    sender.credit_balance = 50
    receiver.credit_balance = 10
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "sender@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    transfer_payload = {
        "toUserId": receiver.id,
        "amount": 15,
        "description": "Bicycle repair payment",
    }
    tx_resp = client.post("/api/v1/wallet/transfer", json=transfer_payload, headers=headers)
    assert tx_resp.status_code == 200

    # Verify balances
    db_session.refresh(sender)
    db_session.refresh(receiver)
    assert sender.credit_balance == 35
    assert receiver.credit_balance == 25

    # Verify transactions logged for sender
    sender_tx_resp = client.get("/api/v1/wallet/transactions", headers=headers)
    assert sender_tx_resp.status_code == 200
    tx_list = sender_tx_resp.json()
    assert len(tx_list) == 1
    assert tx_list[0]["type"] == "spent"
    assert tx_list[0]["amount"] == 15


def test_insufficient_funds_transfer_rejected(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate

    poor_user = create_user(db_session, UserCreate(name="Poor User", email="poor@cen.app", password="password123"))
    rich_user = create_user(db_session, UserCreate(name="Rich User", email="rich@cen.app", password="password123"))

    poor_user.credit_balance = 5
    rich_user.credit_balance = 100
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "poor@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    transfer_payload = {
        "toUserId": rich_user.id,
        "amount": 20,  # Exceeds available balance of 5
        "description": "Overdraft test",
    }
    resp = client.post("/api/v1/wallet/transfer", json=transfer_payload, headers=headers)
    assert resp.status_code == 400
    err = resp.json()
    assert err["code"] == "INSUFFICIENT_CREDITS"

    # Verify balances remain untouched
    db_session.refresh(poor_user)
    db_session.refresh(rich_user)
    assert poor_user.credit_balance == 5
    assert rich_user.credit_balance == 100


def test_self_transfer_rejected(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate

    user = create_user(db_session, UserCreate(name="Self User", email="self@cen.app", password="password123"))
    user.credit_balance = 50
    db_session.commit()

    login_resp = client.post("/api/v1/auth/login", json={"email": "self@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "toUserId": user.id,
        "amount": 10,
        "description": "Self transfer",
    }
    resp = client.post("/api/v1/wallet/transfer", json=payload, headers=headers)
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID_TRANSFER"
