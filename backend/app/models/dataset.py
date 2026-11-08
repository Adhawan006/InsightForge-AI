from datetime import datetime

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)

    file_path = Column(String(512), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_format = Column(String(20), nullable=False, default="csv")

    file_size_bytes = Column(BigInteger, nullable=True, default=0)
    row_count = Column(Integer, nullable=True, default=0)
    column_count = Column(Integer, nullable=True, default=0)

    mime_type = Column(String(100), nullable=False, default="text/csv")

    columns_metadata = Column(JSON, nullable=True)

    missing_cells_count = Column(Integer, nullable=True, default=0)
    duplicate_rows_count = Column(Integer, nullable=True, default=0)

    is_cleaned = Column(Boolean, default=False)

    owner_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    owner = relationship("User", back_populates="datasets")

    analysis_jobs = relationship(
        "AnalysisJob",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )

    insight_reports = relationship(
        "InsightReport",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )

    cleaning_records = relationship(
        "CleaningHistory",
        back_populates="dataset",
        cascade="all, delete-orphan",
    )