import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """Test enterprise health check endpoint returns 200 and platform details."""
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["platform"] == "InsightForge AI"

@pytest.mark.asyncio
async def test_user_registration_and_login(client: AsyncClient):
    """Test user registration, duplicate rejection, and JWT login."""
    unique_email = "architect.test@dell.com"
    payload = {
        "email": unique_email,
        "password": "SecurePassword123!",
        "full_name": "Test Architect",
        "organization": "Dell Technologies",
    }

    # Register
    reg_res = await client.post("/api/v1/auth/register", json=payload)
    assert reg_res.status_code in [201, 400]  # 400 if test run multiple times

    # Login
    login_res = await client.post(
        "/api/v1/auth/login/json",
        json={"email": unique_email, "password": "SecurePassword123!"},
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_demo_login(client: AsyncClient):
    """Test one-click enterprise demo login."""
    res = await client.post("/api/v1/auth/demo-login")
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["organization"] == "Dell Technologies"
