from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import get_db
from core.security import verify_password, create_access_token, create_refresh_token
from core.dependencies import get_current_user
from schemas.user import UserCreate, UserResponse, LoginResponse, TokenData, Token, GoogleLoginRequest
from services.auth_service import get_user_by_email, create_user
from google.oauth2 import id_token
from google.auth.transport import requests
import os

router = APIRouter()

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")

@router.post("/google", response_model=LoginResponse)
async def google_login(request: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            request.token, 
            requests.Request(), 
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
        
        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        
        user = await get_user_by_email(db, email)
        
        # If user doesn't exist, create one
        if not user:
            user_in = UserCreate(
                name=name,
                email=email,
                password="GOOGLE_AUTH_PLACEHOLDER_PASS", # Use a placeholder
            )
            user = await create_user(db, user_in)
            
        # Generate tokens
        access_token = create_access_token(data={"sub": user.id, "role": user.role})
        refresh_token = create_refresh_token(data={"sub": user.id, "role": user.role})
        
        return {
            "success": True,
            "tokens": {"access": access_token, "refresh": refresh_token},
            "user": user
        }
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {str(ve)}",
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google Login error: {str(e)}",
        )

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
