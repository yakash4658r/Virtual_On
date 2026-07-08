from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.conf import settings
from .models import TryOnSession, TryOnResult
from apps.cart.models import Cart
from apps.products.models import Saree
from .serializers import (
    TryOnSessionSerializer,
    TryOnSessionListSerializer,
    StartTryOnSerializer
)


class StartTryOnView(APIView):
    """
    POST — Customer photo upload + cart items la try-on start
    
    Flow:
    1. Customer photo receive pannum
    2. Cart la irukura sarees edukum
    3. TryOnSession create pannum
    4. Each saree ku TryOnResult create pannum (pending)
    5. Background la AI processing start pannum
    6. Session ID return pannum (frontend poll pannum)
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        # Validate photo
        serializer = StartTryOnSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # Get user cart
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Cart is empty'
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_items = cart.items.select_related('saree').all()

        if not cart_items.exists():
            return Response({
                'success': False,
                'message': 'Cart is empty. Add sarees before trying on.'
            }, status=status.HTTP_400_BAD_REQUEST)

        max_items = getattr(settings, 'MAX_TRYON_ITEMS', 5)
        if cart_items.count() > max_items:
            return Response({
                'success': False,
                'message': f'Maximum {max_items} sarees allowed'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Compress customer photo
        from utils.image_utils import compress_image
        customer_photo = compress_image(
            serializer.validated_data['customer_photo'],
            max_size=(768, 1024),
            quality=90
        )

        # Create session
        expiry_hours = getattr(
            settings, 'CUSTOMER_PHOTO_EXPIRY_HOURS', 24
        )
        session = TryOnSession.objects.create(
            user=request.user,
            customer_photo=customer_photo,
            status='processing',
            photo_expires_at=timezone.now() + timedelta(
                hours=expiry_hours
            )
        )

        # Create TryOnResult for each cart saree
        saree_ids = []
        for item in cart_items:
            TryOnResult.objects.create(
                session=session,
                saree=item.saree,
                status='pending'
            )
            saree_ids.append(str(item.saree.id))

        # Start background processing
        from .tasks import process_tryon_session
        process_tryon_session.delay(str(session.id))

        return Response({
            'success': True,
            'message': f'Try-on started for {cart_items.count()} sarees',
            'data': {
                'session_id': str(session.id),
                'total_sarees': cart_items.count(),
                'status': 'processing'
            }
        }, status=status.HTTP_201_CREATED)


class TryOnStatusView(APIView):
    """
    GET — Session status poll pannum
    Frontend every 2-3 seconds la call pannum
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_object_or_404(
            TryOnSession,
            id=session_id,
            user=request.user
        )

        serializer = TryOnSessionSerializer(session)

        return Response({
            'success': True,
            'data': serializer.data,
            'is_all_done': session.status == 'completed'
        })


class TryOnHistoryView(APIView):
    """
    GET — User oda past try-on sessions list
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = TryOnSession.objects.filter(
            user=request.user
        ).order_by('-created_at')

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 10))
        start = (page - 1) * page_size
        end = start + page_size

        total = sessions.count()
        paginated = sessions[start:end]

        serializer = TryOnSessionListSerializer(
            paginated, many=True
        )

        return Response({
            'success': True,
            'data': serializer.data,
            'pagination': {
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': (total + page_size - 1) // page_size
            }
        })


class TryOnDetailView(APIView):
    """
    GET — Single session full detail with all results
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        session = get_object_or_404(
            TryOnSession,
            id=session_id,
            user=request.user
        )

        serializer = TryOnSessionSerializer(session)

        return Response({
            'success': True,
            'data': serializer.data
        })

    def delete(self, request, session_id):
        session = get_object_or_404(
            TryOnSession,
            id=session_id,
            user=request.user
        )

        session.delete()

        return Response({
            'success': True,
            'message': 'Session deleted'
        })


class RetryTryOnView(APIView):
    """
    POST — Failed result ah retry pannum
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, result_id):
        result = get_object_or_404(
            TryOnResult,
            id=result_id,
            session__user=request.user
        )

        if result.status not in ['failed']:
            return Response({
                'success': False,
                'message': 'Only failed results can be retried'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Reset status
        result.status = 'pending'
        result.error_message = ''
        result.save()

        # Trigger reprocess
        from .tasks import process_single_tryon
        process_single_tryon.delay(
            str(result.session.id),
            str(result.id)
        )

        return Response({
            'success': True,
            'message': 'Retry started'
        })