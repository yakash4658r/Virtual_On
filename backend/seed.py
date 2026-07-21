import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import AsyncSessionLocal
from models.store import Store
from models.device import Device
from models.product import Category

async def seed_data():
    async with AsyncSessionLocal() as db:
        print("=" * 50)
        print("  SEEDING AI SMART MIRROR DATABASE (NEW AUTH)")
        print("=" * 50)
        
        # 1. Seed Default Store
        activation_code = "KARUVA-001"
        result = await db.execute(select(Store).where(Store.activation_code == activation_code))
        store = result.scalars().first()
        
        if not store:
            print("\n[+] Creating Demo Store...")
            store = Store(
                store_name="Karuva Silks",
                activation_code=activation_code,
                owner_name="Yakash",
                owner_email="admin@karuva.com",
                address="123 Silk Street, Chennai",
                plan_type="unlimited",
                credits_remaining=5000,
                daily_limit=-1,
            )
            db.add(store)
            await db.flush()  # Get the store.id
            print(f"    Store ID: {store.id}")
        else:
            print("\n[=] Demo Store already exists.")
        
        # 5. Seed Categories
        categories_data = [
            {"name": "Kanjivaram Silk", "slug": "kanjivaram-silk", "description": "Traditional South Indian silk"},
            {"name": "Banarasi Silk", "slug": "banarasi-silk", "description": "Rich Banarasi sarees"},
            {"name": "Cotton", "slug": "cotton", "description": "Comfortable daily wear"},
            {"name": "Georgette", "slug": "georgette", "description": "Lightweight and flowy"},
        ]
        
        print("\n[+] Seeding Categories...")
        for cat_data in categories_data:
            result = await db.execute(select(Category).where(Category.slug == cat_data["slug"]))
            cat = result.scalars().first()
            if not cat:
                new_cat = Category(**cat_data)
                db.add(new_cat)
                print(f"    Created: {cat_data['name']}")
                
        await db.commit()
        
        print("\n" + "=" * 50)
        print("  SEEDING COMPLETE!")
        print("=" * 50)
        print(f"\n  Super Admin ID:")
        print(f"    yakash4658r")
        print(f"\n  Store Admin ID:")
        print(f"    {activation_code}")
        print("=" * 50)

if __name__ == "__main__":
    asyncio.run(seed_data())
