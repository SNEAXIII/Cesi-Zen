from typing import List

from fastapi import APIRouter
from src.models import Article
from src.services.ArticlesService import ArticleService
from src.utils.db import SessionDep

article_controller = APIRouter(
    prefix="/articles",
    tags=["Articles"],
)


@article_controller.get("/{article_id}", response_model=Article)
async def get_article(
    article_id: int,
    session: SessionDep,
):
    article = await ArticleService.get_article(session, article_id)
    return article


@article_controller.get("/category/{category_id}", response_model=List[Article])
async def get_articles_by_category(
    category_id: int,
    session: SessionDep,
):
    articles = await ArticleService.get_all_by_category(session, category_id)
    return {"articles": articles}
