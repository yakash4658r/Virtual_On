from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from models.product import Saree

async def get_saree_by_barcode(db: AsyncSession, barcode_id: str) -> Saree | None:
    result = await db.execute(select(Saree).where(Saree.barcode_id == barcode_id, Saree.is_active == True))
    return result.scalars().first()
