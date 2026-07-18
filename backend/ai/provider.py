import asyncio

class MockAIProvider:
    async def run_tryon(self, saree_image_url: str, customer_image_url: str) -> str:
        # Simulate processing time
        await asyncio.sleep(2)
        # Mock result: just return the saree image for now
        return saree_image_url

def get_ai_provider(provider_name: str):
    if provider_name == "replicate":
        from .replicate_client import ReplicateClient
        return ReplicateClient()
    return MockAIProvider()
