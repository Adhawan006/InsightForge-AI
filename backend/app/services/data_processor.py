import os
import re
import math
from typing import Dict, Any, List, Optional, Tuple
import pandas as pd
import numpy as np
from app.schemas.dataset import DatasetSummary, ColumnDetail, DatasetCleanResult, DatasetCleanRequest
from app.schemas.analytics import ColumnStatistics, ColumnDistribution, DistributionBin

class DataProcessor:
    """Enterprise Data Processor for ingesting, validating, profiling, and cleaning datasets using Pandas & NumPy."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self._df: Optional[pd.DataFrame] = None

    def get_dataframe(self) -> pd.DataFrame:
        """Loads and caches DataFrame from disk supporting CSV and Excel formats."""
        if self._df is not None:
            return self._df

        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"Dataset file not found at: {self.file_path}")

        file_ext = os.path.splitext(self.file_path)[1].lower()

        if file_ext in [".xlsx", ".xls"]:
            self._df = pd.read_excel(self.file_path)
        elif file_ext == ".csv":
            try:
                self._df = pd.read_csv(self.file_path, encoding="utf-8")
            except UnicodeDecodeError:
                self._df = pd.read_csv(self.file_path, encoding="latin1")
        else:
            raise ValueError(f"Unsupported file format '{file_ext}'. Only .csv, .xlsx, .xls are supported.")

        return self._df

    def extract_summary(self, dataset_id: int, name: str, original_filename: str) -> DatasetSummary:
        """Extracts schema, column data types, missing value ratios, and statistical distributions."""
        df = self.get_dataframe()
        file_size = os.path.getsize(self.file_path) if os.path.exists(self.file_path) else 0

        row_count, column_count = df.shape
        total_cells = row_count * column_count
        missing_cells_count = int(df.isna().sum().sum())
        missing_cells_pct = round((missing_cells_count / total_cells * 100), 2) if total_cells > 0 else 0.0
        duplicate_rows_count = int(df.duplicated().sum())

        column_details: List[ColumnDetail] = []
        numeric_columns: List[str] = []
        categorical_columns: List[str] = []
        datetime_columns: List[str] = []

        for col in df.columns:
            series = df[col]
            missing_count = int(series.isna().sum())
            missing_pct = round((missing_count / row_count * 100), 2) if row_count > 0 else 0.0
            unique_count = int(series.nunique(dropna=True))

            is_numeric = bool(pd.api.types.is_numeric_dtype(series))
            is_datetime = bool(pd.api.types.is_datetime64_any_dtype(series))
            is_categorical = bool(not is_numeric and not is_datetime)

            if is_numeric:
                numeric_columns.append(str(col))
            elif is_datetime:
                datetime_columns.append(str(col))
            else:
                categorical_columns.append(str(col))

            # Grab clean sample values
            non_null = series.dropna()
            sample_values = [
                self._sanitize_val(v) for v in non_null.head(3).tolist()
            ]

            column_details.append(
                ColumnDetail(
                    name=str(col),
                    data_type=str(series.dtype),
                    missing_count=missing_count,
                    missing_pct=missing_pct,
                    unique_count=unique_count,
                    sample_values=sample_values,
                    is_numeric=is_numeric,
                    is_categorical=is_categorical,
                    is_datetime=is_datetime,
                )
            )

        return DatasetSummary(
            id=dataset_id,
            name=name,
            original_filename=original_filename,
            row_count=row_count,
            column_count=column_count,
            file_size_bytes=file_size,
            total_cells=total_cells,
            missing_cells_count=missing_cells_count,
            missing_cells_pct=missing_cells_pct,
            duplicate_rows_count=duplicate_rows_count,
            columns=column_details,
            numeric_columns=numeric_columns,
            categorical_columns=categorical_columns,
            datetime_columns=datetime_columns,
        )

    def get_preview(self, page: int = 1, page_size: int = 20) -> Tuple[List[str], List[Dict[str, Any]], int]:
        """Returns paginated dictionary rows safe for JSON serialization."""
        df = self.get_dataframe()
        total_rows = len(df)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        sub_df = df.iloc[start_idx:end_idx].copy()
        columns = [str(c) for c in sub_df.columns]
        
        # Replace NaN / Inf values with None for compliant JSON
        sub_df = sub_df.replace({np.nan: None, np.inf: None, -np.inf: None})
        records = sub_df.to_dict(orient="records")

        # Sanitize any timestamp or complex types
        sanitized_records = []
        for row in records:
            sanitized_records.append({str(k): self._sanitize_val(v) for k, v in row.items()})

        return columns, sanitized_records, total_rows

    def clean_dataset(self, config: DatasetCleanRequest, output_path: str) -> DatasetCleanResult:
        """
        Executes automatic enterprise data cleaning:
        1. Duplicate removal
        2. Column name standardization (snake_case)
        3. Missing value imputation based on strategy
        """
        df = self.get_dataframe().copy()
        audit_log: List[str] = []
        orig_rows, orig_cols = df.shape

        # 1. Standardize column names
        if config.standardize_column_names:
            renamed = {}
            for col in df.columns:
                cleaned_name = str(col).strip().lower()
                cleaned_name = re.sub(r"[^\w\s]", "", cleaned_name)
                cleaned_name = re.sub(r"\s+", "_", cleaned_name)
                renamed[col] = cleaned_name
            df.rename(columns=renamed, inplace=True)
            audit_log.append("Standardized all column headers to snake_case format.")

        # 2. Duplicate detection and elimination
        duplicates_removed = 0
        if config.remove_duplicates:
            dup_mask = df.duplicated()
            duplicates_removed = int(dup_mask.sum())
            if duplicates_removed > 0:
                df = df.drop_duplicates()
                audit_log.append(f"Detected and dropped {duplicates_removed} duplicate records.")
            else:
                audit_log.append("No duplicate records found.")

        # 3. Missing Value Imputation
        missing_before = int(df.isna().sum().sum())
        imputed_count = 0

        for col in df.columns:
            col_missing = int(df[col].isna().sum())
            if col_missing == 0:
                continue

            if pd.api.types.is_numeric_dtype(df[col]):
                if config.numeric_imputation == "mean":
                    mean_val = df[col].mean()
                    df[col] = df[col].fillna(mean_val)
                    imputed_count += col_missing
                    audit_log.append(f"Imputed {col_missing} missing cells in numeric column '{col}' with mean ({round(mean_val, 3)}).")
                elif config.numeric_imputation == "median":
                    median_val = df[col].median()
                    df[col] = df[col].fillna(median_val)
                    imputed_count += col_missing
                    audit_log.append(f"Imputed {col_missing} missing cells in numeric column '{col}' with median ({round(median_val, 3)}).")
                elif config.numeric_imputation == "zero":
                    df[col] = df[col].fillna(0)
                    imputed_count += col_missing
                    audit_log.append(f"Imputed {col_missing} missing cells in numeric column '{col}' with 0.")
                elif config.numeric_imputation == "drop":
                    df = df.dropna(subset=[col])
                    audit_log.append(f"Dropped {col_missing} rows containing missing values in column '{col}'.")
            else:
                if config.categorical_imputation == "mode":
                    mode_series = df[col].mode()
                    mode_val = mode_series.iloc[0] if not mode_series.empty else "Unknown"
                    df[col] = df[col].fillna(mode_val)
                    imputed_count += col_missing
                    audit_log.append(f"Imputed {col_missing} missing cells in categorical column '{col}' with mode ('{mode_val}').")
                elif config.categorical_imputation == "unknown":
                    df[col] = df[col].fillna("Unknown")
                    imputed_count += col_missing
                    audit_log.append(f"Imputed {col_missing} missing cells in categorical column '{col}' with 'Unknown'.")
                elif config.categorical_imputation == "drop":
                    df = df.dropna(subset=[col])
                    audit_log.append(f"Dropped {col_missing} rows containing missing values in column '{col}'.")

        # Save cleaned dataset
        df.to_csv(output_path, index=False)
        self._df = df
        self.file_path = output_path

        final_rows, final_cols = df.shape

        return DatasetCleanResult(
            dataset_id=0,
            duplicates_removed=duplicates_removed,
            missing_values_imputed=imputed_count,
            original_rows=orig_rows,
            final_rows=final_rows,
            original_cols=orig_cols,
            final_cols=final_cols,
            audit_log=audit_log,
            status="SUCCESS",
        )

    def get_column_statistics(self, target_columns: Optional[List[str]] = None) -> List[ColumnStatistics]:
        """Calculates comprehensive descriptive statistics for dataset dimensions."""
        df = self.get_dataframe()
        cols = target_columns if target_columns else df.columns
        stats: List[ColumnStatistics] = []

        for col in cols:
            if col not in df.columns:
                continue
            series = df[col]
            count = int(series.count())
            missing_count = int(series.isna().sum())
            missing_pct = round((missing_count / len(df) * 100), 2) if len(df) > 0 else 0.0
            unique_count = int(series.nunique(dropna=True))

            stat = ColumnStatistics(
                column_name=str(col),
                dtype=str(series.dtype),
                count=count,
                missing_count=missing_count,
                missing_pct=missing_pct,
                unique_count=unique_count,
            )

            if pd.api.types.is_numeric_dtype(series):
                cleaned = series.dropna()
                if not cleaned.empty:
                    stat.mean = round(float(cleaned.mean()), 3)
                    stat.std = round(float(cleaned.std()), 3) if len(cleaned) > 1 else 0.0
                    stat.min = round(float(cleaned.min()), 3)
                    stat.q25 = round(float(cleaned.quantile(0.25)), 3)
                    stat.median = round(float(cleaned.median()), 3)
                    stat.q75 = round(float(cleaned.quantile(0.75)), 3)
                    stat.max = round(float(cleaned.max()), 3)
                    stat.skewness = round(float(cleaned.skew()), 3) if len(cleaned) > 2 else 0.0
            else:
                # Top frequent categorical values
                top_counts = series.value_counts().head(5).to_dict()
                stat.top_values = [{"value": str(k), "count": int(v)} for k, v in top_counts.items()]

            stats.append(stat)

        return stats

    def compute_correlation_matrix(self) -> Dict[str, Dict[str, float]]:
        """Calculates Pearson correlation matrix across all numeric features."""
        df = self.get_dataframe()
        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.empty or numeric_df.shape[1] < 2:
            return {}

        corr = numeric_df.corr(method="pearson").round(3)
        corr = corr.replace({np.nan: 0.0, np.inf: 0.0, -np.inf: 0.0})
        return corr.to_dict()

    def compute_distributions(self, max_columns: int = 6) -> List[ColumnDistribution]:
        """Generates distribution bins suitable for Recharts visual rendering."""
        df = self.get_dataframe()
        numeric_cols = df.select_dtypes(include=[np.number]).columns[:max_columns]
        distributions: List[ColumnDistribution] = []

        for col in numeric_cols:
            series = df[col].dropna()
            if series.empty:
                continue

            # Compute 8-bin histogram
            counts, bin_edges = np.histogram(series, bins=8)
            bins_list: List[DistributionBin] = []
            total = sum(counts)

            for i in range(len(counts)):
                label = f"{round(bin_edges[i], 1)} - {round(bin_edges[i+1], 1)}"
                pct = round((counts[i] / total * 100), 2) if total > 0 else 0.0
                bins_list.append(DistributionBin(bin_label=label, count=int(counts[i]), percentage=pct))

            distributions.append(
                ColumnDistribution(
                    column_name=str(col),
                    data_type=str(series.dtype),
                    bins=bins_list,
                )
            )

        return distributions

    @staticmethod
    def _sanitize_val(val: Any) -> Any:
        if val is None or (isinstance(val, float) and (math.isnan(val) or math.isinf(val))):
            return None
        if isinstance(val, (pd.Timestamp, datetime_type := type(pd.to_datetime("2026-01-01")))):
            return val.isoformat()
        if isinstance(val, (np.integer, int)):
            return int(val)
        if isinstance(val, (np.floating, float)):
            return float(val)
        if isinstance(val, (np.bool_, bool)):
            return bool(val)
        return str(val)
