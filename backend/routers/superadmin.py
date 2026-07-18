from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from core.database import get_db
from core.dependencies import get_current_super_admin
from models.store import Store
from models.device import Device
from models.user import User
from models.product import Saree
from models.tryon import TryOnSession
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class StoreCreate(BaseModel):
    store_name: str
    store_code: str
    owner_email: str
    address: Optional[str] = None
    phone: Optional[str] = None
    subscription_plan: str = "starter"
    ai_credits_remaining: int = 100

class StoreUpdate(BaseModel):
    store_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    subscription_plan: Optional[str] = None
    ai_credits_remaining: Optional[int] = None
    is_active: Optional[bool] = None

@router.post("/stores", response_model=dict)
async def create_store(
    data: StoreCreate,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_super_admin)
):
    # Check store_code unique
    result = await db.execute(select(Store).where(Store.store_code == data.store_code))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Store code already exists")
    
    store = Store(**data.model_dump())
    db.add(store)
    await db.commit()
    await db.refresh(store)
    
    return {"success": True, "message": "Store created", "data": {
        "id": store.id,
        "store_name": store.store_name,
        "store_code": store.store_code
    }}

@router.get("/stores", response_model=dict)
async def list_stores(
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_super_admin)
):
    result = await db.execute(select(Store))
    stores = result.scalars().all()
    
    data = []
    for s in stores:
        # Get counts
        saree_count = (await db.execute(
            select(func.count(Saree.id)).where(Saree.store_id == s.id)
        )).scalar()
        device_count = (await db.execute(
            select(func.count(Device.id)).where(Device.store_id == s.id)
        )).scalar()
        tryon_count = (await db.execute(
            select(func.count(TryOnSession.id)).where(TryOnSession.store_id == s.id)
        )).scalar()
        
        data.append({
            "id": s.id,
            "store_name": s.store_name,
            "store_code": s.store_code,
            "owner_email": s.owner_email,
            "subscription_plan": s.subscription_plan,
            "ai_credits_remaining": s.ai_credits_remaining,
            "is_active": s.is_active,
            "saree_count": saree_count,
            "device_count": device_count,
            "tryon_count": tryon_count,
            "created_at": str(s.created_at)
        })
    
    return {"success": True, "data": data}

@router.put("/stores/{store_id}", response_model=dict)
async def update_store(
    store_id: str,
    data: StoreUpdate,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_super_admin)
):
    result = await db.execute(select(Store).where(Store.id == store_id))
    store = result.scalars().first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(store, key, value)
    
    await db.commit()
    return {"success": True, "message": "Store updated"}

@router.delete("/stores/{store_id}", response_model=dict)
async def deactivate_store(
    store_id: str,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_super_admin)
):
    result = await db.execute(select(Store).where(Store.id == store_id))
    store = result.scalars().first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    store.is_active = False
    await db.commit()
    return {"success": True, "message": "Store deactivated"}

@router.post("/stores/{store_id}/devices", response_model=dict)
async def assign_device_to_store(
    store_id: str,
    device_id: str,
    device_name: str = "Mirror",
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_super_admin)
):
    # Verify store exists
    result = await db.execute(select(Store).where(Store.id == store_id))
    store = result.scalars().first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    device = Device(
        device_id=device_id,
        store_id=store_id,
        device_name=device_name,
        status="offline"
    )
    db.add(device)
    await db.commit()
    return {"success": True, "message": f"Device {device_id} assigned to {store.store_name}"}

@router.get("/analytics", response_model=dict)
async def global_analytics(
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_super_admin)
):
    total_stores = (await db.execute(select(func.count(Store.id)))).scalar()
    active_stores = (await db.execute(
        select(func.count(Store.id)).where(Store.is_active == True)
    )).scalar()
    total_devices = (await db.execute(select(func.count(Device.id)))).scalar()
    online_devices = (await db.execute(
        select(func.count(Device.id)).where(Device.status == "online")
    )).scalar()
    total_tryons = (await db.execute(select(func.count(TryOnSession.id)))).scalar()
    total_sarees = (await db.execute(select(func.count(Saree.id)))).scalar()
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    
    return {"success": True, "data": {
        "stores": {"total": total_stores, "active": active_stores},
        "devices": {"total": total_devices, "online": online_devices},
        "tryons": {"total": total_tryons},
        "sarees": {"total": total_sarees},
        "users": {"total": total_users}
    }}
