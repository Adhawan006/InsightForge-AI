import os
from typing import Dict, Any, List, Optional
from app.services.data_processor import DataProcessor
from app.schemas.analytics import (
    AnalyticsResult,
    AnalyticsQuery,
    CorrelationMatrixResponse,
    ColumnDistribution,
)

class AnalyticsService:
    """Enterprise Analytics calculation engine coordinating descriptive stats, correlations, and distribution profiling."""

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.processor = DataProcessor(file_path)

    def execute_analytics(self, query: AnalyticsQuery) -> AnalyticsResult:
        """Executes statistical profiling across selected or all columns."""
        df = self.processor.get_dataframe()
        row_count, col_count = df.shape

        stats = self.processor.get_column_statistics(target_columns=query.target_columns)
        correlations = self.processor.compute_correlation_matrix()
        distributions = self.processor.compute_distributions()

        return AnalyticsResult(
            dataset_id=query.dataset_id,
            total_rows=row_count,
            total_columns=col_count,
            statistics=stats,
            correlation_matrix=correlations,
            distributions=distributions,
        )

    def get_correlations(self, dataset_id: int) -> CorrelationMatrixResponse:
        """Calculates pairwise correlation coefficients for all numeric dimensions."""
        correlations = self.processor.compute_correlation_matrix()
        columns = list(correlations.keys())
        return CorrelationMatrixResponse(
            dataset_id=dataset_id,
            columns=columns,
            correlation_matrix=correlations,
        )

    def get_distributions(self) -> List[ColumnDistribution]:
        """Calculates visual distribution histogram bins."""
        return self.processor.compute_distributions()
