from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from core.config import settings
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import time

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="AI Smart Mirror - Saree Virtual Try-On",
    version="2.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local media folder
os.makedirs("media", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")

# ─── Health Check Endpoints ───────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "AI Smart Mirror — Saree Virtual Try-On API v2.0"}

@app.get("/health")
def health_check():
    """Basic health check — always returns OK if the process is alive."""
    return {"status": "healthy", "version": settings.VERSION}

@app.get("/ready")
async def readiness_check():
    """Readiness check — verifies database connectivity."""
    from core.database import AsyncSessionLocal
    from sqlalchemy import text
    try:
        async with AsyncSessionLocal() as db:
            await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "ready" if db_status == "connected" else "not_ready",
        "database": db_status,
    }

# ─── Request Timing Middleware ────────────────────────────────────────────

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time, 4))
    return response

# ─── Import & Register Routers ────────────────────────────────────────────

from routers import auth, products, cart, tryon, store, mirror, devices, superadmin, public

# Auth
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])

# Products & Catalog
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["products"])

# Cart (kept for compatibility)
app.include_router(cart.router, prefix=f"{settings.API_V1_STR}/cart", tags=["cart"])

# Try-On (legacy)
app.include_router(tryon.router, prefix=f"{settings.API_V1_STR}/tryon", tags=["tryon"])

# Store Admin Dashboard & Analytics
app.include_router(store.router, prefix=f"{settings.API_V1_STR}/store", tags=["store"])

# Mirror Kiosk (NO AUTH)
app.include_router(mirror.router, prefix=f"{settings.API_V1_STR}/mirror", tags=["mirror"])

# Device Management
app.include_router(devices.router, prefix=f"{settings.API_V1_STR}/devices", tags=["devices"])

# Super Admin
app.include_router(superadmin.router, prefix=f"{settings.API_V1_STR}/superadmin", tags=["superadmin"])

# Public Downloads (NO AUTH)
app.include_router(public.router, prefix=f"{settings.API_V1_STR}/public", tags=["public"])
