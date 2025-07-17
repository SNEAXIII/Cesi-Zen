import pytest

from src.models import Article, Category, User, LoginLog, ExerciseCoherenceCardiac  # noqa: F401
from src.dto.dto_articles import (
    GetArticleResponseMin,
    GetAllArticleResponse,
    GetArticleResponseFull,
)
from main import app
from src.utils.db import get_session
from tests.integ.endpoints.setup.articles_setup import (
    do_nothing,
    push_one_article_bundle,
    push_ten_articles_bundle,
    push_ten_articles_with_2_categories_bundle,
    TITLE,
    LOGIN,
    LABEL,
    CREATED_AT,
    CONTENT,
)
from tests.utils.utils_db import (
    get_test_session,
    reset_test_db,  # noqa: F401
)
from tests.utils.utils_client import get_test_client

app.dependency_overrides[get_session] = get_test_session

@pytest.mark.asyncio
async def test_get_one():
    reset_test_db()
    route = "/auth/login"
    values = {"loader": push_one_article_bundle, "return_code": 200,"expected":{}}
    await values["loader"]()
    async with get_test_client() as client:
        response = await client.post(route)
    print(response.json())
    assert response.status_code == values["return_code"]
    assert response.json() == values["expected"]
