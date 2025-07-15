import uuid
from datetime import datetime
from typing import Optional

import pytest
from httpx import AsyncClient, ASGITransport

from src.dto.dto_articles import GetArticleResponseMin, GetAllArticleResponse
from src.models import Article, Category, User, LoginLog, ExerciseCoherenceCardiac  # noqa: F401
from faker import Faker


from main import app
from src.utils.db import get_session
from tests.utils_db import (
    get_test_session,
    load_objects,
    reset_test_db,  # noqa: F401
)

app.dependency_overrides[get_session] = get_test_session
fake = Faker(locale="en")
LOGIN = "login"
EMAIL = "email"
HASHED_PASSWORD = "hashed_password"
LABEL = "label"
CREATED_AT = datetime.now()
TITLE = "title"
CONTENT = "content"
USER_ID = uuid.uuid4()


def get_basic_user(id: Optional[str] = None) -> User:
    return User(id=id, login=LOGIN, email=EMAIL, hashed_password=HASHED_PASSWORD)


def get_basic_category(id: Optional[int] = None) -> Category:
    return Category(id=id, label=f"{LABEL}{id if id else ''}")


def get_basic_article(id: Optional[int] = None) -> Article:
    return Article(
        id=id,
        title=f"{TITLE}{id if id else ''}",
        content=f"{CONTENT}{id if id else ''}",
        created_at=CREATED_AT,
        id_user=USER_ID,
        id_category=1,
    )


async def push_one_article_bundle():
    user = get_basic_user()
    category = get_basic_category()
    article = get_basic_article()
    await load_objects([user, category, article])


@pytest.mark.asyncio
async def test_get_all():
    await push_one_article_bundle()
    expected_list_article = [
        GetArticleResponseMin(
            id=1,
            title=TITLE,
            creator=LOGIN,
            id_category=1,
            category=LABEL,
            created_at=CREATED_AT.isoformat(),
        )
    ]
    expected = GetAllArticleResponse(
        count=len(expected_list_article), articles=expected_list_article
    )
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        response = await ac.get("/articles/")
    assert response.status_code == 200
    assert response.json() == expected.model_dump(mode="json")
