# tests/utils_client.py
from contextlib import asynccontextmanager
from httpx import AsyncClient, ASGITransport
from main import app


@asynccontextmanager
async def get_test_client():
    async with AsyncClient(
        transport=ASGITransport(app=app, raise_app_exceptions=False),
        base_url="http://test",
    ) as client:
        yield client
