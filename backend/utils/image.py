from fastapi import UploadFile
from utils.storage import upload_file_to_storage

async def process_upload_file(file: UploadFile, directory: str = "products") -> str:
    """Wrapper around utils.storage for backward compatibility"""
    return await upload_file_to_storage(file, directory)
