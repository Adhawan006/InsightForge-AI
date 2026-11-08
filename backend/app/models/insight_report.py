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


class InsightReport(Base):
    __tablename__ = "insight_reports"

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

    query_prompt = Column(Text, nullable=False)
    focus_area = Column(String(50), nullable=False, default="GENERAL")

    executive_summary = Column(Text, nullable=False)

    # Structured AI Output
    business_summary = Column(Text, nullable=True)
    dataset_explanation = Column(Text, nullable=True)
    trend_detection = Column(JSON, nullable=True)
    risk_analysis = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)

    # Existing Sections
    key_findings = Column(JSON, nullable=True)
    anomalies = Column(JSON, nullable=True)
    strategic_recommendations = Column(JSON, nullable=True)
    suggested_visualizations = Column(JSON, nullable=True)

    generated_sql = Column(Text, nullable=True)

    model_version = Column(
        String(100),
        nullable=False,
        default="gemini-1.5-pro",
    )

    confidence_score = Column(
        Float,
        nullable=False,
        default=0.95,
    )

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    dataset = relationship(
        "Dataset",
        back_populates="insight_reports",
    )

    user = relationship(
        "User",
        back_populates="insight_reports",
    )