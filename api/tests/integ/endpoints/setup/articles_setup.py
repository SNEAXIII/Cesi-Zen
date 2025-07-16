from typing import Optional
from src.models import Article, Category, User, LoginLog, ExerciseCoherenceCardiac  # noqa: F401
from tests.utils.utils_db import load_objects


from tests.utils.utils_constant import (
    HASHED_PASSWORD,
    CONTENT,
    LABEL,
    LOGIN,
    USER_ID,
    TITLE,
    CREATED_AT,
    EMAIL,
)


def get_basic_user(id: Optional[str] = None) -> User:
    return User(
        id=id if id else USER_ID,
        login=LOGIN,
        email=EMAIL,
        hashed_password=HASHED_PASSWORD,
    )


def get_basic_category(id: Optional[int] = None) -> Category:
    return Category(id=id, label=f"{LABEL}{id if id else ''}")


def get_basic_article(id: Optional[int] = None, id_category: int = 1) -> Article:
    return Article(
        id=id,
        title=f"{TITLE}{id if id else ''}",
        content=f"{CONTENT}{id if id else ''}",
        created_at=CREATED_AT,
        id_user=USER_ID,
        id_category=id_category,
    )


async def do_nothing():
    return


async def push_one_article_bundle():
    user = get_basic_user()
    category = get_basic_category()
    articles = [get_basic_article()]
    await load_objects([user, category] + articles)


async def push_ten_articles_with_2_categories_bundle():
    user = get_basic_user()
    categories = [get_basic_category(id) for id in range(2)]
    articles = [get_basic_article(id + 1, id_category=id % 2) for id in range(10)]
    await load_objects([user] + categories + articles)


async def push_ten_articles_bundle():
    user = get_basic_user()
    category = get_basic_category()
    articles = [get_basic_article(id + 1) for id in range(10)]
    await load_objects([user, category] + articles)
