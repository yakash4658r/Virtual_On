from fastapi.testclient import TestClient
from main import app
from core.database import Base, engine
import asyncio

client = TestClient(app)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

# Run init_db
asyncio.run(init_db())

response = client.post("/api/auth/register", json={
    "name": "Test User",
    "email": "test@test.com",
    "password": "password123",
    "phone": "1234567890"
})

print("Registration Response:")
print(response.status_code)
print(response.json())

# Test Login
login_response = client.post("/api/auth/login", json={
    "username": "test@test.com",
    "password": "password123"
})

print("\nLogin Response:")
print(login_response.status_code)
print(login_response.json())
