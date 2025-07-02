from typing import Optional, Tuple

from fastapi.exceptions import HTTPException
from sqlmodel import select
from src.dto.dto_articles import (
    CreateArticle,
    GetAllArticleResponse,
    GetArticleResponseFull,
    GetArticleResponseMin,
)
from src.models import Article, Category, User
from src.services.CategoryService import CategoryService
from src.utils.db import SessionDep
from src.utils.sanitizer import sanitize_content_async


class ArticleService:
    @classmethod
    async def create_article(
        cls,
        session: SessionDep,
        current_user: User,
        create_article: CreateArticle,
    ) -> Article:
        category = await CategoryService.get_category_by_id(
            session, create_article.category
        )
        if not category:
            raise HTTPException(status_code=400, detail="La catégorie n'existe pas")
        sanitized_content = await sanitize_content_async(create_article.content)
        new_article = Article(
            title=create_article.title,
            content=sanitized_content,
            category=category,
            user=current_user,
        )
        session.add(new_article)
        await session.commit()
        await session.refresh(new_article)
        return new_article

    @classmethod
    async def delete_article(cls, session: SessionDep, article_id: int) -> bool:
        article = await session.get(Article, article_id)
        if not article:
            raise HTTPException(status_code=404, detail="Article introuvable")
        await session.delete(article)
        await session.commit()
        return True

    @classmethod
    async def get_article(
        cls, session: SessionDep, article_id: int
    ) -> GetArticleResponseFull:
        sql = (
            select(Article, User, Category)
            .join(User)
            .join(Category)
            .where(Article.id == article_id)
        )
        result = await session.execute(sql)
        tuple_result: Optional[Tuple[Article, User, Category]] = result.first()
        if not tuple_result:
            raise HTTPException(status_code=404, detail="Article introuvable")
        article, _, _ = tuple_result
        article_model = article.model_dump()
        article_model["category"] = article.category.label
        article_model["creator"] = article.user.login
        return GetArticleResponseFull.model_validate(article_model)

    @classmethod
    async def get_all(
        cls, session: SessionDep, category_id: Optional[int]
    ) -> GetAllArticleResponse:
        sql = select(Article, User, Category).join(User).join(Category)
        if category_id:
            sql = sql.where(Category.id == category_id)
        sql = sql.order_by(Article.created_at.desc())
        result = await session.exec(sql)
        rows = result.all()
        if not rows:
            raise HTTPException(status_code=404, detail="Aucun article trouvé")
        mapped_articles = []
        for article, _, _ in rows:
            article_model = article.model_dump()
            article_model["category"] = article.category.label
            article_model["creator"] = article.user.login
            mapped_articles.append(GetArticleResponseMin.model_validate(article_model))
        return GetAllArticleResponse(
            articles=mapped_articles, count=len(mapped_articles)
        )
