from fastapi import HTTPException, UploadFile, status

ALLOWED_EXTENSIONS = {".csv", ".json", ".parquet", ".xlsx"}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB standard enterprise limit

def validate_file_upload(file: UploadFile) -> bool:
    """Validates file extensions and size constraints for ingestion."""
    # Architectural stub - business logic will be implemented in subsequent phase
    return True
