from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access: str
    refresh: str
    
class TokenData(BaseModel):
    id: Optional[str] = None
    role: Optional[str] = None

class LoginResponse(BaseModel):
    success: bool
    tokens: Token
    user: UserResponse

class GoogleLoginRequest(BaseModel):
    token: str
