from typing import List

from fastapi import APIRouter, HTTPException, status
from src.models.Category import Category
from src.services.CategoryService import CategoryService
from src.utils.db import SessionDep

category_controller = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


@category_controller.get("/", response_model=List[Category])
async def get_all_categories(session: SessionDep):
    return await CategoryService.get_all_categories(session)


@category_controller.get("/{category_id}", response_model=Category)
async def get_category(category_id: int, session: SessionDep):
    category = await CategoryService.get_category_by_id(session, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Catégorie avec l'ID {category_id} non trouvée",
        ) from None
    return category
