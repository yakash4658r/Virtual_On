from celery import shared_task
from django.utils import timezone
import traceback


@shared_task(bind=True, max_retries=2, default_retry_delay=10)
def process_tryon_session(self, session_id):
    """
    Background task — session la irukura all sarees ku try-on generate pannum
    Celery worker la run aagum
    """
    from .models import TryOnSession, TryOnResult
    from .ai_service import ai_service

    try:
        session = TryOnSession.objects.get(id=session_id)
    except TryOnSession.DoesNotExist:
        print(f"Session {session_id} not found")
        return

    print(f"\n{'='*60}")
    print(f"Processing TryOn Session: {session_id}")
    print(f"User: {session.user.name}")
    print(f"{'='*60}")

    # Get customer photo URL
    customer_photo_url = session.customer_photo.url

    # Process each result
    results = session.results.all().order_by('created_at')

    for result in results:
        try:
            # Update status
            result.status = 'processing'
            result.save()

            print(f"\n  Processing saree: {result.saree.name}")

            # Get saree try-on image URL
            saree_image_url = result.saree.tryon_image.url

            # Call AI service
            ai_result = ai_service.generate_tryon(
                customer_image_url=customer_photo_url,
                saree_image_url=saree_image_url
            )

            if ai_result['success']:
                # Save result image
                if ai_result.get('result_image_file'):
                    result.result_image.save(
                        f"tryon_{session_id}_{result.saree.barcode_id}.png",
                        ai_result['result_image_file'],
                        save=False
                    )

                result.status = 'completed'
                result.ai_provider = ai_result.get('provider', '')
                result.processing_time_seconds = ai_result.get(
                    'processing_time', 0
                )
                result.completed_at = timezone.now()
                result.save()

                print(f"  ✓ Completed: {result.saree.name}")

            else:
                result.status = 'failed'
                result.error_message = ai_result.get(
                    'error', 'Unknown error'
                )
                result.ai_provider = ai_result.get('provider', '')
                result.processing_time_seconds = ai_result.get(
                    'processing_time', 0
                )
                result.save()

                print(f"  ✗ Failed: {result.saree.name}")
                print(f"    Error: {result.error_message}")

        except Exception as e:
            result.status = 'failed'
            result.error_message = str(e)
            result.save()

            print(f"  ✗ Exception: {result.saree.name}")
            print(f"    Error: {str(e)}")
            traceback.print_exc()

    # Update session status
    all_results = session.results.all()
    all_done = all(
        r.status in ['completed', 'failed']
        for r in all_results
    )

    if all_done:
        session.status = 'completed'
        session.completed_at = timezone.now()
        session.save()

    print(f"\n{'='*60}")
    print(f"Session {session_id} processing done")
    print(f"Status: {session.status}")
    print(f"Progress: {session.progress}")
    print(f"{'='*60}\n")


@shared_task(bind=True, max_retries=2, default_retry_delay=10)
def process_single_tryon(self, session_id, result_id):
    """
    Single result retry panna use pannum
    """
    from .models import TryOnSession, TryOnResult
    from .ai_service import ai_service

    try:
        session = TryOnSession.objects.get(id=session_id)
        result = TryOnResult.objects.get(id=result_id)
    except (TryOnSession.DoesNotExist, TryOnResult.DoesNotExist):
        print(f"Session or Result not found")
        return

    print(f"\nRetrying: {result.saree.name}")

    customer_photo_url = session.customer_photo.url
    saree_image_url = result.saree.tryon_image.url

    result.status = 'processing'
    result.save()

    try:
        ai_result = ai_service.generate_tryon(
            customer_image_url=customer_photo_url,
            saree_image_url=saree_image_url
        )

        if ai_result['success']:
            if ai_result.get('result_image_file'):
                result.result_image.save(
                    f"tryon_retry_{result_id}.png",
                    ai_result['result_image_file'],
                    save=False
                )

            result.status = 'completed'
            result.error_message = ''
            result.ai_provider = ai_result.get('provider', '')
            result.processing_time_seconds = ai_result.get(
                'processing_time', 0
            )
            result.completed_at = timezone.now()
            result.save()

        else:
            result.status = 'failed'
            result.error_message = ai_result.get('error', 'Retry failed')
            result.save()

    except Exception as e:
        result.status = 'failed'
        result.error_message = str(e)
        result.save()

    # Check if all session results done
    all_results = session.results.all()
    all_done = all(
        r.status in ['completed', 'failed']
        for r in all_results
    )

    if all_done:
        session.status = 'completed'
        session.completed_at = timezone.now()
        session.save()


@shared_task
def cleanup_expired_photos():
    """
    24 hours old customer photos delete pannum
    Privacy protection — schedule as periodic task
    """
    from .models import TryOnSession
    import os

    expired = TryOnSession.objects.filter(
        photo_expires_at__lt=timezone.now(),
        customer_photo__isnull=False
    ).exclude(customer_photo='')

    count = 0
    for session in expired:
        try:
            # Delete actual file
            if session.customer_photo:
                session.customer_photo.delete(save=False)

            session.customer_photo = ''
            session.save(update_fields=['customer_photo'])
            count += 1

        except Exception as e:
            print(f"Cleanup error: {e}")

    print(f"Cleaned up {count} expired customer photos")
    return count