from typing import Optional

from fastapi import APIRouter

from src.dto.dto_articles import GetAllArticleResponse
from src.models import Article
from src.services.ArticlesService import ArticleService
from src.utils.db import SessionDep

article_controller = APIRouter(
    prefix="/articles",
    tags=["Articles"],
)


@article_controller.get("/", response_model=GetAllArticleResponse)
async def get_articles(
    session: SessionDep,
    category_id: Optional[int]=None,
):
    result = await ArticleService.get_all(session, category_id)
    return result


@article_controller.get("/{article_id}", response_model=Article)
async def get_article(
    article_id: int,
    session: SessionDep,
):
    article = await ArticleService.get_article(session, article_id)
    return article
