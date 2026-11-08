import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_intelligence_generation(client: AsyncClient, auth_headers: dict):
    """Test AI intelligence report generation."""
    # Fetch first seeded dataset
    list_res = await client.get("/api/v1/datasets/", headers=auth_headers)
    assert list_res.status_code == 200
    dataset = list_res.json()[0]

    payload = {
        "dataset_id": dataset["id"],
        "prompt": "Evaluate CPU utilization thresholds and identify IOPS bottleneck risks.",
        "focus_area": "OPERATIONAL",
    }
    response = await client.post(
        "/api/v1/intelligence/generate",
        headers=auth_headers,
        json=payload,
    )
    assert response.status_code == 200
    report = response.json()
    assert report["dataset_id"] == dataset["id"]
    assert "executive_summary" in report
    assert len(report["key_findings"]) > 0
    assert len(report["strategic_recommendations"]) > 0

@pytest.mark.asyncio
async def test_sql_generation(client: AsyncClient, auth_headers: dict):
    """Test natural language to SQL translation."""
    list_res = await client.get("/api/v1/datasets/", headers=auth_headers)
    assert list_res.status_code == 200
    dataset = list_res.json()[0]

    payload = {
        "dataset_id": dataset["id"],
        "prompt": "Find the average CPU utilization across all clusters.",
        "dialect": "postgresql",
    }
    response = await client.post(
        "/api/v1/intelligence/sql",
        headers=auth_headers,
        json=payload,
    )
    assert response.status_code == 200
    sql_data = response.json()
    assert "SELECT" in sql_data["sql_query"].upper()
    assert "explanation" in sql_data

@pytest.mark.asyncio
async def test_analytics_computation(client: AsyncClient, auth_headers: dict):
    """Test statistical profiling and correlation calculation."""
    list_res = await client.get("/api/v1/datasets/", headers=auth_headers)
    assert list_res.status_code == 200
    dataset = list_res.json()[0]

    # Correlations
    corr_res = await client.get(
        f"/api/v1/analytics/{dataset['id']}/correlations",
        headers=auth_headers,
    )
    assert corr_res.status_code == 200
    corr_data = corr_res.json()
    assert "correlation_matrix" in corr_data

    # Distributions
    dist_res = await client.get(
        f"/api/v1/analytics/{dataset['id']}/distributions",
        headers=auth_headers,
    )
    assert dist_res.status_code == 200
    distributions = dist_res.json()
    assert isinstance(distributions, list)
