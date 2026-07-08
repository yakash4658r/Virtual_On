from django.db import models
from django.conf import settings
import uuid


class TryOnSession(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tryon_sessions'
    )
    customer_photo = models.ImageField(
        upload_to='customer_photos/',
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    # Which sarees selected for this session
    sarees = models.ManyToManyField(
        'products.Saree',
        through='TryOnResult',
        related_name='tryon_sessions'
    )

    # Auto delete photo after 24 hours (privacy)
    photo_expires_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'tryon_sessions'
        ordering = ['-created_at']

    def __str__(self):
        return f"TryOn Session - {self.user.name} - {self.created_at.date()}"

    @property
    def completed_count(self):
        return self.results.filter(status='completed').count()

    @property
    def total_count(self):
        return self.results.count()

    @property
    def progress(self):
        if self.total_count == 0:
            return "0/0"
        return f"{self.completed_count}/{self.total_count}"


class TryOnResult(models.Model):

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    session = models.ForeignKey(
        TryOnSession,
        on_delete=models.CASCADE,
        related_name='results'
    )
    saree = models.ForeignKey(
        'products.Saree',
        on_delete=models.CASCADE,
        related_name='tryon_results'
    )

    result_image = models.ImageField(
        upload_to='tryon_results/',
        blank=True,
        null=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    error_message = models.TextField(blank=True)

    # AI processing details
    ai_provider = models.CharField(max_length=50, blank=True)
    processing_time_seconds = models.FloatField(null=True, blank=True)
    ai_cost_usd = models.DecimalField(
        max_digits=8,
        decimal_places=4,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'tryon_results'
        unique_together = ('session', 'saree')
        ordering = ['created_at']

    def __str__(self):
        return f"Result - {self.saree.name} - {self.status}"