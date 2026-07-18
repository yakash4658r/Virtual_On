from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from core.database import get_db
from core.dependencies import get_current_active_admin, get_current_store_id
from models.device import Device
from models.store import Store
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class DeviceCreate(BaseModel):
    device_id: str
    device_name: Optional[str] = None
    location: Optional[str] = None

@router.post("/register", response_model=dict)
async def register_device(
    data: DeviceCreate,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_active_admin),
    store_id: str = Depends(get_current_store_id)
):
    """Register a new mirror device to the admin's store"""
    # Check if device_id already taken
    result = await db.execute(select(Device).where(Device.device_id == data.device_id))
    existing = result.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Device ID already registered")
    
    device = Device(
        device_id=data.device_id,
        store_id=store_id,
        device_name=data.device_name,
        location=data.location,
        status="offline"
    )
    db.add(device)
    await db.commit()
    await db.refresh(device)
    
    return {"success": True, "message": "Device registered", "data": {
        "id": device.id,
        "device_id": device.device_id,
        "store_id": store_id,
        "status": device.status
    }}

@router.get("/", response_model=dict)
async def list_devices(
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_active_admin),
    store_id: str = Depends(get_current_store_id)
):
    """List all devices for the admin's store"""
    result = await db.execute(select(Device).where(Device.store_id == store_id))
    devices = result.scalars().all()
    
    data = []
    for d in devices:
        data.append({
            "id": d.id,
            "device_id": d.device_id,
            "device_name": d.device_name,
            "location": d.location,
            "status": d.status,
            "last_seen": str(d.last_seen) if d.last_seen else None,
            "created_at": str(d.created_at)
        })
    
    return {"success": True, "data": data}

@router.get("/{device_id}", response_model=dict)
async def get_device(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_active_admin)
):
    """Get device details"""
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    return {"success": True, "data": {
        "id": device.id,
        "device_id": device.device_id,
        "device_name": device.device_name,
        "location": device.location,
        "status": device.status,
        "last_seen": str(device.last_seen) if device.last_seen else None
    }}

@router.put("/{device_id}/status", response_model=dict)
async def update_device_status(
    device_id: str,
    status: str,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_active_admin)
):
    """Update device status"""
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    device.status = status
    await db.commit()
    return {"success": True, "message": f"Device status updated to {status}"}

@router.post("/{device_id}/heartbeat", response_model=dict)
async def device_heartbeat(device_id: str, db: AsyncSession = Depends(get_db)):
    """Device keepalive ping — NO AUTH (called from kiosk)"""
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    device.last_seen = datetime.utcnow()
    device.status = "online"
    await db.commit()
    return {"success": True}
