from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, ConfigDict, Field

class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None

class DatasetCreate(DatasetBase):
    pass

class ColumnDetail(BaseModel):
    name: str
    data_type: str
    missing_count: int
    missing_pct: float
    unique_count: int
    sample_values: List[Any] = []
    is_numeric: bool = False
    is_categorical: bool = False
    is_datetime: bool = False

class DatasetRead(DatasetBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    file_path: str
    original_filename: str
    file_format: str
    file_size_bytes: int
    row_count: int
    column_count: int
    mime_type: str
    columns_metadata: Optional[List[Dict[str, Any]]] = None
    missing_cells_count: int = 0
    duplicate_rows_count: int = 0
    is_cleaned: bool = False
    owner_id: int
    created_at: datetime
    updated_at: datetime

class DatasetSummary(BaseModel):
    id: int
    name: str
    original_filename: str
    row_count: int
    column_count: int
    file_size_bytes: int
    total_cells: int
    missing_cells_count: int
    missing_cells_pct: float
    duplicate_rows_count: int
    columns: List[ColumnDetail]
    numeric_columns: List[str]
    categorical_columns: List[str]
    datetime_columns: List[str]

class DatasetPreview(BaseModel):
    id: int
    name: str
    columns: List[str]
    data: List[Dict[str, Any]]
    total_rows: int
    page: int
    page_size: int

class DatasetCleanRequest(BaseModel):
    remove_duplicates: bool = True
    numeric_imputation: str = Field(default="mean", description="Options: mean, median, zero, drop")
    categorical_imputation: str = Field(default="mode", description="Options: mode, unknown, drop")
    standardize_column_names: bool = True

class DatasetCleanResult(BaseModel):
    dataset_id: int
    duplicates_removed: int
    missing_values_imputed: int
    original_rows: int
    final_rows: int
    original_cols: int
    final_cols: int
    audit_log: List[str]
    status: str = "SUCCESS"
