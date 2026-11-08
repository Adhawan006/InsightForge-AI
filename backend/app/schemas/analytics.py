from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AnalyticsQuery(BaseModel):
    dataset_id: int
    target_columns: Optional[List[str]] = None
    operation: str = Field(default="DESCRIPTIVE_STATS", description="DESCRIPTIVE_STATS, CORRELATION, DISTRIBUTION")

class ColumnStatistics(BaseModel):
    column_name: str
    dtype: str
    count: int
    missing_count: int
    missing_pct: float
    unique_count: int
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    q25: Optional[float] = None
    median: Optional[float] = None
    q75: Optional[float] = None
    max: Optional[float] = None
    skewness: Optional[float] = None
    top_values: Optional[List[Dict[str, Any]]] = None

class DistributionBin(BaseModel):
    bin_label: str
    count: int
    percentage: float

class ColumnDistribution(BaseModel):
    column_name: str
    data_type: str
    bins: List[DistributionBin]

class CorrelationMatrixResponse(BaseModel):
    dataset_id: int
    columns: List[str]
    correlation_matrix: Dict[str, Dict[str, float]]

class AnalyticsResult(BaseModel):
    dataset_id: int
    total_rows: int
    total_columns: int
    statistics: List[ColumnStatistics]
    correlation_matrix: Optional[Dict[str, Dict[str, float]]] = None
    distributions: Optional[List[ColumnDistribution]] = None
