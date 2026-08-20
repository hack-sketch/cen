def test_signup_and_login_success(client):
    # Test Signup
    signup_payload = {
        "name": "Test Resident",
        "email": "testres@cen.app",
        "password": "password123",
    }
    resp = client.post("/api/v1/auth/signup", json=signup_payload)
    assert resp.status_code == 201
    data = resp.json()
    assert "accessToken" in data or "access_token" in data
    user_data = data["user"]
    assert user_data["name"] == "Test Resident"
    assert user_data["email"] == "testres@cen.app"
    assert user_data["role"] == "resident"
    assert user_data["creditBalance"] == 0

    # Test Login
    login_payload = {
        "email": "testres@cen.app",
        "password": "password123",
    }
    resp_login = client.post("/api/v1/auth/login", json=login_payload)
    assert resp_login.status_code == 200
    token_data = resp_login.json()
    assert "accessToken" in token_data or "access_token" in token_data


def test_duplicate_email_signup_fails(client):
    signup_payload = {
        "name": "User One",
        "email": "duplicate@cen.app",
        "password": "password123",
    }
    client.post("/api/v1/auth/signup", json=signup_payload)

    # Attempt second signup with same email
    resp = client.post("/api/v1/auth/signup", json=signup_payload)
    assert resp.status_code == 400
    err = resp.json()
    assert err["code"] == "EMAIL_EXISTS"


def test_get_current_user_profile(client):
    signup_payload = {
        "name": "Auth User",
        "email": "authuser@cen.app",
        "password": "password123",
    }
    resp = client.post("/api/v1/auth/signup", json=signup_payload)
    token = resp.json().get("accessToken") or resp.json().get("access_token")

    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    profile = me_resp.json()
    assert profile["email"] == "authuser@cen.app"


