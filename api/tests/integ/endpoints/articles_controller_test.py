import uuid
from datetime import datetime
from typing import Optional

import pytest

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
from tests.utils_request import get_test_client

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
    return User(
        id=id if id else USER_ID,
        login=LOGIN,
        email=EMAIL,
        hashed_password=HASHED_PASSWORD,
    )


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
    await load_objects([user])
    await load_objects([category])
    await load_objects([article])
async def push_ten_articles_bundle():
    user = get_basic_user()
    category = get_basic_category()
    articles = [get_basic_article(id+1) for id in range(10)]
    await load_objects([user])
    await load_objects([category])
    await load_objects(articles)


get_all_params = {
    "one": {
        "loader": push_one_article_bundle,
        "expected": GetAllArticleResponse(
            count=1,
            articles=[
                GetArticleResponseMin(
                    id=1,
                    title=TITLE,
                    creator=LOGIN,
                    id_category=1,
                    category=LABEL,
                    created_at=CREATED_AT.isoformat(),
                )
            ],
        ),
    },"ten": {
        "loader": push_ten_articles_bundle,
        "expected": GetAllArticleResponse(
            count=10,
            articles=[
                GetArticleResponseMin(
                    id=1,
                    title=TITLE,
                    creator=LOGIN,
                    id_category=1,
                    category=LABEL,
                    created_at=CREATED_AT.isoformat(),
                )
            ],
        ),
    }
}


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
    async with get_test_client() as client:
        response = await client.get("/articles/")
    assert response.status_code == 200
    assert response.json() == expected.model_dump(mode="json")
