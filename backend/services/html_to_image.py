"""
HTML to Image conversion service using imgkit (wkhtmltoimage wrapper)
Requires: pip install imgkit
Also requires wkhtmltopdf installed: https://wkhtmltopdf.org/downloads.html

For Windows:
1. Download from: https://wkhtmltopdf.org/downloads.html
2. Install to default location: C:\Program Files\wkhtmltopdf
3. Or set WKHTMLTOPDF_PATH environment variable
"""

import imgkit
import base64
from io import BytesIO
import os

def html_to_image_sync(html_content: str, width: int = 900, height: int = None) -> bytes:
    """
    Convert HTML content to PNG image using imgkit
    
    Args:
        html_content: HTML string to convert
        width: Width of the image
        height: Height (not used with imgkit, auto-calculated)
    
    Returns:
        bytes: PNG image data
    """
    try:
        # Try to find wkhtmltopdf
        wkhtmltopdf_paths = [
            os.getenv('WKHTMLTOPDF_PATH'),
            r'C:\Program Files\wkhtmltopdf\bin\wkhtmltoimage.exe',
            r'C:\Program Files (x86)\wkhtmltopdf\bin\wkhtmltoimage.exe',
            '/usr/local/bin/wkhtmltoimage',
            '/usr/bin/wkhtmltoimage'
        ]
        
        wkhtmltopdf_path = None
        for path in wkhtmltopdf_paths:
            if path and os.path.exists(path):
                wkhtmltopdf_path = path
                break
        
        config = None
        if wkhtmltopdf_path:
            print(f"Using wkhtmltoimage from: {wkhtmltopdf_path}")
            config = imgkit.config(wkhtmltoimage=wkhtmltopdf_path)
        
        options = {
            'format': 'png',
            'width': width,
            'quality': 100,
            'enable-local-file-access': None,
            'encoding': 'UTF-8'
        }
        
        # Convert HTML to image
        if config:
            img_bytes = imgkit.from_string(html_content, False, options=options, config=config)
        else:
            img_bytes = imgkit.from_string(html_content, False, options=options)
        
        return img_bytes
    except Exception as e:
        raise
