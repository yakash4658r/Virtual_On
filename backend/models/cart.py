from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Cart(Base):
    __tablename__ = "carts"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=True)
    session_id = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
    user = relationship("User")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    cart_id = Column(String, ForeignKey("carts.id"), nullable=False)
    saree_id = Column(String, ForeignKey("sarees.id"), nullable=False)
    quantity = Column(Integer, default=1)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    cart = relationship("Cart", back_populates="items")
    saree = relationship("Saree")
