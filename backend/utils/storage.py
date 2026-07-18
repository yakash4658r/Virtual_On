import os
import uuid
import aiofiles
import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile
from core.config import settings
import asyncio
from concurrent.futures import ThreadPoolExecutor

# Initialize S3 client if configured
s3_client = None
if settings.STORAGE_PROVIDER in ['s3', 'r2'] and settings.STORAGE_ACCESS_KEY:
    s3_client = boto3.client(
        's3',
        endpoint_url=settings.STORAGE_ENDPOINT_URL if settings.STORAGE_ENDPOINT_URL else None,
        aws_access_key_id=settings.STORAGE_ACCESS_KEY,
        aws_secret_access_key=settings.STORAGE_SECRET_KEY
    )

executor = ThreadPoolExecutor(max_workers=10)

def _upload_to_s3_sync(file_obj, object_name, content_type):
    try:
        s3_client.upload_fileobj(
            file_obj,
            settings.STORAGE_BUCKET,
            object_name,
            ExtraArgs={'ContentType': content_type}
        )
        # Construct public URL
        if settings.STORAGE_PUBLIC_URL:
            return f"{settings.STORAGE_PUBLIC_URL.rstrip('/')}/{object_name}"
        return f"{settings.STORAGE_ENDPOINT_URL.rstrip('/')}/{settings.STORAGE_BUCKET}/{object_name}"
    except ClientError as e:
        print(f"S3 Upload Error: {e}")
        return None

async def upload_file_to_storage(file: UploadFile, folder: str = "uploads") -> str:
    """
    Uploads a file to configured storage (S3/R2 or local fallback).
    Returns the public URL of the uploaded file.
    """
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    object_name = f"{folder}/{filename}"
    
    if s3_client and settings.STORAGE_PROVIDER in ['s3', 'r2']:
        # Read file into memory (FastAPI UploadFile is file-like)
        file_content = await file.read()
        
        from io import BytesIO
        file_obj = BytesIO(file_content)
        
        loop = asyncio.get_event_loop()
        url = await loop.run_in_executor(
            executor, 
            _upload_to_s3_sync, 
            file_obj, 
            object_name, 
            file.content_type
        )
        if url:
            return url
            
        print("Falling back to local storage due to S3 upload failure.")
        
    # Fallback to local storage
    os.makedirs(f"media/{folder}", exist_ok=True)
    file_path = f"media/{folder}/{filename}"
    
    # Need to seek to 0 in case it was read above
    await file.seek(0)
    
    async with aiofiles.open(file_path, "wb") as buffer:
        while content := await file.read(1024 * 1024):  # 1MB chunks
            await buffer.write(content)
            
    return f"/media/{folder}/{filename}"

async def upload_bytes_to_storage(file_content: bytes, filename: str, content_type: str = "image/jpeg", folder: str = "results") -> str:
    """
    Uploads raw bytes to configured storage (S3/R2 or local fallback).
    Returns the public URL of the uploaded file.
    """
    object_name = f"{folder}/{filename}"
    
    if s3_client and settings.STORAGE_PROVIDER in ['s3', 'r2']:
        from io import BytesIO
        file_obj = BytesIO(file_content)
        
        loop = asyncio.get_event_loop()
        url = await loop.run_in_executor(
            executor, 
            _upload_to_s3_sync, 
            file_obj, 
            object_name, 
            content_type
        )
        if url:
            return url
            
        print("Falling back to local storage due to S3 upload failure.")
        
    # Fallback to local storage
    os.makedirs(f"media/{folder}", exist_ok=True)
    file_path = f"media/{folder}/{filename}"
    
    async with aiofiles.open(file_path, "wb") as buffer:
        await buffer.write(file_content)
            
    return f"/media/{folder}/{filename}"

def _delete_from_s3_sync(object_name):
    try:
        s3_client.delete_object(Bucket=settings.STORAGE_BUCKET, Key=object_name)
    except ClientError as e:
        print(f"S3 Delete Error: {e}")

async def delete_file_from_storage(url: str):
    """
    Deletes a file from storage given its public URL.
    """
    if not url:
        return
        
    if s3_client and settings.STORAGE_PROVIDER in ['s3', 'r2'] and (settings.STORAGE_PUBLIC_URL in url or settings.STORAGE_ENDPOINT_URL in url):
        # Extract object key from URL
        if settings.STORAGE_PUBLIC_URL in url:
            object_name = url.replace(f"{settings.STORAGE_PUBLIC_URL.rstrip('/')}/", "")
        else:
            object_name = url.split(f"/{settings.STORAGE_BUCKET}/")[-1]
            
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(executor, _delete_from_s3_sync, object_name)
    
    elif url.startswith("/media/"):
        # Local deletion
        file_path = url.lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)
