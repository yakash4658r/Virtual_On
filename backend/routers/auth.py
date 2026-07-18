from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from core.security import verify_password, create_access_token, create_refresh_token
from core.dependencies import get_current_user
from schemas.user import UserCreate, UserResponse, LoginResponse, TokenData, Token
from services.auth_service import get_user_by_email, create_user

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return await create_user(db, user_in)

@router.post("/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.id, "role": user.role})
    refresh_token = create_refresh_token(data={"sub": user.id, "role": user.role})
    
    return {
        "success": True,
        "tokens": {"access": access_token, "refresh": refresh_token},
        "user": user
    }

@router.get("/profile", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user
