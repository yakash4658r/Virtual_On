from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.product import Saree, Category
from schemas.product import SareeCreate, SareeUpdate
import slugify
from utils.barcode import generate_barcode_id, generate_barcode_image
from utils.image import process_upload_file
from fastapi import UploadFile

async def create_saree(db: AsyncSession, saree_in: SareeCreate) -> Saree:
    base_slug = slugify.slugify(saree_in.name)
    slug = base_slug
    counter = 1
    # Simple while loop for slug generation (not ideal for async but okay for simple case)
    while (await db.execute(select(Saree).where(Saree.slug == slug))).scalars().first():
        slug = f"{base_slug}-{counter}"
        counter += 1
        
    barcode_id = generate_barcode_id()
    barcode_img = await generate_barcode_image(barcode_id, saree_in.name, saree_in.price)
    
    db_saree = Saree(
        **saree_in.model_dump(),
        slug=slug,
        barcode_id=barcode_id,
        barcode_image=barcode_img
    )
    db.add(db_saree)
    await db.commit()
    await db.refresh(db_saree)
    return db_saree

async def get_sarees(db: AsyncSession, skip: int = 0, limit: int = 20):
    result = await db.execute(select(Saree).where(Saree.is_active == True).offset(skip).limit(limit))
    return result.scalars().all()
