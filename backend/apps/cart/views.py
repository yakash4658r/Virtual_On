from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from .models import Cart, CartItem
from apps.products.models import Saree
from .serializers import (
    CartSerializer,
    AddToCartSerializer
)


class CartView(APIView):
    """
    GET — User oda full cart return pannum
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)

        serializer = CartSerializer(cart)

        return Response({
            'success': True,
            'data': serializer.data
        })


class AddToCartView(APIView):
    """
    POST — Saree add to cart
    Max 5 items allowed (try-on limit)
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)

        if not serializer.is_valid():
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        saree_id = serializer.validated_data['saree_id']

        # Get or create cart
        cart, _ = Cart.objects.get_or_create(user=request.user)

        # Check max limit
        max_items = getattr(settings, 'MAX_TRYON_ITEMS', 5)
        if cart.items.count() >= max_items:
            return Response({
                'success': False,
                'message': f'Maximum {max_items} sarees allowed in cart'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check already in cart
        saree = Saree.objects.get(id=saree_id)
        if CartItem.objects.filter(cart=cart, saree=saree).exists():
            return Response({
                'success': False,
                'message': 'Saree already in your cart'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Add to cart
        CartItem.objects.create(cart=cart, saree=saree)

        # Return updated cart
        cart_serializer = CartSerializer(cart)

        return Response({
            'success': True,
            'message': f'{saree.name} added to cart',
            'data': cart_serializer.data
        }, status=status.HTTP_201_CREATED)


class RemoveFromCartView(APIView):
    """
    DELETE — Remove one saree from cart
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        cart, _ = Cart.objects.get_or_create(user=request.user)

        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart=cart
            )
        except CartItem.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Item not found in cart'
            }, status=status.HTTP_404_NOT_FOUND)

        saree_name = cart_item.saree.name
        cart_item.delete()

        cart_serializer = CartSerializer(cart)

        return Response({
            'success': True,
            'message': f'{saree_name} removed from cart',
            'data': cart_serializer.data
        })


class ClearCartView(APIView):
    """
    DELETE — Clear entire cart
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)

        count = cart.items.count()
        cart.items.all().delete()

        return Response({
            'success': True,
            'message': f'{count} items removed from cart'
        })


class CartCountView(APIView):
    """
    GET — Cart item count (navbar la show panna)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)

        return Response({
            'success': True,
            'count': cart.total_items
        })