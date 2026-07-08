from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Saree


@receiver(post_save, sender=Saree)
def regenerate_barcode_if_missing(sender, instance, created, **kwargs):
    """
    Barcode missing irundha auto generate pannum
    """
    if not created:
        return

    if not instance.barcode_id or not instance.barcode_image:
        from utils.barcode_utils import (
            generate_barcode_id,
            generate_barcode_image
        )

        update_fields = []

        if not instance.barcode_id:
            instance.barcode_id = generate_barcode_id()
            update_fields.append('barcode_id')

        if not instance.barcode_image and instance.barcode_id:
            barcode_img = generate_barcode_image(
                instance.barcode_id,
                instance.name,
                instance.price
            )
            if barcode_img:
                instance.barcode_image.save(
                    f"barcode_{instance.barcode_id}.png",
                    barcode_img,
                    save=False
                )
                update_fields.append('barcode_image')

        if update_fields:
            Saree.objects.filter(pk=instance.pk).update(
                barcode_id=instance.barcode_id,
            )