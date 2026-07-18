from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/upload/")
async def create_tryon(
    saree_id: str = Form(...),
    customer_image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    from utils.image import process_upload_file
    img_url = await process_upload_file(customer_image, "tryon")
    
    # Create TryOnSession record in DB
    from models.tryon import TryOnSession
    from models.product import Saree
    from sqlalchemy.future import select
    import uuid
    from datetime import datetime
    
    # Check saree
    result = await db.execute(select(Saree).where(Saree.id == saree_id))
    saree = result.scalars().first()
    if not saree:
        return {"success": False, "message": "Saree not found"}
        
    session_id = str(uuid.uuid4())
    new_session = TryOnSession(
        id=session_id,
        session_token=session_id,
        store_id=saree.store_id, # Link session to the store
        saree_id=saree_id,
        customer_image=img_url,
        status="processing",
        created_at=datetime.utcnow()
    )
    db.add(new_session)
    await db.commit()
    
    # Dispatch Celery task
    from tasks.gpu_tasks import process_tryon
    process_tryon.delay(session_id)
    
    return {"success": True, "message": "Try-on processing started", "session_id": session_id}

@router.get("/status/{session_id}/", response_model=dict)
async def get_status(session_id: str, db: AsyncSession = Depends(get_db)):
    from models.tryon import TryOnSession
    from sqlalchemy.future import select
    
    result = await db.execute(select(TryOnSession).where(TryOnSession.id == session_id))
    session = result.scalars().first()
    
    if not session:
        return {"success": False, "message": "Session not found"}
        
    return {
        "success": True, 
        "status": session.status, 
        "result_image": session.result_image,
        "processing_time": session.processing_time_ms
    }

@router.get("/history/", response_model=dict)
async def get_history(db: AsyncSession = Depends(get_db), user = Depends(get_current_user)):
    return {"success": True, "data": []}
