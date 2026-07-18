from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import get_db
from models.tryon import TryOnSession
from datetime import datetime

router = APIRouter()

@router.get("/download/{session_token}", response_model=dict)
async def download_result(session_token: str, db: AsyncSession = Depends(get_db)):
    """Public endpoint for QR code download — NO AUTH needed. Auto-expires after 24h."""
    result = await db.execute(
        select(TryOnSession).where(TryOnSession.session_token == session_token)
    )
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Check expiry
    if session.expires_at and datetime.utcnow() > session.expires_at:
        raise HTTPException(status_code=410, detail="This download link has expired (24h limit)")
    
    if session.status != "completed" or not session.result_image:
        raise HTTPException(status_code=404, detail="Result not ready yet")
    
    return {
        "success": True,
        "data": {
            "result_image": session.result_image,
            "customer_image": session.customer_image,
            "created_at": str(session.created_at),
            "expires_at": str(session.expires_at) if session.expires_at else None
        }
    }
