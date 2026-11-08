from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id = Column(Integer, primary_key=True, index=True)

    dataset_id = Column(
        Integer,
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    job_type = Column(String(100), nullable=False, default="DESCRIPTIVE_STATS")
    query_prompt = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="PENDING")

    result_data = Column(JSON, nullable=True)
    error_message = Column(String(1000), nullable=True)

    execution_time_ms = Column(Float, nullable=True, default=0.0)

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    completed_at = Column(
        DateTime,
        nullable=True,
    )

    dataset = relationship("Dataset", back_populates="analysis_jobs")
    user = relationship("User", back_populates="analysis_jobs")