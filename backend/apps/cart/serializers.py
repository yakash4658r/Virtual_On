from rest_framework import serializers
from .models import Cart, CartItem
from apps.products.serializers import SareeListSerializer


class CartItemSerializer(serializers.ModelSerializer):

    saree = SareeListSerializer(read_only=True)

    class Meta:
        model = CartItem
        fields = ('id', 'saree', 'added_at')
        read_only_fields = ('id', 'added_at')


class CartSerializer(serializers.ModelSerializer):

    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)

    class Meta:
        model = Cart
        fields = ('id', 'items', 'total_items', 'updated_at')


class AddToCartSerializer(serializers.Serializer):

    saree_id = serializers.UUIDField(required=True)

    def validate_saree_id(self, value):
        from apps.products.models import Saree

        try:
            saree = Saree.objects.get(id=value, is_active=True)
        except Saree.DoesNotExist:
            raise serializers.ValidationError('Saree not found')

        if not saree.in_stock:
            raise serializers.ValidationError('Saree is out of stock')

        return value