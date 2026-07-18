from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlalchemy.future import select
from core.database import get_db
from core.dependencies import get_current_active_admin, get_current_store_id
from models.product import Saree
from models.user import User
from models.tryon import TryOnSession
from pydantic import BaseModel

router = APIRouter()

class DashboardResponse(BaseModel):
    success: bool
    data: dict

@router.get("/dashboard/", response_model=DashboardResponse)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    store_id: str = Depends(get_current_store_id)
):
    from models.device import Device
    
    # Stats: Sarees
    sarees_total = (await db.execute(select(func.count(Saree.id)).where(Saree.store_id == store_id))).scalar()
    sarees_active = (await db.execute(select(func.count(Saree.id)).where(Saree.store_id == store_id, Saree.in_stock == True))).scalar()
    sarees_out = sarees_total - sarees_active

    # Stats: Users (Customers mapped to this store)
    users_total = (await db.execute(select(func.count(User.id)).where(User.store_id == store_id, User.role == "customer"))).scalar()

    # Stats: Devices
    devices_total = (await db.execute(select(func.count(Device.id)).where(Device.store_id == store_id))).scalar()
    devices_online = (await db.execute(select(func.count(Device.id)).where(Device.store_id == store_id, Device.status == "online"))).scalar()

    # Stats: Tryons
    tryons_total = (await db.execute(select(func.count(TryOnSession.id)).where(TryOnSession.store_id == store_id))).scalar()
    
    # Recent sessions
    recent_result = await db.execute(
        select(TryOnSession).where(TryOnSession.store_id == store_id).order_by(TryOnSession.created_at.desc()).limit(5)
    )
    recent_sessions = [
        {"id": s.id, "created_at": str(s.created_at), "status": s.status, "device_id": s.device_id}
        for s in recent_result.scalars().all()
    ]
    
    data = {
        "sarees": {
            "total": sarees_total,
            "active": sarees_active,
            "out_of_stock": sarees_out
        },
        "users": {
            "total": users_total
        },
        "devices": {
            "total": devices_total,
            "online": devices_online
        },
        "tryons": {
            "today": tryons_total, # Mock date filtering for now
            "this_week": tryons_total,
            "this_month": tryons_total,
            "total": tryons_total
        },
        "recent_sessions": recent_sessions,
        "popular_sarees": [],
        "ai_stats": {
            "total_cost_usd": 0.0,
            "avg_processing_time": 0.0
        }
    }
    return {"success": True, "data": data}

@router.get("/settings/", response_model=dict)
async def get_settings(admin = Depends(get_current_active_admin)):
    # Mock settings since we didn't create a Settings table yet
    return {
        "success": True, 
        "data": {
            "store_name": "Virtual On Sarees",
            "support_email": "support@virtualon.com",
            "support_phone": "+91 9876543210",
            "ai_provider": "replicate",
            "max_tryons": 5
        }
    }

@router.put("/settings/", response_model=dict)
async def update_settings(data: dict, admin = Depends(get_current_active_admin)):
    return {"success": True, "message": "Settings updated successfully"}

@router.get("/sessions/", response_model=dict)
async def get_sessions(
    db: AsyncSession = Depends(get_db),
    store_id: str = Depends(get_current_store_id)
):
    result = await db.execute(
        select(TryOnSession)
        .where(TryOnSession.store_id == store_id)
        .order_by(TryOnSession.created_at.desc())
        .limit(100)
    )
    sessions = result.scalars().all()
    
    data = []
    for s in sessions:
        data.append({
            "id": s.id,
            "session_token": s.session_token,
            "saree_id": s.saree_id,
            "customer_image": s.customer_image,
            "result_image": s.result_image,
            "status": s.status,
            "device_id": s.device_id,
            "processing_time_ms": s.processing_time_ms,
            "created_at": str(s.created_at)
        })
        
    return {"success": True, "data": data}
