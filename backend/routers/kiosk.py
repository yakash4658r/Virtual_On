from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid

from core.database import get_db
from core.dependencies import get_current_store_id
from models.tryon import CustomerSession, SessionSelection
from models.product import Saree
from schemas.kiosk import (
    SessionStartRequest, SessionStartResponse,
    TryOnRequest, TryOnResponse,
    FavoriteRequest, FavoriteResponse,
    SessionSummaryResponse, CompleteSessionResponse
)
from ai.provider import get_ai_provider

router = APIRouter()

@router.post("/session/start", response_model=SessionStartResponse)
async def start_session(
    request: SessionStartRequest,
    store_id: str = Depends(get_current_store_id),
    db: AsyncSession = Depends(get_db)
):
    new_session = CustomerSession(
        store_id=store_id,
        customer_photo_url=request.customer_photo_url,
        status="active"
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    
    return SessionStartResponse(session_id=new_session.id)


@router.post("/session/{session_id}/tryon", response_model=TryOnResponse)
async def perform_tryon(
    session_id: str,
    request: TryOnRequest,
    store_id: str = Depends(get_current_store_id),
    db: AsyncSession = Depends(get_db)
):
    # Verify session belongs to store
    result = await db.execute(select(CustomerSession).where(CustomerSession.id == session_id, CustomerSession.store_id == store_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # Verify saree exists
    saree_result = await db.execute(select(Saree).where(Saree.id == request.saree_id))
    saree = saree_result.scalars().first()
    if not saree:
        raise HTTPException(status_code=404, detail="Saree not found")

    # ---------- SUBSCRIPTION & CREDIT CHECK ----------
    from models.store import Store
    from datetime import datetime
    store_res = await db.execute(select(Store).where(Store.id == store_id))
    store = store_res.scalars().first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    today = datetime.utcnow().date()
    if store.last_reset_date and store.last_reset_date.date() < today:
        store.photos_used_today = 0
        store.last_reset_date = datetime.utcnow()
    elif not store.last_reset_date:
        store.last_reset_date = datetime.utcnow()

    if store.daily_limit != -1 and store.photos_used_today >= store.daily_limit:
        raise HTTPException(status_code=429, detail="Daily try-on limit reached. Please upgrade your plan.")

    if store.credits_remaining < store.credits_per_swap:
        raise HTTPException(status_code=402, detail="Insufficient AI credits. Please contact your store manager.")

    store.credits_remaining -= store.credits_per_swap
    store.photos_used_today += 1
    # -------------------------------------------------
    
    # Run AI
    ai = get_ai_provider("replicate")
    tryon_result_url = await ai.run_tryon(saree.image_url, session.customer_photo_url)
    
    # Check if a selection already exists for this saree
    sel_result = await db.execute(select(SessionSelection).where(
        SessionSelection.session_id == session.id,
        SessionSelection.saree_id == request.saree_id
    ))
    selection = sel_result.scalars().first()
    
    if not selection:
        selection = SessionSelection(
            session_id=session.id,
            saree_id=request.saree_id,
            tryon_result_url=tryon_result_url
        )
        db.add(selection)
    else:
        selection.tryon_result_url = tryon_result_url

    session.total_tryons = (session.total_tryons or 0) + 1
    await db.commit()
    
    return TryOnResponse(tryon_result_url=tryon_result_url, job_id=str(uuid.uuid4()))


@router.post("/session/{session_id}/favorite", response_model=FavoriteResponse)
async def toggle_favorite(
    session_id: str,
    request: FavoriteRequest,
    store_id: str = Depends(get_current_store_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CustomerSession).where(CustomerSession.id == session_id, CustomerSession.store_id == store_id))
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    sel_result = await db.execute(select(SessionSelection).where(
        SessionSelection.session_id == session_id,
        SessionSelection.saree_id == request.saree_id
    ))
    selection = sel_result.scalars().first()
    
    if not selection:
        # Create it if it doesn't exist (maybe they favorited before AI completed?)
        selection = SessionSelection(
            session_id=session_id,
            saree_id=request.saree_id,
            is_favorited=True
        )
        db.add(selection)
    else:
        selection.is_favorited = not selection.is_favorited

    await db.commit()
    
    # Count total favorites
    count_result = await db.execute(select(SessionSelection).where(
        SessionSelection.session_id == session_id,
        SessionSelection.is_favorited == True
    ))
    total_favs = len(count_result.scalars().all())
    
    session.selected_sarees_count = total_favs
    await db.commit()

    return FavoriteResponse(success=True, total_favorites=total_favs)


@router.get("/session/{session_id}/summary", response_model=SessionSummaryResponse)
async def get_session_summary(
    session_id: str,
    store_id: str = Depends(get_current_store_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CustomerSession)
        .options(selectinload(CustomerSession.selections))
        .where(CustomerSession.id == session_id, CustomerSession.store_id == store_id)
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    favorites = [s for s in session.selections if s.is_favorited]
    
    return SessionSummaryResponse(
        session_id=session.id,
        status=session.status,
        total_tryons=session.total_tryons,
        selected_sarees_count=len(favorites),
        selections=favorites
    )


@router.post("/session/{session_id}/complete", response_model=CompleteSessionResponse)
async def complete_session(
    session_id: str,
    store_id: str = Depends(get_current_store_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(CustomerSession)
        .options(selectinload(CustomerSession.selections))
        .where(CustomerSession.id == session_id, CustomerSession.store_id == store_id)
    )
    session = result.scalars().first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.status = "completed"
    from sqlalchemy.sql import func
    session.session_ended_at = func.now()
    await db.commit()
    
    favorites = [s for s in session.selections if s.is_favorited]
    summary = SessionSummaryResponse(
        session_id=session.id,
        status=session.status,
        total_tryons=session.total_tryons,
        selected_sarees_count=len(favorites),
        selections=favorites
    )
    
    return CompleteSessionResponse(
        summary=summary,
        qr_code_url=f"https://yakash.tech/qr/{session.id}" # Mock QR
    )
