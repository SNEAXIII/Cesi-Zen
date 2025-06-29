from typing import Optional, List

from fastapi.exceptions import RequestValidationError, HTTPException
from sqlmodel import select

from src.models import Article, User
from src.dto.dto_articles import (
    CreateArticle,
)
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
        print(category,current_user)
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
