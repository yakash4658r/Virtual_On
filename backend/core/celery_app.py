from celery import Celery
from core.config import settings

celery_app = Celery(
    "tryon_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["tasks.gpu_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_concurrency=4,  # as requested
    broker_connection_retry_on_startup=True
)

# Optional: Periodic tasks
celery_app.conf.beat_schedule = {
    'cleanup-expired-sessions': {
        'task': 'tasks.gpu_tasks.cleanup_expired_sessions',
        'schedule': 3600.0, # every hour
    },
}
