from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from core.database import get_db
from core.dependencies import get_current_super_admin
from models.store import Store
from models.tryon import TryOnSession
from pydantic import BaseModel
from typing import Optional
import re

router = APIRouter()

class StoreCreate(BaseModel):
    store_name: str
    owner_name: Optional[str] = None
    owner_email: str
    owner_phone: Optional[str] = None
    address: Optional[str] = None
    plan_type: str = "basic"
    initial_credits: int = 100

class StoreUpdate(BaseModel):
    store_name: Optional[str] = None
    owner_name: Optional[str] = None
    owner_phone: Optional[str] = None
    address: Optional[str] = None
    plan_type: Optional[str] = None
    is_active: Optional[bool] = None

class AddCredits(BaseModel):
    amount: int

async def generate_activation_code(store_name: str, db: AsyncSession) -> str:
    prefix = re.sub(r'[^A-Z]', '', store_name.upper())[:6]
    if len(prefix) < 3:
        prefix = (prefix + "STR")[:6]
        
    count = (await db.execute(select(func.count(Store.id)).where(Store.activation_code.like(f"{prefix}-%")))).scalar()
    sequence = str(count + 1).zfill(3)
    return f"{prefix}-{sequence}"

@router.post("/stores", response_model=dict)
async def create_store(
    data: StoreCreate,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_super_admin)
):
    activation_code = await generate_activation_code(data.store_name, db)
    
    daily_limit = -1 if data.plan_type == "unlimited" else (500 if data.plan_type == "pro" else 250)
    
    store = Store(
        store_name=data.store_name,
        activation_code=activation_code,
        owner_name=data.owner_name,
        owner_email=data.owner_email,
        owner_phone=data.owner_phone,
        address=data.address,
        plan_type=data.plan_type,
        daily_limit=daily_limit,
        credits_remaining=data.initial_credits
    )
    db.add(store)
    await db.commit()
    await db.refresh(store)
    
    return {"success": True, "message": "Store created", "data": {
        "id": store.id,
        "store_name": store.store_name,
        "activation_code": store.activation_code
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
        tryon_count = (await db.execute(
            select(func.count(TryOnSession.id)).where(TryOnSession.store_id == s.id)
        )).scalar()
        
        data.append({
            "id": s.id,
            "store_name": s.store_name,
            "activation_code": s.activation_code,
            "plan_type": s.plan_type,
            "credits_remaining": s.credits_remaining,
            "photos_used_today": s.photos_used_today,
            "daily_limit": s.daily_limit,
            "is_active": s.is_active,
            "tryon_count": tryon_count,
            "created_at": str(s.created_at)
        })
    
    return {"success": True, "data": data}

@router.get("/stores/{store_id}", response_model=dict)
async def get_store(
    store_id: str,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_super_admin)
):
    result = await db.execute(select(Store).where(Store.id == store_id))
    store = result.scalars().first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
        
    return {"success": True, "data": {
        "id": store.id,
        "store_name": store.store_name,
        "activation_code": store.activation_code,
        "owner_name": store.owner_name,
        "owner_email": store.owner_email,
        "owner_phone": store.owner_phone,
        "address": store.address,
        "plan_type": store.plan_type,
        "daily_limit": store.daily_limit,
        "credits_remaining": store.credits_remaining,
        "photos_used_today": store.photos_used_today,
        "is_active": store.is_active
    }}

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
    
    if data.plan_type:
        store.daily_limit = -1 if data.plan_type == "unlimited" else (500 if data.plan_type == "pro" else 250)
        
    await db.commit()
    return {"success": True, "message": "Store updated"}

@router.post("/stores/{store_id}/credits", response_model=dict)
async def add_credits(
    store_id: str,
    data: AddCredits,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_super_admin)
):
    result = await db.execute(select(Store).where(Store.id == store_id))
    store = result.scalars().first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
        
    store.credits_remaining += data.amount
    await db.commit()
    
    return {"success": True, "message": f"Added {data.amount} credits. Total: {store.credits_remaining}"}

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

@router.get("/analytics", response_model=dict)
async def global_analytics(
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_super_admin)
):
    total_stores = (await db.execute(select(func.count(Store.id)))).scalar()
    active_stores = (await db.execute(
        select(func.count(Store.id)).where(Store.is_active == True)
    )).scalar()
    total_tryons = (await db.execute(select(func.count(TryOnSession.id)))).scalar()
    
    return {"success": True, "data": {
        "stores": {"total": total_stores, "active": active_stores},
        "tryons": {"total": total_tryons}
    }}
