from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from core.security import create_access_token, create_refresh_token
from core.dependencies import get_current_user
from schemas.user import UserResponse, LoginResponse
from models.device import Device
from models.user import User

router = APIRouter()

class MirrorLoginRequest(BaseModel):
    mirror_id: str

@router.post("/mirror-login", response_model=LoginResponse)
async def mirror_login(request: MirrorLoginRequest, db: AsyncSession = Depends(get_db)):
    mirror_id = request.mirror_id.strip()
    
    from datetime import datetime
    # 1. Check Super Admin
    if mirror_id == "yakash4658r":
        user = User(
            id="superadmin-1",
            name="Super Admin",
            email="admin@virtualon.com",
            role="super_admin",
            is_active=True,
            created_at=datetime.utcnow()
        )
        access_token = create_access_token(data={"sub": user.id, "role": user.role})
        refresh_token = create_refresh_token(data={"sub": user.id, "role": user.role})
        return {
            "success": True,
            "tokens": {"access": access_token, "refresh": refresh_token},
            "user": user
        }
    
    # 2. Check Device for Kiosk Mode
    result = await db.execute(select(Device).where(Device.device_id == mirror_id))
    device = result.scalars().first()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Mirror ID",
        )
        
    if device.status != "online":
        pass # Optional: We could reject if offline, but better to allow and maybe update status to online later
        
    user = User(
        id=device.id,
        name=f"Mirror {device.device_id}",
        email=f"{device.device_id}@kiosk.local",
        role="store_admin",
        store_id=device.store_id,
        is_active=True,
        created_at=datetime.utcnow()
    )
    
    access_token = create_access_token(data={"sub": user.id, "role": user.role, "store_id": user.store_id})
    refresh_token = create_refresh_token(data={"sub": user.id, "role": user.role, "store_id": user.store_id})
    
    return {
        "success": True,
        "tokens": {"access": access_token, "refresh": refresh_token},
        "user": user
    }

@router.get("/profile", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user
