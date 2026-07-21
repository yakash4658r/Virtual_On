from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.product import Saree, Category
from schemas.product import SareeCreate, SareeUpdate
from slugify import slugify
from utils.barcode import generate_barcode_id, generate_barcode_image
from utils.image import process_upload_file
from fastapi import UploadFile

async def create_saree(db: AsyncSession, saree_in: SareeCreate, store_id: str = None) -> Saree:
    base_slug = slugify(saree_in.name)
    slug = base_slug
    counter = 1
    # Simple while loop for slug generation (not ideal for async but okay for simple case)
    while (await db.execute(select(Saree).where(Saree.slug == slug))).scalars().first():
        slug = f"{base_slug}-{counter}"
        counter += 1
        
    barcode_id = generate_barcode_id()
    barcode_img = await generate_barcode_image(barcode_id, saree_in.name, saree_in.price)
    
    saree_data = saree_in.model_dump()
    saree_data.pop('store_id', None)  # Remove if present to avoid duplicate
    
    db_saree = Saree(
        **saree_data,
        slug=slug,
        barcode_id=barcode_id,
        barcode_image=barcode_img,
        store_id=store_id or saree_in.store_id if hasattr(saree_in, 'store_id') else store_id
    )
    db.add(db_saree)
    await db.commit()
    await db.refresh(db_saree)
    return db_saree

async def get_sarees(db: AsyncSession, skip: int = 0, limit: int = 20, store_id: str = None):
    query = select(Saree).where(Saree.is_active == True)
    if store_id:
        query = query.where(Saree.store_id == store_id)
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()

