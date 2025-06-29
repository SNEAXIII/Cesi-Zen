from typing import List, Optional

from fastapi.exceptions import HTTPException, RequestValidationError
from sqlmodel import select
from src.dto.dto_articles import (
    CreateArticle,
    GetAllArticleResponse,
    GetArticleResponseMin,
)
from src.models import Article, User, Category
from src.services.CategoryService import CategoryService
from src.utils.db import SessionDep


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
        new_article = Article(
            title=create_article.title,
            content=create_article.content,
            category=category,
            user=current_user,
        )
        session.add(new_article)
        await session.commit()
        await session.refresh(new_article)
        return new_article

    @classmethod
    async def delete_article(cls, session: SessionDep, article_id: int) -> bool:
        article = await cls.get_article(session, article_id)
        if not article:
            raise RequestValidationError(errors=[{"msg": "Article introuvable"}])
        await session.delete(article)
        await session.commit()
        return True

    @classmethod
    async def get_article(
        cls, session: SessionDep, article_id: int
    ) -> Optional[Article]:
        article = await session.get(Article, article_id)
        if not article:
            raise RequestValidationError(errors=[{"msg": "Article introuvable"}])
        return article

    @classmethod
    async def get_all_by_category(
        cls, session: SessionDep, category_id: int
    ) -> List[Article]:
        sql = select(Article).where(Article.category_id == category_id)
        result = await session.exec(sql)
        articles = result.all()
        if not articles:
            raise RequestValidationError(
                errors=[{"msg": "Aucun article trouvé pour cette catégorie"}]
            )
        return articles

    @classmethod
    async def get_all(cls, session: SessionDep) -> GetAllArticleResponse:
        sql = select(Article, User, Category).join(User).join(Category)
        result = await session.exec(sql)
        rows = result.all()
        if not rows:
            raise RequestValidationError(errors=[{"msg": "Aucun article trouvé"}])
        mapped_articles = []
        for article, _, _ in rows:
            article_model = article.model_dump()
            article_model["category"] = article.category.label
            article_model["creator"] = article.user.login
            mapped_articles.append(GetArticleResponseMin.model_validate(article_model))
        return GetAllArticleResponse(articles=mapped_articles, count=len(mapped_articles))
