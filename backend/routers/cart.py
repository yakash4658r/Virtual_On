from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db

router = APIRouter()

@router.get("/")
async def get_cart(db: AsyncSession = Depends(get_db)):
    return {"success": True, "data": {"items": [], "total_price": 0.0}}

@router.post("/add/", response_model=dict)
async def add_to_cart(data: dict, db: AsyncSession = Depends(get_db)):
    return {"success": True, "message": "Item added"}

@router.get("/count/", response_model=dict)
async def get_cart_count(db: AsyncSession = Depends(get_db)):
    return {"success": True, "count": 0}

@router.delete("/remove/{item_id}/", response_model=dict)
async def remove_from_cart(item_id: str, db: AsyncSession = Depends(get_db)):
    return {"success": True, "message": "Item removed"}

@router.delete("/clear/", response_model=dict)
async def clear_cart(db: AsyncSession = Depends(get_db)):
    return {"success": True, "message": "Cart cleared"}
