from typing import Annotated

from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from src.dto.dto_token import LoginResponse
from src.dto.dto_utilisateurs import (
    CreateUser,
    SuccessfullyCreatedUtilisateur,
    UserProfile,
)
from src.models import User
from src.services.JWTService import JWTService
from src.services.AuthService import (
    AuthService,
)

from src.services.UserService import UserService
from src.utils.db import SessionDep

auth_controller = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@auth_controller.post("/login", response_model=LoginResponse, status_code=200)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: SessionDep
) -> LoginResponse:
    authenticated_user: User = await AuthService.authenticate_user(
        session, form_data.username, form_data.password
    )
    access_token = JWTService.create_access_token(authenticated_user)
    return LoginResponse(
        token_type="bearer",
        access_token=access_token,
    )


@auth_controller.get("/session", response_model=UserProfile)
async def read_users_me(
    current_user: Annotated[User, Depends(AuthService.get_current_user_in_jwt)],
):
    return current_user


@auth_controller.post("/register", response_model=SuccessfullyCreatedUtilisateur)
async def create_user(create_user_dto: CreateUser, session: SessionDep):
    user = await UserService.create_user_register(session, create_user_dto)
    return user
