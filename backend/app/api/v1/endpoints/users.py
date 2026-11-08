from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_password_hash
from app.api.deps import get_current_user, get_current_active_superuser
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserRead, summary="Get current logged in user details")
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Retrieve profile details for the authenticated user session."""
    return current_user

@router.put("/me", response_model=UserRead, summary="Update user profile")
async def update_current_user_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update profile details for the current user."""
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.organization is not None:
        current_user.organization = user_in.organization
    if user_in.password is not None:
        current_user.hashed_password = get_password_hash(user_in.password)

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.get("/", response_model=List[UserRead], summary="List enterprise users (Admin)")
async def list_enterprise_users(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_active_superuser),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Retrieve enterprise registered users list."""
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()
