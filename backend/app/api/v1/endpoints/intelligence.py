import time
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.dataset import Dataset
from app.models.insight_report import InsightReport
from app.models.analysis_job import AnalysisJob
from app.schemas.intelligence import (
    IntelligenceQuery,
    IntelligenceReport as IntelligenceReportSchema,
    SqlGenerationQuery,
    SqlGenerationResponse,
    AnalysisHistoryRead,
)
from app.services.data_processor import DataProcessor
from app.services.gemini_service import GeminiService

router = APIRouter()

@router.post("/generate", response_model=IntelligenceReportSchema, summary="Generate AI data intelligence with Gemini")
async def generate_intelligence(
    query: IntelligenceQuery,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Invokes Google Gemini API to produce executive narrative insights, findings, and anomaly alerts."""
    start_time = time.time()
    result = await db.execute(select(Dataset).where(Dataset.id == query.dataset_id))
    dataset = result.scalars().first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    processor = DataProcessor(dataset.file_path)
    summary = processor.extract_summary(dataset.id, dataset.name, dataset.original_filename)
    _, sample_rows, _ = processor.get_preview(page=1, page_size=5)

    gemini_svc = GeminiService()
    try:
        report = await gemini_svc.analyze_dataset_intelligence(
            dataset_id=dataset.id,
            dataset_name=dataset.name,
            summary_metadata=summary.model_dump(),
            sample_rows=sample_rows,
            user_prompt=query.prompt,
            focus_area=query.focus_area or "GENERAL",
        )
    except Exception as e:
        # Log job failure
        job = AnalysisJob(
            dataset_id=dataset.id,
            user_id=current_user.id,
            job_type="NL_ANALYSIS",
            query_prompt=query.prompt,
            status="FAILED",
            error_message=str(e),
            execution_time_ms=round((time.time() - start_time) * 1000, 2),
        )
        db.add(job)
        await db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Intelligence generation error: {e}",
        )

    execution_duration = round((time.time() - start_time) * 1000, 2)

    # Persist report in database
    db_report = InsightReport(
        dataset_id=dataset.id,
        user_id=current_user.id,
        query_prompt=query.prompt,
        focus_area=query.focus_area or "GENERAL",
        executive_summary=report.executive_summary,
        key_findings=[f.model_dump() for f in report.key_findings],
        anomalies=[a.model_dump() for a in report.anomalies],
        strategic_recommendations=report.strategic_recommendations,
        suggested_visualizations=report.suggested_visualizations,
        model_version=report.model_version,
        confidence_score=report.confidence_score,
    )
    db.add(db_report)

    # Log successful analysis job
    db_job = AnalysisJob(
        dataset_id=dataset.id,
        user_id=current_user.id,
        job_type="NL_ANALYSIS",
        query_prompt=query.prompt,
        status="SUCCESS",
        result_data={
            "executive_summary": report.executive_summary,
            "findings_count": len(report.key_findings),
            "anomalies_count": len(report.anomalies),
        },
        execution_time_ms=execution_duration,
    )
    db.add(db_job)

    await db.commit()
    await db.refresh(db_report)

    report.id = db_report.id
    report.created_at = db_report.created_at
    return report

@router.post("/sql", response_model=SqlGenerationResponse, summary="Generate natural language SQL with Gemini")
async def generate_sql(
    query: SqlGenerationQuery,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Translates natural language questions into safe SELECT queries against the dataset schema."""
    start_time = time.time()
    result = await db.execute(select(Dataset).where(Dataset.id == query.dataset_id))
    dataset = result.scalars().first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    processor = DataProcessor(dataset.file_path)
    summary = processor.extract_summary(dataset.id, dataset.name, dataset.original_filename)

    gemini_svc = GeminiService()
    sql_response = await gemini_svc.generate_sql_query(
        dataset_id=dataset.id,
        dataset_name=dataset.name,
        columns_metadata=[c.model_dump() for c in summary.columns],
        user_prompt=query.prompt,
        dialect=query.dialect or "postgresql",
    )

    # Log SQL generation in analysis jobs
    db_job = AnalysisJob(
        dataset_id=dataset.id,
        user_id=current_user.id,
        job_type="SQL_GENERATION",
        query_prompt=query.prompt,
        status="SUCCESS",
        result_data={
            "sql_query": sql_response.sql_query,
            "explanation": sql_response.explanation,
        },
        execution_time_ms=round((time.time() - start_time) * 1000, 2),
    )
    db.add(db_job)
    await db.commit()

    return sql_response

@router.get("/history", response_model=List[AnalysisHistoryRead], summary="Get enterprise analysis job history")
async def get_analysis_history(
    dataset_id: Optional[int] = None,
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Retrieve historical queries, generated models, and execution telemetry."""
    stmt = select(AnalysisJob).order_by(desc(AnalysisJob.created_at)).limit(limit)
    if dataset_id:
        stmt = stmt.where(AnalysisJob.dataset_id == dataset_id)

    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/reports/{report_id}", response_model=IntelligenceReportSchema, summary="Get specific insight report")
async def get_insight_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Retrieve saved AI narrative report by ID."""
    result = await db.execute(select(InsightReport).where(InsightReport.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report
