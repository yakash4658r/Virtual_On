from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from schemas.product import SareeListResponse

class CartItemBase(BaseModel):
    quantity: int

class CartItemCreate(CartItemBase):
    saree_id: str

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(CartItemBase):
    id: str
    cart_id: str
    saree_id: str
    added_at: datetime
    saree: Optional[SareeListResponse] = None

    class Config:
        from_attributes = True

class CartBase(BaseModel):
    session_id: Optional[str] = None

class CartResponse(CartBase):
    id: str
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[CartItemResponse] = []
    
    total_price: float = 0.0

    class Config:
        from_attributes = True
