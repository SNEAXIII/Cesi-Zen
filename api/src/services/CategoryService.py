from typing import List, Optional

from sqlmodel import select
from src.models.Category import Category
from src.utils.db import SessionDep


class CategoryService:

    @classmethod
    async def get_category_by_id(
        cls, session: SessionDep, category_id: int
    ) -> Optional[Category]:
        result = await session.exec(select(Category).where(Category.id == category_id))
        return result.first()

    @classmethod
    async def get_all_categories(cls, session: SessionDep) -> List[Category]:
        result = await session.exec(select(Category).order_by(Category.label))
        return result.all()
