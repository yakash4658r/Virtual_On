from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from core.database import get_db
from core.dependencies import get_current_active_admin, get_current_store_id
from models.product import Category, Saree
from schemas.product import CategoryResponse, SareeListResponse, SareeDetailResponse, SareeCreate, SareePaginatedResponse, PaginationResponse
from services.product_service import create_saree, get_sarees

router = APIRouter()

@router.get("/categories/", response_model=dict)
async def list_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.is_active == True))
    categories = result.scalars().all()
    # Mocking saree_count for now
    return {"success": True, "data": [{"id": c.id, "name": c.name, "slug": c.slug, "saree_count": 0} for c in categories]}

@router.get("/", response_model=SareePaginatedResponse)
async def list_sarees(
    page: int = 1, 
    page_size: int = 12, 
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    skip = (page - 1) * page_size
    # Simplified for plan phase, real implementation needs full filtering
    sarees = await get_sarees(db, skip=skip, limit=page_size)
    total = len(sarees) # mock total
    
    return {
        "success": True,
        "data": sarees,
        "pagination": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
    }

@router.get("/{slug}/", response_model=dict)
async def get_saree_by_slug(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Saree).where(Saree.slug == slug))
    saree = result.scalars().first()
    if not saree:
        raise HTTPException(status_code=404, detail="Saree not found")
        
    cat_result = await db.execute(select(Category).where(Category.id == saree.category_id))
    saree.category = cat_result.scalars().first()
    
    return {"success": True, "data": SareeDetailResponse.model_validate(saree).model_dump()}

@router.get("/barcode/{barcode_id}/", response_model=dict)
async def get_saree_by_barcode(barcode_id: str, db: AsyncSession = Depends(get_db)):
    from services.barcode_service import get_saree_by_barcode as svc_get_barcode
    saree = await svc_get_barcode(db, barcode_id)
    if not saree:
        raise HTTPException(status_code=404, detail="Saree not found")
        
    cat_result = await db.execute(select(Category).where(Category.id == saree.category_id))
    saree.category = cat_result.scalars().first()
    
    return {"success": True, "data": SareeDetailResponse.model_validate(saree).model_dump()}

@router.post("/admin/create", response_model=dict)
async def add_saree(
    name: str = Form(...),
    category_id: str = Form(...),
    price: float = Form(...),
    color: str = Form(...),
    description: str = Form(""),
    image_front: UploadFile = File(None),
    tryon_image: UploadFile = File(None),
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_active_admin),
    store_id: str = Depends(get_current_store_id)
):
    from utils.image import process_upload_file
    
    img_front_url = await process_upload_file(image_front) if image_front else None
    tryon_img_url = await process_upload_file(tryon_image) if tryon_image else None
    
    saree_in = SareeCreate(
        name=name,
        category_id=category_id,
        price=price,
        color=color,
        description=description,
        slug="", # generated in service
        image_front=img_front_url,
        tryon_image=tryon_img_url
    )
    
    saree = await create_saree(db, saree_in, store_id=store_id)
    return {"success": True, "message": "Saree created", "data": saree}

@router.get("/admin/list/", response_model=dict)
async def list_sarees_admin(
    page: int = 1, 
    page_size: int = 20, 
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_active_admin),
    store_id: str = Depends(get_current_store_id)
):
    skip = (page - 1) * page_size
    # Fetch sarees for this store
    sarees = await get_sarees(db, skip=skip, limit=page_size, store_id=store_id)
    total = len(sarees)
    
    # We need to return category object inside
    saree_data = []
    for s in sarees:
        cat_result = await db.execute(select(Category).where(Category.id == s.category_id))
        s.category = cat_result.scalars().first()
        saree_data.append(s)

    # Use Pydantic to serialize properly
    serialized_sarees = [SareeDetailResponse.model_validate(s).model_dump() for s in saree_data]
        
    return {
        "success": True,
        "data": serialized_sarees,
        "pagination": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }
    }

@router.get("/admin/barcodes/all/", response_model=dict)
async def get_all_barcodes(
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_active_admin),
    store_id: str = Depends(get_current_store_id)
):
    sarees = await get_sarees(db, skip=0, limit=100, store_id=store_id)
    data = []
    for s in sarees:
        data.append({
            "id": s.id,
            "name": s.name,
            "barcode_id": s.barcode_id,
            "barcode_image": s.barcode_image,
            "price": s.price
        })
    return {"success": True, "count": len(data), "data": data}

@router.put("/admin/{saree_id}/update/", response_model=dict)
async def update_saree(
    saree_id: str,
    name: str = Form(None),
    price: float = Form(None),
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_active_admin)
):
    result = await db.execute(select(Saree).where(Saree.id == saree_id))
    saree = result.scalars().first()
    if not saree:
        raise HTTPException(status_code=404, detail="Saree not found")
        
    if name:
        saree.name = name
    if price:
        saree.price = price
        
    await db.commit()
    return {"success": True, "message": "Saree updated"}

@router.delete("/admin/{saree_id}/update/", response_model=dict)
async def delete_saree(
    saree_id: str,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_active_admin)
):
    result = await db.execute(select(Saree).where(Saree.id == saree_id))
    saree = result.scalars().first()
    if not saree:
        raise HTTPException(status_code=404, detail="Saree not found")
        
    await db.delete(saree)
    await db.commit()
    return {"success": True, "message": "Saree deleted"}

@router.post("/admin/categories/create/", response_model=dict)
async def create_category(
    data: dict,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_active_admin)
):
    """Create a new category"""
    from slugify import slugify
    name = data.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Category name is required")
    
    slug = slugify(name)
    # Check unique slug
    result = await db.execute(select(Category).where(Category.slug == slug))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    category = Category(
        name=name,
        slug=slug,
        description=data.get("description", ""),
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    
    return {"success": True, "message": "Category created", "data": {
        "id": category.id,
        "name": category.name,
        "slug": category.slug
    }}

