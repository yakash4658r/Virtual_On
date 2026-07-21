import os
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from core.security import create_access_token, create_refresh_token
from models.store import Store
from typing import Optional

router = APIRouter()

class LoginRequest(BaseModel):
    id: str

class Token(BaseModel):
    access: str
    refresh: str

class LoginResponse(BaseModel):
    success: bool
    tokens: Token
    role: str
    store_info: Optional[dict] = None

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    login_id = request.id.strip()
    
    super_admin_id = os.getenv("SUPER_ADMIN_ID", "yakash4658r")
    
    # 1. Check Super Admin
    if login_id == super_admin_id:
        user_id = "superadmin-1"
        role = "super_admin"
        
        access_token = create_access_token(data={"sub": user_id, "role": role})
        refresh_token = create_refresh_token(data={"sub": user_id, "role": role})
        
        return {
            "success": True,
            "tokens": {"access": access_token, "refresh": refresh_token},
            "role": role,
            "store_info": None
        }
    
    # 2. Check Store Activation Code
    result = await db.execute(select(Store).where(Store.activation_code == login_id, Store.is_active == True))
    store = result.scalars().first()
    
    if store:
        role = "store_admin"
        access_token = create_access_token(data={"sub": store.id, "role": role, "store_id": store.id})
        refresh_token = create_refresh_token(data={"sub": store.id, "role": role, "store_id": store.id})
        
        return {
            "success": True,
            "tokens": {"access": access_token, "refresh": refresh_token},
            "role": role,
            "store_info": {
                "store_id": store.id,
                "store_name": store.store_name,
                "activation_code": store.activation_code,
                "plan_type": store.plan_type,
                "credits_remaining": store.credits_remaining,
                "daily_limit": store.daily_limit,
                "photos_used_today": store.photos_used_today
            }
        }
        
    # 3. Invalid ID
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid ID. Please check and try again.",
    )

@router.get("/profile")
async def get_profile():
    # Deprecated/Simplify since we just decode token in frontend
    return {"status": "ok"}
