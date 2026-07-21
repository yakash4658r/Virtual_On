from core.config import settings
import asyncio
import httpx
import time

class ReplicateClient:
    def __init__(self):
        self.api_token = settings.REPLICATE_API_TOKEN
        self.base_url = "https://api.replicate.com/v1"
        
    async def run_tryon(self, saree_image_url: str, customer_image_url: str) -> str:
        if not self.api_token or self.api_token == "your_replicate_token":
            # Fallback to mock if no real key
            await asyncio.sleep(2)
            return saree_image_url
            
        headers = {
            "Authorization": f"Token {self.api_token}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "version": "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",  # fashn/tryon
            "input": {
                "model_image": customer_image_url,
                "garment_image": saree_image_url,
                "category": "one-pieces",  # Full garment (saree)
                "nsfw_filter": True,
                "cover_feet": True,
            }
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Create prediction
            create_res = await client.post(
                f"{self.base_url}/predictions",
                json=payload,
                headers=headers
            )
            create_res.raise_for_status()
            prediction = create_res.json()
            prediction_id = prediction["id"]
            
            # Poll for completion
            max_polls = 30  # Max 90 seconds
            for _ in range(max_polls):
                await asyncio.sleep(3)
                poll_res = await client.get(
                    f"{self.base_url}/predictions/{prediction_id}",
                    headers=headers
                )
                poll_res.raise_for_status()
                data = poll_res.json()
                
                status = data.get("status")
                if status == "succeeded":
                    output = data.get("output")
                    if isinstance(output, list):
                        return output[0]
                    return output
                elif status in ("failed", "canceled"):
                    error = data.get("error", "Unknown AI error")
                    raise ValueError(f"Replicate prediction failed: {error}")
                    
            raise TimeoutError("AI try-on timed out after 90 seconds")