def test_promote_user_rbac(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate

    # Create Owner user directly in DB
    owner_in = UserCreate(name="Platform Owner", email="owner@cen.app", password="password123")
    owner = create_user(db_session, owner_in, role="owner")

    # Create Resident user
    res_in = UserCreate(name="Resident User", email="resident@cen.app", password="password123")
    resident = create_user(db_session, res_in, role="resident")

    # Login as Owner to get token
    login_resp = client.post("/api/v1/auth/login", json={"email": "owner@cen.app", "password": "password123"})
    token = login_resp.json().get("accessToken") or login_resp.json().get("access_token")

    headers = {"Authorization": f"Bearer {token}"}
    promote_resp = client.post(f"/api/v1/users/{resident.id}/promote", headers=headers)
    assert promote_resp.status_code == 200
    promoted_user = promote_resp.json()
    assert promoted_user["isCoordinator"] is True
    assert promoted_user["role"] == "coordinator"


def test_forgot_password_endpoint(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate

    create_user(db_session, UserCreate(name="Reset User", email="resetuser@cen.app", password="password123"))

    # Test with valid existing user
    resp = client.post("/api/v1/auth/forgot-password", json={"email": "resetuser@cen.app"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    assert data["email"] == "resetuser@cen.app"
    assert "message" in data

    # Test with non-existing user (should still return 200 success without error leakage)
    resp_unknown = client.post("/api/v1/auth/forgot-password", json={"email": "unknown@cen.app"})
    assert resp_unknown.status_code == 200
    assert resp_unknown.json()["status"] == "success"

    # Test with invalid email format
    resp_invalid = client.post("/api/v1/auth/forgot-password", json={"email": "invalid-email"})
    assert resp_invalid.status_code == 422


def test_direct_password_reset_and_login_flow(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate

    create_user(db_session, UserCreate(name="Direct Reset User", email="directreset@cen.app", password="oldpassword123"))

    # Reset password to new password
    reset_resp = client.post(
        "/api/v1/auth/reset-password",
        json={"email": "directreset@cen.app", "new_password": "newpassword456"},
    )
    assert reset_resp.status_code == 200
    reset_data = reset_resp.json()
    assert reset_data["status"] == "success"

    # Verify old password fails login
    fail_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "directreset@cen.app", "password": "oldpassword123"},
    )
    assert fail_resp.status_code == 401

    # Verify new password succeeds login
    success_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "directreset@cen.app", "password": "newpassword456"},
    )
    assert success_resp.status_code == 200
    assert "accessToken" in success_resp.json() or "access_token" in success_resp.json()

    # Reset with unknown user should return 404
    unknown_resp = client.post(
        "/api/v1/auth/reset-password",
        json={"email": "nonexistent@cen.app", "new_password": "newpassword456"},
    )
    assert unknown_resp.status_code == 404


def test_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_user_identity_verification_lifecycle_and_rbac(client, db_session):
    from src.auth.service import create_user
    from src.users.schemas import UserCreate
    from src.societies.models import Society

    admin = create_user(
        db_session,
        UserCreate(name="Admin Verifier", email="adminverifier@cen.app", password="password123"),
        role="admin",
    )
    soc = Society(name="Verification Society", address="101 Tech Park", admin_id=admin.id, capacity=50, key="VERIFY-SOC")
    db_session.add(soc)
    db_session.commit()

    admin.society_id = soc.id
    db_session.commit()

    # 1. Admin verification status is 'verified' by default
    login_admin = client.post("/api/v1/auth/login", json={"email": "adminverifier@cen.app", "password": "password123"})
    admin_token = login_admin.json().get("accessToken") or login_admin.json().get("access_token")
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    me_admin = client.get("/api/v1/auth/me", headers=admin_headers)
    assert me_admin.status_code == 200
    assert me_admin.json().get("verificationStatus") == "verified"

    # 2. Resident with no society -> 'pending_society'
    res = create_user(
        db_session,
        UserCreate(name="New Resident", email="newres@cen.app", password="password123"),
        role="resident",
    )
    login_res = client.post("/api/v1/auth/login", json={"email": "newres@cen.app", "password": "password123"})
    res_token = login_res.json().get("accessToken") or login_res.json().get("access_token")
    res_headers = {"Authorization": f"Bearer {res_token}"}

    me_res = client.get("/api/v1/auth/me", headers=res_headers)
    assert me_res.json().get("verificationStatus") == "pending_society"

    # 3. Attach resident to society -> status becomes 'unverified'
    res.society_id = soc.id
    db_session.commit()

    me_res_joined = client.get("/api/v1/auth/me", headers=res_headers)
    assert me_res_joined.json().get("verificationStatus") == "unverified"

    # 4. Resident uploads ID proof -> status becomes 'pending'
    upload_resp = client.post(
        "/api/v1/users/me/id-proof",
        json={"idProofUrl": "mock://my-passport.pdf"},
        headers=res_headers,
    )
    assert upload_resp.status_code == 200
    assert upload_resp.json().get("verificationStatus") == "pending"
    assert upload_resp.json().get("idProofUploaded") is True
    assert upload_resp.json().get("idProofVerified") is False

    # 5. Admin verifies resident's ID proof -> status becomes 'verified'
    verify_resp = client.post(
        f"/api/v1/users/{res.id}/verify-id-proof?verified=true",
        headers=admin_headers,
    )
    assert verify_resp.status_code == 200
    assert verify_resp.json().get("verificationStatus") == "verified"
    assert verify_resp.json().get("idProofVerified") is True

    # 6. Admin rejects ID proof -> status transitions back to 'unverified' so user can re-upload
    reject_resp = client.post(
        f"/api/v1/users/{res.id}/verify-id-proof?verified=false",
        headers=admin_headers,
    )
    assert reject_resp.status_code == 200
    assert reject_resp.json().get("verificationStatus") == "unverified"
    assert reject_resp.json().get("idProofUploaded") is False
    assert reject_resp.json().get("idProofVerified") is False



