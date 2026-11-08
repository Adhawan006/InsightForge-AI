from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    organization = Column(
        String(255),
        nullable=True,
        default="Dell Technologies"
    )

    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    # Use timezone-naive datetimes since PostgreSQL column is TIMESTAMP WITHOUT TIME ZONE
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

    datasets = relationship(
        "Dataset",
        back_populates="owner",
        cascade="all, delete-orphan",
    )

    analysis_jobs = relationship(
        "AnalysisJob",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    insight_reports = relationship(
        "InsightReport",
        back_populates="user",
        cascade="all, delete-orphan",
    )