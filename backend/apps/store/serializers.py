from rest_framework import serializers
from .models import Store


class StoreSerializer(serializers.ModelSerializer):

    owner_name = serializers.CharField(
        source='owner.name',
        read_only=True
    )
    owner_email = serializers.CharField(
        source='owner.email',
        read_only=True
    )

    class Meta:
        model = Store
        fields = (
            'id', 'name', 'description',
            'logo', 'phone', 'email',
            'address', 'city', 'state',
            'pincode', 'owner_name',
            'owner_email', 'is_active',
            'created_at'
        )
        read_only_fields = ('id', 'is_active', 'created_at')


class DashboardSerializer(serializers.Serializer):

    total_sarees = serializers.IntegerField()
    active_sarees = serializers.IntegerField()
    out_of_stock = serializers.IntegerField()
    total_tryons = serializers.IntegerField()
    today_tryons = serializers.IntegerField()
    total_users = serializers.IntegerField()
    popular_sarees = serializers.ListField()
    recent_sessions = serializers.ListField()