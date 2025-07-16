import pytest

from src.dto.dto_articles import GetArticleResponseMin, GetAllArticleResponse
from src.models import Article, Category, User, LoginLog, ExerciseCoherenceCardiac  # noqa: F401


from main import app
from src.utils.db import get_session
from tests.integ.endpoints.setup.articles_setup import do_nothing, push_one_article_bundle, TITLE, LOGIN, LABEL, \
    CREATED_AT, push_ten_articles_bundle, push_ten_articles_with_2_categories_bundle
from tests.utils_db import (
    get_test_session,
    reset_test_db,  # noqa: F401
)
from tests.utils_request import get_test_client

app.dependency_overrides[get_session] = get_test_session


get_all_params = {
    "zero": {
        "loader": do_nothing,
        "expected": GetAllArticleResponse(
            count=0,
            articles=[],
        ),
    },
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
    },
    "ten": {
        "loader": push_ten_articles_bundle,
        "expected": GetAllArticleResponse(
            count=10,
            articles=[
                GetArticleResponseMin(
                    id=id + 1,
                    title=f"{TITLE}{id + 1}",
                    creator=f"{LOGIN}",
                    id_category=1,
                    category=LABEL,
                    created_at=CREATED_AT.isoformat(),
                )
                for id in range(10)
            ],
        ),
    },
    "five_filtered_by_category": {
        "route": "/articles/?category_id=1",
        "loader": push_ten_articles_with_2_categories_bundle,
        "expected": GetAllArticleResponse(
            count=5,
            articles=[
                GetArticleResponseMin(
                    id=id + 1,
                    title=f"{TITLE}{id + 1}",
                    creator=f"{LOGIN}",
                    id_category=1,
                    category=f"{LABEL}1",
                    created_at=CREATED_AT.isoformat(),
                )
                for id in range(1, 10 + 1, 2)
            ],
        ),
    },
}


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "values",
    get_all_params.values(),
    ids=[f"case_{k}" for k in get_all_params.keys()],
)
async def test_get_all(values: dict):
    reset_test_db()
    route = values.get("route", "/articles/")
    await values["loader"]()
    async with get_test_client() as client:
        response = await client.get(route)
    assert response.status_code == 200
    assert response.json() == values["expected"].model_dump(mode="json")
