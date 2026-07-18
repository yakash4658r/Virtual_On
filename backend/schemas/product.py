from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class CategoryResponse(CategoryBase):
    id: str
    saree_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

class SareeBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    price: float
    color: str
    fabric: Optional[str] = None
    occasion: Optional[str] = None
    barcode_id: Optional[str] = None
    barcode_image: Optional[str] = None
    
    image_front: Optional[str] = None
    image_back: Optional[str] = None
    image_closeup: Optional[str] = None
    image_pallu: Optional[str] = None
    tryon_image: Optional[str] = None
    
    in_stock: bool = True
    stock_quantity: int = 0
    is_featured: bool = False
    is_active: bool = True

class SareeCreate(SareeBase):
    category_id: str

class SareeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    color: Optional[str] = None
    fabric: Optional[str] = None
    occasion: Optional[str] = None
    in_stock: Optional[bool] = None
    stock_quantity: Optional[int] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None

class SareeListResponse(SareeBase):
    id: str
    category_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class SareeDetailResponse(SareeBase):
    id: str
    category: CategoryResponse
    created_at: datetime
    all_images: List[str] = []
    
    class Config:
        from_attributes = True

class PaginationResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int

class SareePaginatedResponse(BaseModel):
    success: bool
    data: List[SareeListResponse]
    pagination: PaginationResponse
