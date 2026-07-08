from rest_framework import serializers
from .models import TryOnSession, TryOnResult
from apps.products.serializers import SareeListSerializer


class TryOnResultSerializer(serializers.ModelSerializer):

    saree = SareeListSerializer(read_only=True)

    class Meta:
        model = TryOnResult
        fields = (
            'id', 'saree', 'result_image',
            'status', 'error_message',
            'ai_provider', 'processing_time_seconds',
            'created_at', 'completed_at'
        )


class TryOnSessionSerializer(serializers.ModelSerializer):

    results = TryOnResultSerializer(many=True, read_only=True)
    progress = serializers.CharField(read_only=True)
    completed_count = serializers.IntegerField(read_only=True)
    total_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = TryOnSession
        fields = (
            'id', 'customer_photo', 'status',
            'results', 'progress',
            'completed_count', 'total_count',
            'created_at', 'completed_at'
        )


class TryOnSessionListSerializer(serializers.ModelSerializer):
    """
    History page ku — lightweight
    """
    progress = serializers.CharField(read_only=True)
    saree_count = serializers.SerializerMethodField()

    class Meta:
        model = TryOnSession
        fields = (
            'id', 'status', 'progress',
            'saree_count', 'created_at',
            'completed_at'
        )

    def get_saree_count(self, obj):
        return obj.results.count()


class StartTryOnSerializer(serializers.Serializer):

    customer_photo = serializers.ImageField(required=True)

    def validate_customer_photo(self, value):
        # File size check — max 10MB
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError(
                'Photo size must be less than 10MB'
            )

        # File type check
        allowed_types = [
            'image/jpeg', 'image/jpg',
            'image/png', 'image/webp'
        ]
        if value.content_type not in allowed_types:
            raise serializers.ValidationError(
                'Only JPEG, PNG, and WebP images are allowed'
            )

        return value