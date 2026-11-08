import os
import shutil
import uuid
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.config import settings
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.dataset import Dataset
from app.models.cleaning_history import CleaningHistory
from app.models.analysis_job import AnalysisJob
from app.schemas.dataset import (
    DatasetRead,
    DatasetSummary,
    DatasetPreview,
    DatasetCleanRequest,
    DatasetCleanResult,
)
from app.services.data_processor import DataProcessor

router = APIRouter()

@router.get("/", response_model=List[DatasetRead], summary="List all accessible datasets")
async def list_datasets(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Retrieve catalog of ingested enterprise datasets."""
    query = select(Dataset).order_by(desc(Dataset.created_at)).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/upload", response_model=DatasetRead, status_code=status.HTTP_201_CREATED, summary="Upload CSV or Excel dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    description: str = Form(""),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Ingest CSV or Excel file, extract schema, profile dimensions, and save to storage repository."""
    original_filename = file.filename or "dataset.csv"
    file_ext = os.path.splitext(original_filename)[1].lower()

    if file_ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{file_ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}",
        )

    upload_dir = settings.get_upload_path()
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    target_path = os.path.join(upload_dir, unique_filename)

    try:
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to persist file: {e}")

    # Process and profile with Pandas
    try:
        processor = DataProcessor(target_path)
        summary = processor.extract_summary(dataset_id=0, name=name, original_filename=original_filename)
    except Exception as e:
        if os.path.exists(target_path):
            os.remove(target_path)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error parsing tabular dataset: {e}",
        )

    file_size = os.path.getsize(target_path)
    file_format = file_ext.replace(".", "")
    mime_type = file.content_type or ("text/csv" if file_format == "csv" else "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")

    # Store in database
    dataset = Dataset(
        name=name,
        description=description,
        file_path=target_path,
        original_filename=original_filename,
        file_format=file_format,
        file_size_bytes=file_size,
        row_count=summary.row_count,
        column_count=summary.column_count,
        mime_type=mime_type,
        columns_metadata=[c.model_dump() for c in summary.columns],
        missing_cells_count=summary.missing_cells_count,
        duplicate_rows_count=summary.duplicate_rows_count,
        is_cleaned=False,
        owner_id=current_user.id,
    )
    db.add(dataset)
    await db.commit()
    await db.refresh(dataset)
    return dataset

@router.get("/{dataset_id}", response_model=DatasetRead, summary="Get dataset metadata")
async def get_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Retrieve metadata information for a specific dataset."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalars().first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
    return dataset

@router.get("/{dataset_id}/summary", response_model=DatasetSummary, summary="Get comprehensive dataset profiling summary")
async def get_dataset_summary(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Extract missing values, duplicates, and schema type distributions."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalars().first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    processor = DataProcessor(dataset.file_path)
    summary = processor.extract_summary(
        dataset_id=dataset.id,
        name=dataset.name,
        original_filename=dataset.original_filename,
    )
    return summary

@router.get("/{dataset_id}/preview", response_model=DatasetPreview, summary="Paginated row preview of dataset")
async def get_dataset_preview(
    dataset_id: int,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Paginated tabular row preview."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalars().first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    processor = DataProcessor(dataset.file_path)
    columns, records, total_rows = processor.get_preview(page=page, page_size=page_size)

    return DatasetPreview(
        id=dataset.id,
        name=dataset.name,
        columns=columns,
        data=records,
        total_rows=total_rows,
        page=page,
        page_size=page_size,
    )

@router.post("/{dataset_id}/clean", response_model=DatasetCleanResult, summary="Execute automatic data cleaning")
async def clean_dataset(
    dataset_id: int,
    clean_params: DatasetCleanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Automated duplicate row purging, missing value imputation, and column name standardization."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalars().first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    upload_dir = settings.get_upload_path()
    cleaned_filename = f"cleaned_{uuid.uuid4().hex}.csv"
    output_path = os.path.join(upload_dir, cleaned_filename)

    processor = DataProcessor(dataset.file_path)
    clean_result = processor.clean_dataset(clean_params, output_path=output_path)
    clean_result.dataset_id = dataset.id

    # Update dataset record
    dataset.file_path = output_path
    dataset.row_count = clean_result.final_rows
    dataset.column_count = clean_result.final_cols
    dataset.file_size_bytes = os.path.getsize(output_path)
    dataset.is_cleaned = True
    dataset.missing_cells_count = 0 if clean_params.numeric_imputation != "none" else dataset.missing_cells_count
    dataset.duplicate_rows_count = 0

    # Refresh schema metadata
    refreshed_summary = processor.extract_summary(dataset.id, dataset.name, dataset.original_filename)
    dataset.columns_metadata = [c.model_dump() for c in refreshed_summary.columns]

    # Save cleaning audit history
    history = CleaningHistory(
        dataset_id=dataset.id,
        user_id=current_user.id,
        duplicates_removed=clean_result.duplicates_removed,
        missing_values_imputed=clean_result.missing_values_imputed,
        imputation_strategy=f"{clean_params.numeric_imputation}/{clean_params.categorical_imputation}",
        cleaned_file_path=output_path,
        audit_log=clean_result.audit_log,
    )
    db.add(history)
    db.add(dataset)
    await db.commit()
    await db.refresh(dataset)

    return clean_result

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete dataset")
async def delete_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Permanently delete dataset from repository and file system."""
    result = await db.execute(select(Dataset).where(Dataset.id == dataset_id))
    dataset = result.scalars().first()
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")

    if os.path.exists(dataset.file_path):
        try:
            os.remove(dataset.file_path)
        except Exception:
            pass

    await db.delete(dataset)
    await db.commit()
