from rest_framework import serializers
from django.utils.text import slugify
from .models import Category, Saree


class CategorySerializer(serializers.ModelSerializer):

    saree_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            'id', 'name', 'slug',
            'description', 'image',
            'display_order', 'is_active',
            'saree_count'
        )
        read_only_fields = ('id', 'slug')

    def get_saree_count(self, obj):
        return obj.sarees.filter(is_active=True).count()


class SareeListSerializer(serializers.ModelSerializer):
    """
    Catalog page la list show panna — light weight serializer
    """
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )

    class Meta:
        model = Saree
        fields = (
            'id', 'name', 'slug',
            'category_name', 'price',
            'color', 'fabric', 'occasion',
            'image_front', 'in_stock',
            'is_featured', 'barcode_id'
        )


class SareeDetailSerializer(serializers.ModelSerializer):
    """
    Product detail page ku — all fields with images
    """
    category = CategorySerializer(read_only=True)
    all_images = serializers.SerializerMethodField()

    class Meta:
        model = Saree
        fields = (
            'id', 'name', 'slug',
            'category', 'description',
            'price', 'color', 'fabric',
            'occasion', 'barcode_id',
            'barcode_image',
            'image_front', 'image_back',
            'image_closeup', 'image_pallu',
            'tryon_image', 'all_images',
            'in_stock', 'stock_quantity',
            'is_featured', 'created_at'
        )

    def get_all_images(self, obj):
        return obj.all_images


class SareeCreateSerializer(serializers.ModelSerializer):
    """
    Admin — new saree create panna
    """
    category_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Saree
        fields = (
            'name', 'category_id',
            'description', 'price',
            'color', 'fabric', 'occasion',
            'image_front', 'image_back',
            'image_closeup', 'image_pallu',
            'tryon_image',
            'in_stock', 'stock_quantity',
            'is_featured'
        )

    def validate_category_id(self, value):
        try:
            Category.objects.get(id=value, is_active=True)
        except Category.DoesNotExist:
            raise serializers.ValidationError('Category not found')
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than 0')
        return value

    def validate(self, attrs):
        # tryon_image illa na image_front use panrom
        if not attrs.get('tryon_image') and not attrs.get('image_front'):
            raise serializers.ValidationError(
                'At least front image is required'
            )
        return attrs

    def create(self, validated_data):
        from utils.barcode_utils import generate_barcode_id, generate_barcode_image
        from utils.image_utils import compress_image, compress_tryon_image

        category_id = validated_data.pop('category_id')
        category = Category.objects.get(id=category_id)

        # Slug generate
        base_slug = slugify(validated_data['name'])
        slug = base_slug
        counter = 1
        while Saree.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        # Compress images
        if validated_data.get('image_front'):
            validated_data['image_front'] = compress_image(
                validated_data['image_front']
            )

        if validated_data.get('tryon_image'):
            validated_data['tryon_image'] = compress_tryon_image(
                validated_data['tryon_image']
            )

        # Create saree
        saree = Saree.objects.create(
            **validated_data,
            category=category,
            slug=slug,
        )

        # Auto generate barcode
        barcode_id = generate_barcode_id()
        saree.barcode_id = barcode_id

        # Generate barcode image
        barcode_image = generate_barcode_image(
            barcode_id,
            saree.name,
            saree.price
        )

        if barcode_image:
            saree.barcode_image.save(
                f"barcode_{barcode_id}.png",
                barcode_image,
                save=False
            )

        saree.save()

        return saree


class SareeUpdateSerializer(serializers.ModelSerializer):
    """
    Admin — existing saree update panna
    """
    class Meta:
        model = Saree
        fields = (
            'name', 'description', 'price',
            'color', 'fabric', 'occasion',
            'image_front', 'image_back',
            'image_closeup', 'image_pallu',
            'tryon_image', 'in_stock',
            'stock_quantity', 'is_featured',
            'is_active'
        )