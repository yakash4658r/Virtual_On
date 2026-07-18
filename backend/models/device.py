from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Device(Base):
    __tablename__ = "devices"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    device_id = Column(String, unique=True, index=True, nullable=False)  # e.g. "ALZ-001"
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    
    device_name = Column(String, nullable=True)
    location = Column(String, nullable=True)  # e.g. "Front entrance mirror"
    
    status = Column(String, default="offline")  # online, offline, maintenance
    last_seen = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    store = relationship("Store")
