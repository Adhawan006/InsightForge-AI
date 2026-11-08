import pytest
import pytest_asyncio
import os
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.init_db import init_models

@pytest_asyncio.fixture(scope="session", autouse=True)
async def prepare_database():
    """Ensure database tables and seeds are ready before test execution."""
    await init_models()

@pytest_asyncio.fixture
async def client():
    """Async test client fixture for FastAPI endpoints."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient):
    """Provides valid JWT Bearer authentication headers via demo login."""
    res = await client.post("/api/v1/auth/demo-login")
    assert res.status_code == 200
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
