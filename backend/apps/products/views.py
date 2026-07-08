from rest_framework import status, generics, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.db.models import Q
from utils.permissions import IsStoreAdmin
from .models import Category, Saree
from .serializers import (
    CategorySerializer,
    SareeListSerializer,
    SareeDetailSerializer,
    SareeCreateSerializer,
    SareeUpdateSerializer
)


# ============================================
# CATEGORY VIEWS
# ============================================

class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.filter(is_active=True)
        serializer = CategorySerializer(categories, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })


class CategoryCreateView(APIView):
    permission_classes = [IsStoreAdmin]

    def post(self, request):
        from django.utils.text import slugify

        name = request.data.get('name', '')
        slug = slugify(name)

        # Unique slug ensure pannu
        counter = 1
        original_slug = slug
        while Category.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1

        data = {**request.data, 'slug': slug}
        serializer = CategorySerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Category created',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# ============================================
# SAREE VIEWS — PUBLIC
# ============================================

class SareeListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Saree.objects.filter(
            is_active=True
        ).select_related('category')

        # Filters
        category = request.query_params.get('category')
        fabric = request.query_params.get('fabric')
        occasion = request.query_params.get('occasion')
        color = request.query_params.get('color')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        search = request.query_params.get('search')
        featured = request.query_params.get('featured')
        in_stock = request.query_params.get('in_stock')

        if category:
            queryset = queryset.filter(category__slug=category)

        if fabric:
            queryset = queryset.filter(fabric=fabric)

        if occasion:
            queryset = queryset.filter(occasion=occasion)

        if color:
            queryset = queryset.filter(color__icontains=color)

        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(color__icontains=search) |
                Q(barcode_id__icontains=search)
            )

        if featured == 'true':
            queryset = queryset.filter(is_featured=True)

        if in_stock == 'true':
            queryset = queryset.filter(in_stock=True)

        # Pagination
        page_size = int(request.query_params.get('page_size', 12))
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size

        total = queryset.count()
        sarees = queryset[start:end]

        serializer = SareeListSerializer(sarees, many=True)

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


class SareeDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, slug):
        saree = get_object_or_404(
            Saree,
            slug=slug,
            is_active=True
        )
        serializer = SareeDetailSerializer(saree)
        return Response({
            'success': True,
            'data': serializer.data
        })


class SareeByBarcodeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, barcode_id):
        saree = get_object_or_404(
            Saree,
            barcode_id=barcode_id,
            is_active=True
        )
        serializer = SareeDetailSerializer(saree)
        return Response({
            'success': True,
            'data': serializer.data
        })


# ============================================
# SAREE VIEWS — ADMIN ONLY
# ============================================

class SareeCreateView(APIView):
    permission_classes = [IsStoreAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = SareeCreateSerializer(data=request.data)

        if serializer.is_valid():
            saree = serializer.save()
            return Response({
                'success': True,
                'message': 'Saree added successfully with barcode generated',
                'data': SareeDetailSerializer(saree).data
            }, status=status.HTTP_201_CREATED)

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class SareeUpdateView(APIView):
    permission_classes = [IsStoreAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def put(self, request, pk):
        saree = get_object_or_404(Saree, id=pk)
        serializer = SareeUpdateSerializer(
            saree,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Saree updated',
                'data': SareeDetailSerializer(saree).data
            })

        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        saree = get_object_or_404(Saree, id=pk)
        saree.is_active = False
        saree.save()
        return Response({
            'success': True,
            'message': 'Saree deleted'
        })


class AdminSareeListView(APIView):
    permission_classes = [IsStoreAdmin]

    def get(self, request):
        queryset = Saree.objects.all().select_related('category')

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(barcode_id__icontains=search)
            )

        page_size = int(request.query_params.get('page_size', 20))
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size

        total = queryset.count()
        sarees = queryset[start:end]

        serializer = SareeDetailSerializer(sarees, many=True)

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


class BarcodeDownloadView(APIView):
    permission_classes = [IsStoreAdmin]

    def get(self, request, pk):
        saree = get_object_or_404(Saree, id=pk)

        if not saree.barcode_image:
            return Response({
                'success': False,
                'message': 'Barcode not generated for this saree'
            }, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'success': True,
            'data': {
                'barcode_id': saree.barcode_id,
                'barcode_image_url': saree.barcode_image.url,
                'saree_name': saree.name,
                'price': str(saree.price)
            }
        })


class AllBarcodesView(APIView):
    """
    Admin — all barcodes list for printing
    """
    permission_classes = [IsStoreAdmin]

    def get(self, request):
        sarees = Saree.objects.filter(
            is_active=True
        ).values(
            'id', 'name', 'barcode_id',
            'barcode_image', 'price'
        )

        return Response({
            'success': True,
            'count': sarees.count(),
            'data': list(sarees)
        })