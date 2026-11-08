import os
import shutil
import logging
from sqlalchemy import select
from app.core.config import settings, BASE_DIR
from app.core.database import engine, AsyncSessionLocal
from app.core.security import get_password_hash
from app.db.base import Base
from app.models.user import User
from app.models.dataset import Dataset
from app.services.data_processor import DataProcessor

logger = logging.getLogger("insightforge.init_db")

async def init_models() -> None:
    """Initializes tables and seeds default enterprise administrator and telemetry dataset."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Seed Enterprise Administrator
        result = await session.execute(select(User).where(User.email == settings.FIRST_SUPERUSER_EMAIL.lower()))
        admin_user = result.scalars().first()

        if not admin_user:
            admin_user = User(
                email=settings.FIRST_SUPERUSER_EMAIL.lower(),
                hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
                full_name=settings.FIRST_SUPERUSER_NAME,
                organization=settings.FIRST_SUPERUSER_ORG,
                is_active=True,
                is_superuser=True,
            )
            session.add(admin_user)
            await session.commit()
            await session.refresh(admin_user)
            logger.info(f"Seeded enterprise admin: {settings.FIRST_SUPERUSER_EMAIL}")

        # 2. Seed Dell APEX Telemetry Dataset if not exists
        result = await session.execute(select(Dataset).where(Dataset.name == "Dell APEX Cloud Telemetry Q3"))
        existing_dataset = result.scalars().first()

        if not existing_dataset:
            source_csv = BASE_DIR / "data" / "dell_apex_telemetry_q3.csv"
            if source_csv.exists():
                upload_dir = settings.get_upload_path()
                seeded_path = upload_dir / "dell_apex_telemetry_q3_seeded.csv"
                shutil.copyfile(source_csv, seeded_path)

                processor = DataProcessor(str(seeded_path))
                summary = processor.extract_summary(
                    dataset_id=0,
                    name="Dell APEX Cloud Telemetry Q3",
                    original_filename="dell_apex_telemetry_q3.csv",
                )

                dataset = Dataset(
                    name="Dell APEX Cloud Telemetry Q3",
                    description="Mission-critical server node utilization, IOPS throughput, thermal distribution, and SLA telemetry.",
                    file_path=str(seeded_path),
                    original_filename="dell_apex_telemetry_q3.csv",
                    file_format="csv",
                    file_size_bytes=os.path.getsize(seeded_path),
                    row_count=summary.row_count,
                    column_count=summary.column_count,
                    mime_type="text/csv",
                    columns_metadata=[c.model_dump() for c in summary.columns],
                    missing_cells_count=summary.missing_cells_count,
                    duplicate_rows_count=summary.duplicate_rows_count,
                    is_cleaned=True,
                    owner_id=admin_user.id,
                )
                session.add(dataset)
                await session.commit()
                logger.info("Seeded Dell APEX Cloud Telemetry Q3 dataset successfully.")
