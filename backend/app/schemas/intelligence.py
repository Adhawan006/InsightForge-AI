from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field

class IntelligenceQuery(BaseModel):
    dataset_id: int
    prompt: str = Field(..., min_length=3, description="Natural language prompt for data analysis")
    focus_area: Optional[str] = Field(default="GENERAL", description="GENERAL, FINANCIAL, OPERATIONAL, RISK")

class KeyFinding(BaseModel):
    title: str
    observation: str
    impact_level: str = "MEDIUM"  # HIGH, MEDIUM, LOW
    metric_reference: Optional[str] = None

class Anomaly(BaseModel):
    feature: str
    description: str
    severity: str = "WARNING"  # CRITICAL, WARNING, INFO
    anomaly_score: Optional[float] = None

class IntelligenceReport(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    dataset_id: int
    query_prompt: str
    focus_area: str = "GENERAL"
    # New structured sections
    business_summary: str = ""
    executive_summary: str
    dataset_explanation: str = ""
    trend_detection: List[Dict[str, Any]] = []
    risk_analysis: List[Dict[str, Any]] = []
    recommendations: List[str] = []
    # Existing sections
    key_findings: List[KeyFinding] = []
    anomalies: List[Anomaly] = []
    strategic_recommendations: List[str] = []
    suggested_visualizations: List[str] = []
    generated_sql: Optional[str] = None
    confidence_score: float = 0.95
    model_version: str = "gemini-1.5-pro"
    created_at: Optional[datetime] = None

class SqlGenerationQuery(BaseModel):
    dataset_id: int
    prompt: str = Field(..., min_length=3, description="Natural language question to convert to SQL")
    dialect: Optional[str] = Field(default="postgresql", description="SQL dialect")

class SqlGenerationResponse(BaseModel):
    dataset_id: int
    natural_language_prompt: str
    sql_query: str
    explanation: str
    tables_referenced: List[str] = []
    columns_projected: List[str] = []
    confidence_score: float = 0.95
    query_results_sample: Optional[List[Dict[str, Any]]] = None

class AnalysisHistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dataset_id: int
    job_type: str
    query_prompt: Optional[str] = None
    status: str
    execution_time_ms: Optional[float] = 0.0
    result_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime
