from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SessionStartRequest(BaseModel):
    customer_photo_url: str

class SessionStartResponse(BaseModel):
    session_id: str

class TryOnRequest(BaseModel):
    saree_id: str

class TryOnResponse(BaseModel):
    tryon_result_url: Optional[str]
    job_id: str

class FavoriteRequest(BaseModel):
    saree_id: str

class FavoriteResponse(BaseModel):
    success: bool
    total_favorites: int

class SessionSelectionSchema(BaseModel):
    id: str
    saree_id: str
    tryon_result_url: Optional[str]
    is_favorited: bool
    tried_at: datetime
    
    class Config:
        from_attributes = True

class SessionSummaryResponse(BaseModel):
    session_id: str
    status: str
    total_tryons: int
    selected_sarees_count: int
    selections: List[SessionSelectionSchema]

class CompleteSessionResponse(BaseModel):
    summary: SessionSummaryResponse
    qr_code_url: Optional[str]
