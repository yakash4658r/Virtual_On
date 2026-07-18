from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    sarees = relationship("Saree", back_populates="category")

class Saree(Base):
    __tablename__ = "sarees"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    color = Column(String, nullable=False)
    fabric = Column(String, nullable=True)
    occasion = Column(String, nullable=True)
    
    barcode_id = Column(String, unique=True, index=True, nullable=True)
    barcode_image = Column(String, nullable=True)
    
    image_front = Column(String, nullable=True)
    image_back = Column(String, nullable=True)
    image_detail = Column(String, nullable=True)
    image_drape = Column(String, nullable=True)
    tryon_image = Column(String, nullable=True)
    
    in_stock = Column(Boolean, default=True)
    stock_quantity = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="sarees")
    store = relationship("Store")
