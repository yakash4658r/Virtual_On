import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from core.database import AsyncSessionLocal
from models.store import Store
from models.device import Device
from models.user import User
from models.product import Category
from core.security import get_password_hash

async def seed_data():
    async with AsyncSessionLocal() as db:
        print("=" * 50)
        print("  SEEDING AI SMART MIRROR DATABASE")
        print("=" * 50)
        
        # 1. Seed Default Store
        store_code = "DEMO"
        result = await db.execute(select(Store).where(Store.store_code == store_code))
        store = result.scalars().first()
        
        if not store:
            print("\n[+] Creating Demo Store...")
            store = Store(
                store_name="Demo Saree Store",
                store_code=store_code,
                owner_email="admin@admin.com",
                address="123 Silk Street, Chennai",
                phone="+91 9876543210",
                subscription_plan="enterprise",
                ai_credits_remaining=500
            )
            db.add(store)
            await db.flush()  # Get the store.id
            print(f"    Store ID: {store.id}")
        else:
            print("\n[=] Demo Store already exists.")
        
        # 2. Seed Super Admin User
        admin_email = "admin@admin.com"
        result = await db.execute(select(User).where(User.email == admin_email))
        admin = result.scalars().first()
        
        if not admin:
            print("\n[+] Creating Super Admin user...")
            admin = User(
                name="Super Admin",
                email=admin_email,
                hashed_password=get_password_hash("admin"),
                role="super_admin",
                store_id=store.id
            )
            db.add(admin)
            print(f"    Email: {admin_email}")
            print(f"    Password: admin")
        else:
            print("\n[=] Admin user already exists.")
        
        # 3. Seed Store Admin User
        store_admin_email = "store@demo.com"
        result = await db.execute(select(User).where(User.email == store_admin_email))
        store_admin = result.scalars().first()
        
        if not store_admin:
            print("\n[+] Creating Store Admin user...")
            store_admin = User(
                name="Store Manager",
                email=store_admin_email,
                hashed_password=get_password_hash("store123"),
                role="store_admin",
                store_id=store.id
            )
            db.add(store_admin)
            print(f"    Email: {store_admin_email}")
            print(f"    Password: store123")
        else:
            print("\n[=] Store Admin already exists.")
        
        # 4. Seed Default Device (Mirror)
        device_code = "DEMO-001"
        result = await db.execute(select(Device).where(Device.device_id == device_code))
        device = result.scalars().first()
        
        if not device:
            print(f"\n[+] Creating Mirror Device: {device_code}...")
            device = Device(
                device_id=device_code,
                store_id=store.id,
                device_name="Main Entrance Mirror",
                location="Front of store",
                status="online"
            )
            db.add(device)
        else:
            print(f"\n[=] Device {device_code} already exists.")
            
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
        print(f"\n  Super Admin Login:")
        print(f"    Email: admin@admin.com")
        print(f"    Password: admin")
        print(f"\n  Store Admin Login:")
        print(f"    Email: store@demo.com")
        print(f"    Password: store123")
        print(f"\n  Mirror Kiosk URL:")
        print(f"    /mirror/DEMO-001")
        print("=" * 50)

if __name__ == "__main__":
    asyncio.run(seed_data())
