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
        if user_id is None:
            raise credentials_exception
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
