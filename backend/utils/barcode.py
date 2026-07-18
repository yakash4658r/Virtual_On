import barcode
from barcode.writer import ImageWriter
from io import BytesIO
import random
import string
from utils.storage import upload_bytes_to_storage

def generate_barcode_id() -> str:
    """Generate an 8-character alphanumeric barcode ID"""
    chars = string.ascii_uppercase + string.digits
    return "SV-" + "".join(random.choices(chars, k=6))

async def generate_barcode_image(barcode_id: str, name: str, price: float) -> str:
    """Generate barcode image and return URL/path"""
    CODE128 = barcode.get_barcode_class('code128')
    rv = BytesIO()
    
    options = {
        'module_height': 15.0,
        'module_width': 0.2,
        'quiet_zone': 1.0,
        'font_size': 10,
        'text_distance': 5.0,
        'background': 'white',
        'foreground': 'black',
        'write_text': True,
        'text': f"{barcode_id} - Rs.{price}"
    }
    
    code = CODE128(barcode_id, writer=ImageWriter())
    code.write(rv, options=options)
    
    # Save the BytesIO stream as an image
    rv.seek(0)
    image_url = await upload_bytes_to_storage(rv.read(), f"{barcode_id}.png", content_type="image/png", folder="barcodes")
    return image_url
