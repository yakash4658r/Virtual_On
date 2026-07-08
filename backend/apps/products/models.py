from django.db import models
from django.conf import settings
import uuid


class Category(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    image = models.ImageField(
        upload_to='categories/',
        blank=True,
        null=True
    )
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name


class Saree(models.Model):

    FABRIC_CHOICES = (
        ('silk', 'Silk'),
        ('cotton', 'Cotton'),
        ('chiffon', 'Chiffon'),
        ('georgette', 'Georgette'),
        ('organza', 'Organza'),
        ('linen', 'Linen'),
        ('banarasi', 'Banarasi'),
        ('crepe', 'Crepe'),
        ('net', 'Net'),
        ('satin', 'Satin'),
        ('other', 'Other'),
    )

    OCCASION_CHOICES = (
        ('wedding', 'Wedding'),
        ('festival', 'Festival'),
        ('party', 'Party'),
        ('casual', 'Casual'),
        ('office', 'Office'),
        ('bridal', 'Bridal'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sarees'
    )

    # Basic details
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    color = models.CharField(max_length=100)
    fabric = models.CharField(
        max_length=50,
        choices=FABRIC_CHOICES,
        default='silk'
    )
    occasion = models.CharField(
        max_length=50,
        choices=OCCASION_CHOICES,
        default='casual'
    )

    # Barcode — auto generated
    barcode_id = models.CharField(
        max_length=50,
        unique=True,
        blank=True
    )
    barcode_image = models.ImageField(
        upload_to='barcodes/',
        blank=True,
        null=True
    )

    # Images — 4 different views
    image_front = models.ImageField(
        upload_to='sarees/front/',
    )
    image_back = models.ImageField(
        upload_to='sarees/back/',
        blank=True,
        null=True
    )
    image_closeup = models.ImageField(
        upload_to='sarees/closeup/',
        blank=True,
        null=True
    )
    image_pallu = models.ImageField(
        upload_to='sarees/pallu/',
        blank=True,
        null=True
    )

    # This image is sent to AI for try-on
    # Should be flat-lay or mannequin image
    tryon_image = models.ImageField(
        upload_to='sarees/tryon/',
    )

    # Stock
    in_stock = models.BooleanField(default=True)
    stock_quantity = models.PositiveIntegerField(default=0)

    # Meta
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sarees'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.barcode_id})"

    @property
    def all_images(self):
        images = []
        if self.image_front:
            images.append({'type': 'front', 'url': self.image_front.url})
        if self.image_back:
            images.append({'type': 'back', 'url': self.image_back.url})
        if self.image_closeup:
            images.append({'type': 'closeup', 'url': self.image_closeup.url})
        if self.image_pallu:
            images.append({'type': 'pallu', 'url': self.image_pallu.url})
        return images