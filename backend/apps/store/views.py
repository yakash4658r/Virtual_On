from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count
from datetime import timedelta
from utils.permissions import IsStoreAdmin
from .models import Store
from .serializers import StoreSerializer
from apps.products.models import Saree
from apps.tryon.models import TryOnSession, TryOnResult
from apps.accounts.models import User


class StoreSettingsView(APIView):
    """
    GET — Store details
    PUT — Update store settings
    """
    permission_classes = [IsStoreAdmin]

    def get(self, request):
        store = get_object_or_404(Store, owner=request.user)
        serializer = StoreSerializer(store)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def put(self, request):
        store = get_object_or_404(Store, owner=request.user)
        serializer = StoreSerializer(
            store,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Store settings updated',
                'data': serializer.data
            })

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class DashboardView(APIView):
    """
    GET — Admin dashboard stats
    """
    permission_classes = [IsStoreAdmin]

    def get(self, request):
        today = timezone.now().date()
        last_7_days = today - timedelta(days=7)
        last_30_days = today - timedelta(days=30)

        # Saree stats
        total_sarees = Saree.objects.filter(is_active=True).count()
        active_sarees = Saree.objects.filter(
            is_active=True, in_stock=True
        ).count()
        out_of_stock = Saree.objects.filter(
            is_active=True, in_stock=False
        ).count()

        # TryOn stats
        total_tryons = TryOnSession.objects.count()
        today_tryons = TryOnSession.objects.filter(
            created_at__date=today
        ).count()
        week_tryons = TryOnSession.objects.filter(
            created_at__date__gte=last_7_days
        ).count()
        month_tryons = TryOnSession.objects.filter(
            created_at__date__gte=last_30_days
        ).count()

        # User stats
        total_users = User.objects.filter(
            role='customer', is_active=True
        ).count()

        # Popular sarees (most tried)
        popular_sarees = TryOnResult.objects.filter(
            status='completed'
        ).values(
            'saree__name',
            'saree__barcode_id',
            'saree__image_front'
        ).annotate(
            try_count=Count('id')
        ).order_by('-try_count')[:5]

        # Recent sessions
        recent_sessions = TryOnSession.objects.order_by(
            '-created_at'
        )[:10].values(
            'id', 'user__name', 'status',
            'created_at'
        )

        # AI cost stats (last 30 days)
        from django.db.models import Sum, Avg
        ai_stats = TryOnResult.objects.filter(
            created_at__date__gte=last_30_days,
            status='completed'
        ).aggregate(
            total_cost=Sum('ai_cost_usd'),
            avg_time=Avg('processing_time_seconds'),
            total_completed=Count('id')
        )

        return Response({
            'success': True,
            'data': {
                'sarees': {
                    'total': total_sarees,
                    'active': active_sarees,
                    'out_of_stock': out_of_stock,
                },
                'tryons': {
                    'total': total_tryons,
                    'today': today_tryons,
                    'this_week': week_tryons,
                    'this_month': month_tryons,
                },
                'users': {
                    'total': total_users,
                },
                'popular_sarees': list(popular_sarees),
                'recent_sessions': list(recent_sessions),
                'ai_stats': {
                    'total_cost_usd': float(
                        ai_stats['total_cost'] or 0
                    ),
                    'avg_processing_time': round(
                        float(ai_stats['avg_time'] or 0), 2
                    ),
                    'total_completed': ai_stats['total_completed'],
                }
            }
        })


class TryOnAdminHistoryView(APIView):
    """
    GET — Admin: all users oda try-on history
    """
    permission_classes = [IsStoreAdmin]

    def get(self, request):
        sessions = TryOnSession.objects.all().select_related(
            'user'
        ).order_by('-created_at')

        # Filters
        status_filter = request.query_params.get('status')
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')
        user_search = request.query_params.get('user')

        if status_filter:
            sessions = sessions.filter(status=status_filter)

        if date_from:
            sessions = sessions.filter(created_at__date__gte=date_from)

        if date_to:
            sessions = sessions.filter(created_at__date__lte=date_to)

        if user_search:
            sessions = sessions.filter(
                user__name__icontains=user_search
            )

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size

        total = sessions.count()
        paginated = sessions[start:end]

        data = []
        for session in paginated:
            data.append({
                'id': str(session.id),
                'user_name': session.user.name,
                'user_email': session.user.email,
                'status': session.status,
                'progress': session.progress,
                'saree_count': session.total_count,
                'created_at': session.created_at.isoformat(),
                'completed_at': (
                    session.completed_at.isoformat()
                    if session.completed_at else None
                ),
            })

        return Response({
            'success': True,
            'data': data,
            'pagination': {
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': (total + page_size - 1) // page_size
            }
        })