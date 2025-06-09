from typing import Annotated, Optional
from fastapi import Depends

from src.Messages.jwt_messages import CREDENTIALS_EXCEPTION

from src.models import User
from src.services.JWTService import JWTService, oauth2_scheme
from src.services.PasswordService import PasswordService
from src.services.UserService import UserService
from src.utils.db import SessionDep


class AuthService:
    @classmethod
    async def authenticate_user(
        cls,
        session: SessionDep,
        username: str,
        password: str,
    ) -> Optional[User]:
        user = await UserService.get_user_by_login_with_validity_check(
            session, username
        )
        if not user:
            raise CREDENTIALS_EXCEPTION
        is_correct_password = await PasswordService.verify_password(
            password, user.hashed_password
        )
        if is_correct_password is not True:
            raise CREDENTIALS_EXCEPTION
        user.set_last_login_date()
        await session.commit()
        return user

    @classmethod
    async def get_current_user_in_jwt(
        cls,
        session: SessionDep,
        token: Annotated[str, Depends(oauth2_scheme)],
    ) -> User:
        username = JWTService.decode_jwt(token).get("sub")
        user = await UserService.get_user_by_login_with_validity_check(
            session, username
        )
        return user
