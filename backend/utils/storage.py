import cloudinary
import cloudinary.uploader
from django.conf import settings
import requests
from io import BytesIO
from PIL import Image


def upload_to_cloudinary(image_file, folder='sarees'):
    """
    Image directly cloudinary ku upload pannum
    Returns: secure_url
    """
    try:
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
            api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
            api_secret=settings.CLOUDINARY_STORAGE['API_SECRET'],
        )

        result = cloudinary.uploader.upload(
            image_file,
            folder=f"saree_tryon/{folder}",
            resource_type='image',
            quality='auto',
            fetch_format='auto',
        )

        return result.get('secure_url')

    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None


def download_image_from_url(url):
    """
    URL la irundhu image download pannum
    AI result image save pannuvom idha use panni
    Returns: BytesIO object
    """
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return BytesIO(response.content)
    except Exception as e:
        print(f"Image download error: {e}")
        return None