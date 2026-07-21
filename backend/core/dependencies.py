from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from core.config import settings
from core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

class CurrentUser:
    def __init__(self, user_id: str, role: str, store_id: str = None):
        self.id = user_id
        self.role = role
        self.store_id = store_id

async def get_current_user(token: str = Depends(oauth2_scheme)):
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
        
        if user_id is None or role is None:
            raise credentials_exception
            
        return CurrentUser(user_id=user_id, role=role, store_id=store_id)
            
    except JWTError:
        raise credentials_exception

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

async def get_current_store_id(current_user = Depends(get_current_active_admin), db: AsyncSession = Depends(get_db)):
    """Extract store_id from the current admin user. For Super Admin, fall back to first store."""
    if current_user.store_id:
        return current_user.store_id
    
    # Super Admin doesn't have a store_id — use the first active store
    if current_user.role == 'super_admin':
        from models.store import Store
        result = await db.execute(select(Store).where(Store.is_active == True).limit(1))
        store = result.scalars().first()
        if store:
            return store.id
    
    raise HTTPException(status_code=400, detail="User not assigned to a store")
