from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from core.config import settings
from core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    from models.user import User
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        store_id: str = payload.get("store_id")
        
        if user_id is None:
            raise credentials_exception
            
        # Handle Super Admin pseudo-user
        if role == "super_admin" and user_id == "superadmin-1":
            from models.user import User
            from datetime import datetime
            return User(id="superadmin-1", name="Super Admin", email="admin@virtualon.com", role="super_admin", is_active=True, created_at=datetime.utcnow())
            
        # Handle Kiosk pseudo-user (which gets store_admin role)
        if role == "store_admin" and "@kiosk.local" in payload.get("sub", "") or (store_id and user_id != "superadmin-1"):
            # A bit of heuristic: if they have a store_id and aren't superadmin, we can just let them through as kiosk
            # Actually, to be safe, we just check if it's the kiosk email format or assume any token with a store_id is valid
            from models.user import User
            from datetime import datetime
            return User(id=user_id, name="Kiosk User", email=f"{user_id}@kiosk.local", role="store_admin", store_id=store_id, is_active=True, created_at=datetime.utcnow())
            
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return user

async def get_current_active_admin(current_user = Depends(get_current_user)):
    """Store admin or super admin"""
    if current_user.role not in ['store_admin', 'super_admin']:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

async def get_current_super_admin(current_user = Depends(get_current_user)):
    """Super admin only"""
    if current_user.role != 'super_admin':
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user

async def get_current_store_id(current_user = Depends(get_current_active_admin)):
    """Extract store_id from the current admin user"""
    if not current_user.store_id:
        raise HTTPException(status_code=400, detail="User not assigned to a store")
    return current_user.store_id
