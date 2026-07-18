from celery import Celery
from core.config import settings

celery_app = Celery("tryon_tasks", broker=settings.REDIS_URL, backend=settings.REDIS_URL)

@celery_app.task
def process_virtual_tryon(session_id: str, saree_url: str, customer_url: str):
    # This task will call ai/provider.py in the background
    print(f"Processing tryon {session_id}")
    return True
