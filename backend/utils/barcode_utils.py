import barcode
from barcode.writer import ImageWriter
from io import BytesIO
from django.core.files.base import ContentFile
import uuid
import qrcode
from PIL import Image, ImageDraw, ImageFont
import os


def generate_barcode_id():
    """
    Unique barcode ID generate pannum
    Format: SAR-XXXXXXXX
    """
    unique_part = str(uuid.uuid4()).replace('-', '').upper()[:8]
    return f"SAR-{unique_part}"


def generate_barcode_image(barcode_id, saree_name, price):
    """
    Barcode image generate pannum with saree details below
    Returns: Django ContentFile (save to ImageField directly)
    """
    try:
        # Create barcode (Code128 format)
        CODE128 = barcode.get_barcode_class('code128')
        
        # Barcode generate
        barcode_instance = CODE128(
            barcode_id,
            writer=ImageWriter()
        )

        # Save to buffer
        buffer = BytesIO()
        barcode_instance.write(buffer, options={
            'module_width': 0.8,
            'module_height': 10.0,
            'font_size': 8,
            'text_distance': 3,
            'background': 'white',
            'foreground': 'black',
            'quiet_zone': 4.0,
            'write_text': True,
        })

        buffer.seek(0)
        barcode_img = Image.open(buffer)

        # Add saree name and price below barcode
        final_img = add_text_to_barcode(
            barcode_img,
            saree_name,
            price,
            barcode_id
        )

        # Convert to ContentFile
        output_buffer = BytesIO()
        final_img.save(output_buffer, format='PNG', quality=95)
        output_buffer.seek(0)

        filename = f"barcode_{barcode_id}.png"
        return ContentFile(output_buffer.read(), name=filename)

    except Exception as e:
        print(f"Barcode generation error: {e}")
        return None


def add_text_to_barcode(barcode_img, saree_name, price, barcode_id):
    """
    Barcode image la saree name and price add pannum
    """
    # Get barcode dimensions
    barcode_width, barcode_height = barcode_img.size

    # Extra space for text
    extra_height = 60
    new_height = barcode_height + extra_height

    # New white image
    final_img = Image.new('RGB', (barcode_width, new_height), 'white')
    final_img.paste(barcode_img, (0, 0))

    # Draw text
    draw = ImageDraw.Draw(final_img)

    # Saree name (truncate if too long)
    display_name = saree_name[:30] + '...' if len(saree_name) > 30 else saree_name
    
    # Price text
    price_text = f"Rs. {price}"

    # Draw texts
    draw.text(
        (barcode_width // 2, barcode_height + 10),
        display_name,
        fill='black',
        anchor='mm'
    )
    draw.text(
        (barcode_width // 2, barcode_height + 35),
        price_text,
        fill='black',
        anchor='mm'
    )

    return final_img


def generate_qr_code(data, saree_name):
    """
    QR code generate pannum (alternative to barcode)
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=8,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    qr_img = qr.make_image(fill_color='black', back_color='white')

    # Add saree name below QR
    qr_width, qr_height = qr_img.size
    extra_height = 40
    final_img = Image.new('RGB', (qr_width, qr_height + extra_height), 'white')
    final_img.paste(qr_img, (0, 0))

    draw = ImageDraw.Draw(final_img)
    draw.text(
        (qr_width // 2, qr_height + 15),
        saree_name[:25],
        fill='black',
        anchor='mm'
    )

    buffer = BytesIO()
    final_img.save(buffer, format='PNG')
    buffer.seek(0)

    filename = f"qr_{data}.png"
    return ContentFile(buffer.read(), name=filename)