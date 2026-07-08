from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile


def compress_image(image_file, max_size=(1024, 1024), quality=85):
    """
    Image compress and resize pannum
    """
    try:
        img = Image.open(image_file)

        # Convert to RGB (PNG with transparency handle)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')

        # Resize if too large
        img.thumbnail(max_size, Image.Resampling.LANCZOS)

        # Save compressed
        output = BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        output.seek(0)

        return ContentFile(
            output.read(),
            name=image_file.name
        )

    except Exception as e:
        print(f"Image compression error: {e}")
        return image_file


def compress_tryon_image(image_file):
    """
    Try-on image ku specific compression
    Higher quality needed for AI processing
    """
    return compress_image(
        image_file,
        max_size=(768, 1024),
        quality=92
    )