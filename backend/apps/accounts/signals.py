from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User


@receiver(post_save, sender=User)
def create_user_cart(sender, instance, created, **kwargs):
    """
    New user register aana automatically cart create pannurom
    """
    if created and instance.role == 'customer':
        from apps.cart.models import Cart
        Cart.objects.get_or_create(user=instance)