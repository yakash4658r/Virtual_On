from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta
import uuid
from core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def default_expiry():
    return datetime.utcnow() + timedelta(hours=24)

class TryOnSession(Base):
    __tablename__ = "tryon_sessions"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    session_token = Column(String, unique=True, index=True, nullable=False)  # For QR code download
    
    user_id = Column(String, ForeignKey("users.id"), nullable=True)  # NULL for mirror sessions
    device_id = Column(String, ForeignKey("devices.id"), nullable=True)
    store_id = Column(String, ForeignKey("stores.id"), nullable=True)
    saree_id = Column(String, ForeignKey("sarees.id"), nullable=False)
    
    customer_image = Column(String, nullable=False)
    result_image = Column(String, nullable=True)
    
    status = Column(String, default="pending")  # pending, processing, completed, failed
    error_message = Column(String, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    
    ai_provider = Column(String, default="mock")
    ai_metadata = Column(JSON, nullable=True)
    
    is_public = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), default=default_expiry)

    user = relationship("User")
    saree = relationship("Saree")
    device = relationship("Device")
    store = relationship("Store")
