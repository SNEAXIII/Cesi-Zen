import uuid

from fastapi import APIRouter, HTTPException, Depends

from src.Messages.user_messages import (
    TARGET_USER_DISABLED_SUCCESSFULLY,
    TARGET_USER_ENABLED_SUCCESSFULLY,
    TARGET_USER_DELETED_SUCCESSFULLY,
)
from src.dto.dto_utilisateurs import UserAdminViewAllUsers
from src.services.AuthService import AuthService
from src.services.UserService import UserService
from src.utils.db import SessionDep

admin_controller = APIRouter(
    prefix="/admin",
    tags=["Admin"],
    dependencies=[
        # Depends(AuthService.is_logged_as_admin),
        # Depends(AuthService.get_current_user_in_jwt),
    ],
)


@admin_controller.get("/users", status_code=200, response_model=UserAdminViewAllUsers)
async def get_users(session: SessionDep, page: int = 1, size: int = 10):
    if page < 1:
        raise HTTPException(
            status_code=400, detail="Le numéro de la page doit être positif"
        )
    if size < 1:
        raise HTTPException(
            status_code=400, detail="Le taille de la page doit être positif"
        )
    result = await UserService.get_users_with_pagination(session, page, size)
    return result


@admin_controller.patch("/users/disable/{user_uuid_to_disable}", status_code=200)
async def patch_disable_user(session: SessionDep, user_uuid_to_disable: uuid.UUID):
    await UserService.admin_patch_disable_user(session, user_uuid_to_disable)
    return {"message": TARGET_USER_DISABLED_SUCCESSFULLY}


@admin_controller.patch("/users/enable/{user_uuid_to_enable}", status_code=200)
async def patch_enable_user(session: SessionDep, user_uuid_to_enable: uuid.UUID):
    await UserService.admin_patch_enable_user(session, user_uuid_to_enable)
    return {"message": TARGET_USER_ENABLED_SUCCESSFULLY}


@admin_controller.delete("/users/delete/{user_uuid_to_delete}", status_code=200)
async def delete_user(session: SessionDep, user_uuid_to_delete: uuid.UUID):
    await UserService.admin_delete_user(session, user_uuid_to_delete)
    return {"message": TARGET_USER_DELETED_SUCCESSFULLY}
