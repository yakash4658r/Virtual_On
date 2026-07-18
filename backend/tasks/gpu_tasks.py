import asyncio
import httpx
from datetime import datetime, timedelta
import uuid
import time
from celery import shared_task
from sqlalchemy.future import select

from core.database import AsyncSessionLocal
from core.config import settings
from models.tryon import TryOnSession
from models.product import Saree
from utils.storage import upload_bytes_to_storage

async def _process_tryon(job_id: str):
    async with AsyncSessionLocal() as db:
        # Get job
        result = await db.execute(select(TryOnSession).where(TryOnSession.id == job_id))
        session = result.scalars().first()
        
        if not session:
            print(f"Job {job_id} not found in DB")
            return
            
        # Get saree
        result = await db.execute(select(Saree).where(Saree.id == session.saree_id))
        saree = result.scalars().first()
        
        if not saree:
            session.status = "failed"
            session.error_message = "Saree not found"
            await db.commit()
            return

        try:
            # 1. Mock GPU Server Call
            start_time = time.time()
            print(f"Mocking GPU try-on for job {job_id}...")
            await asyncio.sleep(5)  # Simulate 5 second processing time
            
            # 2. Mock result (returning the original saree image as a dummy for now)
            # In production, this would be the stitched image URL from RunPod.
            final_url = saree.tryon_image or saree.image_front or "/media/dummy_tryon.png"
            
            # 4. Update DB
            session.result_image = final_url
            session.status = "completed"
            session.completed_at = datetime.utcnow()
            session.processing_time_ms = int((time.time() - start_time) * 1000)
            
            await db.commit()
            print(f"Job {job_id} completed successfully in {session.processing_time_ms}ms")
            
        except Exception as e:
            print(f"Job {job_id} failed: {e}")
            session.status = "failed"
            session.error_message = str(e)
            await db.commit()

@shared_task(name="tasks.gpu_tasks.process_tryon", bind=True, max_retries=3)
def process_tryon(self, job_id: str):
    """Celery task to handle the GPU try-on pipeline"""
    try:
        asyncio.run(_process_tryon(job_id))
    except Exception as exc:
        raise self.retry(exc=exc, countdown=5)

async def _cleanup_sessions():
    """Deletes sessions older than 24 hours"""
    async with AsyncSessionLocal() as db:
        cutoff = datetime.utcnow() - timedelta(hours=24)
        result = await db.execute(select(TryOnSession).where(TryOnSession.created_at < cutoff))
        old_sessions = result.scalars().all()
        
        for session in old_sessions:
            from utils.storage import delete_file_from_storage
            if session.customer_image:
                await delete_file_from_storage(session.customer_image)
            if session.result_image:
                await delete_file_from_storage(session.result_image)
            await db.delete(session)
            
        if old_sessions:
            await db.commit()
            print(f"Cleaned up {len(old_sessions)} expired try-on sessions")

@shared_task(name="tasks.gpu_tasks.cleanup_expired_sessions")
def cleanup_expired_sessions():
    """Periodic task to clean up old sessions"""
    asyncio.run(_cleanup_sessions())
