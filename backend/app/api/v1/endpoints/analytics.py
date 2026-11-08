from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.dataset import Dataset
from app.schemas.analytics import (
    AnalyticsQuery,
    AnalyticsResult,
    CorrelationMatrixResponse,
    ColumnDistribution,
)
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.post("/compute", response_model=AnalyticsResult, summary="Execute descriptive analytics computation")
async def compute_analytics(
    query: AnalyticsQuery,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Computes descriptive statistics, mean, variance, skewness, quantiles, and distributions."""
    result = await db.execute(select(Dataset).where(Dataset.id == query.dataset_id))
    dataset = result.scalars().first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    analytics_svc = AnalyticsService(dataset.file_path)
    return analytics_svc.execute_analytics(query)

@router.get("/{dataset_id}/correlations", response_model=CorrelationMatrixResponse, summary="Compute Pearson correlation matrix")
async def get_correlations(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Computes pairwise Pearson correlation coefficients for all numeric columns."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalars().first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    analytics_svc = AnalyticsService(dataset.file_path)
    return analytics_svc.get_correlations(dataset_id)

@router.get("/{dataset_id}/distributions", response_model=List[ColumnDistribution], summary="Compute visual distribution histograms")
async def get_distributions(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Computes histogram bins across numerical features formatted for Recharts."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalars().first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    analytics_svc = AnalyticsService(dataset.file_path)
    return analytics_svc.get_distributions()
