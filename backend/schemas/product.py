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
    image_url: Optional[str] = None  # Computed from image_front
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        instance = super().model_validate(obj, *args, **kwargs)
        # Derive image_url from image_front
        if not instance.image_url and instance.image_front:
            instance.image_url = instance.image_front
        return instance

class SareeDetailResponse(SareeBase):
    id: str
    category: Optional[CategoryResponse] = None
    created_at: Optional[datetime] = None
    all_images: List[str] = []
    image_url: Optional[str] = None  # Computed: first non-null image
    
    class Config:
        from_attributes = True
    
    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        instance = super().model_validate(obj, *args, **kwargs)
        # Derive image_url
        if not instance.image_url:
            instance.image_url = instance.image_front or instance.tryon_image or instance.image_back
        return instance

class PaginationResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int

class SareePaginatedResponse(BaseModel):
    success: bool
    data: List[SareeListResponse]
    pagination: PaginationResponse
