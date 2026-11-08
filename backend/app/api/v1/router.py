from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, datasets, analytics, intelligence

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(datasets.router, prefix="/datasets", tags=["Datasets"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(intelligence.router, prefix="/intelligence", tags=["Intelligence"])
