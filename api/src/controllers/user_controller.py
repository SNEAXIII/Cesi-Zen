from typing import Annotated

from fastapi import APIRouter, Depends
from src.dto.dto_utilisateurs import Password, ResetPassword
from src.Messages.user_messages import (
    TARGET_USER_DELETED_SUCCESSFULLY,
    TARGET_USER_PASSWORD_RESET_SUCCESSFULLY,
)
from src.models import User
from src.services.AuthService import AuthService
from src.services.UserService import UserService
from src.utils.db import SessionDep

user_controller = APIRouter(
    prefix="/user",
    tags=["User"],
    dependencies=[
        Depends(AuthService.is_logged_as_user),
        Depends(AuthService.get_current_user_in_jwt),
    ],
)


@user_controller.delete("/delete", status_code=200)
async def delete_user(
    body: Password,
    session: SessionDep,
    current_user: Annotated[User, Depends(AuthService.get_current_user_in_jwt)],
):
    await UserService.self_delete(session, current_user, body.password)
    return {"message": TARGET_USER_DELETED_SUCCESSFULLY}


@user_controller.patch("/reset-password", status_code=200)
async def reset_password(
    body: ResetPassword,
    session: SessionDep,
    current_user: Annotated[User, Depends(AuthService.get_current_user_in_jwt)],
):
    await UserService.self_patch_reset_password(session, current_user, body)
    return {"message": TARGET_USER_PASSWORD_RESET_SUCCESSFULLY}
