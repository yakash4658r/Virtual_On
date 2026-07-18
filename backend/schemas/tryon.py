from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime
from schemas.user import UserResponse
from schemas.product import SareeListResponse

class TryOnBase(BaseModel):
    status: str
    error_message: Optional[str] = None
    ai_provider: str
    ai_metadata: Optional[Dict[str, Any]] = None
    is_public: bool = False

class TryOnCreate(BaseModel):
    saree_id: str
    customer_image: str

class TryOnResponse(TryOnBase):
    id: str
    user_id: Optional[str] = None
    saree_id: str
    customer_image: str
    result_image: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    user: Optional[UserResponse] = None
    saree: Optional[SareeListResponse] = None
    
    class Config:
        from_attributes = True
