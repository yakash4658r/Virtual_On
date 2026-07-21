from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from models.device import Device
from models.store import Store
from models.product import Saree, Category
from models.tryon import TryOnSession
from datetime import datetime, timedelta
import uuid
import secrets

router = APIRouter()

@router.get("/device/{device_id}/info", response_model=dict)
async def get_device_info(device_id: str, db: AsyncSession = Depends(get_db)):
    """Get store info for mirror welcome screen — NO AUTH needed"""
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not registered")
    
    store_result = await db.execute(select(Store).where(Store.id == device.store_id))
    store = store_result.scalars().first()
    
    # Update device last_seen
    device.last_seen = datetime.utcnow()
    device.status = "online"
    await db.commit()
    
    return {
        "success": True,
        "data": {
            "device_id": device.device_id,
            "device_name": device.device_name,
            "store_name": store.store_name,
            "store_logo": store.logo_url,
            "store_id": store.id
        }
    }

@router.post("/session/start", response_model=dict)
async def start_session(device_id: str = Form(...), db: AsyncSession = Depends(get_db)):
    """Start anonymous mirror session — NO AUTH needed"""
    result = await db.execute(select(Device).where(Device.device_id == device_id))
    device = result.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not registered")
    
    session_token = secrets.token_urlsafe(32)
    
    return {
        "success": True,
        "data": {
            "session_token": session_token,
            "device_id": device_id,
            "store_id": device.store_id
        }
    }

@router.post("/upload-photo", response_model=dict)
async def upload_photo(
    session_token: str = Form(...),
    photo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload customer photo from mirror camera — NO AUTH needed"""
    from utils.image import process_upload_file
    photo_url = await process_upload_file(photo, "tryon-photos")
    
    return {
        "success": True,
        "data": {
            "photo_url": photo_url,
            "session_token": session_token
        }
    }

@router.post("/tryon", response_model=dict)
async def start_tryon(
    session_token: str = Form(...),
    saree_id: str = Form(...),
    customer_photo_url: str = Form(...),
    device_id: str = Form(None),
    store_id: str = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """Queue AI try-on job — NO AUTH needed"""
    # Verify saree exists
    result = await db.execute(select(Saree).where(Saree.id == saree_id))
    saree = result.scalars().first()
    if not saree:
        raise HTTPException(status_code=404, detail="Saree not found")
        
    actual_store_id = store_id or saree.store_id
    
    # -----------------------------------------------------
    # SUBSCRIPTION & CREDIT LIMIT LOGIC
    # -----------------------------------------------------
    from sqlalchemy import func
    
    # Get store
    store_res = await db.execute(select(Store).where(Store.id == actual_store_id))
    store = store_res.scalars().first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
        
    # Reset daily counter if new day
    today = datetime.utcnow().date()
    if store.last_reset_date and store.last_reset_date.date() < today:
        store.photos_used_today = 0
        store.last_reset_date = datetime.utcnow()
    elif not store.last_reset_date:
        store.last_reset_date = datetime.utcnow()
        
    # Check plan limit
    if store.daily_limit != -1:
        if store.photos_used_today >= store.daily_limit:
            raise HTTPException(status_code=429, detail="Daily limit reached. Upgrade plan.")
            
    # Check credits
    if store.credits_remaining < store.credits_per_swap:
        raise HTTPException(status_code=402, detail="Insufficient credits. Please recharge.")
        
    # Deduct credits
    store.credits_remaining -= store.credits_per_swap
    store.photos_used_today += 1
    # -----------------------------------------------------
    
    # Create TryOnSession
    session = TryOnSession(
        session_token=session_token,
        saree_id=saree_id,
        customer_image=customer_photo_url,
        device_id=device_id,
        store_id=actual_store_id,
        status="processing",
        ai_provider="mock",
        expires_at=datetime.utcnow() + timedelta(hours=24)
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    
    # In production, this queues a Celery task
    from tasks.gpu_tasks import process_tryon
    process_tryon.delay(str(session.id))
    
    return {
        "success": True,
        "data": {
            "job_id": session.id,
            "session_token": session_token,
            "status": session.status
        }
    }

@router.get("/tryon/{job_id}/status", response_model=dict)
async def get_tryon_status(job_id: str, db: AsyncSession = Depends(get_db)):
    """Poll try-on job status — NO AUTH needed"""
    result = await db.execute(select(TryOnSession).where(TryOnSession.id == job_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Try-on job not found")
    
    return {
        "success": True,
        "data": {
            "status": session.status,
            "result_image": session.result_image,
            "processing_time_ms": session.processing_time_ms,
            "error_message": session.error_message
        }
    }

@router.get("/tryon/{session_token}/qr", response_model=dict)
async def get_qr_data(session_token: str, db: AsyncSession = Depends(get_db)):
    """Get QR code download URL — NO AUTH needed"""
    result = await db.execute(
        select(TryOnSession).where(TryOnSession.session_token == session_token)
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    download_url = f"/api/public/download/{session_token}"
    
    return {
        "success": True,
        "data": {
            "download_url": download_url,
            "result_image": session.result_image,
            "expires_at": str(session.expires_at) if session.expires_at else None
        }
    }
