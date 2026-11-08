import pytest
import io
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_dataset_list_and_seeded_data(client: AsyncClient, auth_headers: dict):
    """Test listing datasets returns pre-seeded Dell telemetry dataset."""
    response = await client.get("/api/v1/datasets/", headers=auth_headers)
    assert response.status_code == 200
    datasets = response.json()
    assert isinstance(datasets, list)
    assert len(datasets) > 0
    assert "Dell APEX Cloud Telemetry Q3" in [d["name"] for d in datasets]

@pytest.mark.asyncio
async def test_dataset_upload_csv(client: AsyncClient, auth_headers: dict):
    """Test dynamic CSV upload, schema extraction, and summary."""
    csv_content = (
        "cluster_name,nodes_active,avg_cpu_pct,cluster_status\n"
        "Apex-Cluster-01,16,68.4,Healthy\n"
        "Apex-Cluster-02,32,84.1,Warning\n"
        "Apex-Cluster-03,8,42.0,Healthy\n"
    )
    files = {
        "file": ("test_cluster_metrics.csv", io.BytesIO(csv_content.encode("utf-8")), "text/csv")
    }
    data = {
        "name": "Integration Test Cluster Metrics",
        "description": "Synthetic telemetry payload for integration validation",
    }

    upload_res = await client.post(
        "/api/v1/datasets/upload",
        headers=auth_headers,
        files=files,
        data=data,
    )
    assert upload_res.status_code == 201
    dataset = upload_res.json()
    assert dataset["row_count"] == 3
    assert dataset["column_count"] == 4

    # Test preview
    preview_res = await client.get(
        f"/api/v1/datasets/{dataset['id']}/preview",
        headers=auth_headers,
    )
    assert preview_res.status_code == 200
    preview_data = preview_res.json()
    assert len(preview_data["data"]) == 3
    assert "Apex-Cluster-01" in [r["cluster_name"] for r in preview_data["data"]]

    # Test summary
    summary_res = await client.get(
        f"/api/v1/datasets/{dataset['id']}/summary",
        headers=auth_headers,
    )
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["row_count"] == 3
    assert summary["missing_cells_count"] == 0
