"""Pydantic validation schemas package."""

from app.schemas.user import UserCreate, UserLogin, UserRead, UserUpdate
from app.schemas.token import Token, TokenPayload
from app.schemas.dataset import (
    DatasetCreate,
    DatasetRead,
    DatasetSummary,
    DatasetPreview,
    DatasetCleanRequest,
    DatasetCleanResult,
    ColumnDetail,
)
from app.schemas.analytics import (
    AnalyticsQuery,
    AnalyticsResult,
    ColumnStatistics,
    ColumnDistribution,
    DistributionBin,
    CorrelationMatrixResponse,
)
from app.schemas.intelligence import (
    IntelligenceQuery,
    IntelligenceReport,
    KeyFinding,
    Anomaly,
    SqlGenerationQuery,
    SqlGenerationResponse,
    AnalysisHistoryRead,
)

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserRead",
    "UserUpdate",
    "Token",
    "TokenPayload",
    "DatasetCreate",
    "DatasetRead",
    "DatasetSummary",
    "DatasetPreview",
    "DatasetCleanRequest",
    "DatasetCleanResult",
    "ColumnDetail",
    "AnalyticsQuery",
    "AnalyticsResult",
    "ColumnStatistics",
    "ColumnDistribution",
    "DistributionBin",
    "CorrelationMatrixResponse",
    "IntelligenceQuery",
    "IntelligenceReport",
    "KeyFinding",
    "Anomaly",
    "SqlGenerationQuery",
    "SqlGenerationResponse",
    "AnalysisHistoryRead",
]
