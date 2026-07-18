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
    store_code = Column(String(10), unique=True, index=True, nullable=False)  # Short code e.g. "DEMO"
    owner_email = Column(String, nullable=False)
    address = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    
    subscription_plan = Column(String, default="starter")  # starter, professional, enterprise
    ai_credits_remaining = Column(Integer, default=100)
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
