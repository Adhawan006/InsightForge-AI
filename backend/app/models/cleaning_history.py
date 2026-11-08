from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    JSON,
    String,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class CleaningHistory(Base):
    __tablename__ = "cleaning_histories"

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

    duplicates_removed = Column(Integer, default=0)
    missing_values_imputed = Column(Integer, default=0)
    imputation_strategy = Column(String(50), default="mean/mode")

    cleaned_file_path = Column(String(512), nullable=True)
    audit_log = Column(JSON, nullable=True)

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    dataset = relationship(
        "Dataset",
        back_populates="cleaning_records",
    )