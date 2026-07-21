from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text
from sqlalchemy.sql import func
import uuid
from core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Store(Base):
    __tablename__ = "stores"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    store_name = Column(String, nullable=False)
    activation_code = Column(String(20), unique=True, index=True, nullable=False)  # e.g., "KARUVA-001"
    
    owner_name = Column(String, nullable=True)
    owner_email = Column(String, nullable=False)
    owner_phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    
    # Subscription & Limits
    plan_type = Column(String, default="basic")  # basic, pro, unlimited
    daily_limit = Column(Integer, default=250)  # -1 for unlimited
    credits_remaining = Column(Integer, default=100)
    credits_per_swap = Column(Integer, default=10)
    
    photos_used_today = Column(Integer, default=0)
    last_reset_date = Column(DateTime(timezone=True), default=func.now())
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
