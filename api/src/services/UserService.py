from typing import Optional

from sqlmodel import select

from src.Exceptions.user_exceptions import (
    USER_DOESNT_EXISTS,
    USER_IS_DELETED,
    USER_IS_DISABLED,
)
from src.Exceptions.validators_exception import (
    EMAIL_ALREADY_EXISTS_ERROR,
    LOGIN_ALREADY_EXISTS_ERROR,
)
from src.models import User
from src.dto.dto_utilisateurs import CreateUser
from src.services.PasswordService import PasswordService
from src.utils.db import SessionDep
from fastapi.exceptions import RequestValidationError


class UserService:
    @classmethod
    async def create_user_register(
        cls, session: SessionDep, create_user: CreateUser
    ) -> User:
        errors = []
        user_by_email = await UserService.get_user_by_email(session, create_user.email)
        if user_by_email:
            errors.append(EMAIL_ALREADY_EXISTS_ERROR)
        user_by_login = await UserService.get_user_by_login(session, create_user.login)
        if user_by_login:
            errors.append(LOGIN_ALREADY_EXISTS_ERROR)
        if errors:
            raise RequestValidationError(errors=errors)
        user_dict = create_user.model_dump()
        hashed_password = await PasswordService.get_string_hash(create_user.password)
        new_user = User(**user_dict, hashed_password=hashed_password)
        session.add(new_user)
        await session.commit()
        await session.refresh(new_user)
        return new_user

    @classmethod
    async def get_user(cls, session: SessionDep, user_id: str) -> Optional[User]:
        result = await session.get(User, user_id)
        return result

    @classmethod
    async def get_user_by_login(cls, session: SessionDep, login: str) -> Optional[User]:
        sql = select(User).where(User.login == login)
        result = await session.exec(sql)
        return result.first()

    @classmethod
    async def get_user_by_login_with_validity_check(
        cls, session: SessionDep, login: str
    ) -> Optional[User]:
        user = await UserService.get_user_by_login(session, login)
        if user is None:
            raise USER_DOESNT_EXISTS
        if user.deleted:
            raise USER_IS_DELETED
        if user.disabled:
            raise USER_IS_DISABLED
        return user

    @classmethod
    async def get_user_by_email(cls, session: SessionDep, email: str) -> Optional[User]:
        sql = select(User).where(User.email == email)
        result = await session.exec(sql)
        return result.first()


# async def update_utilisateur(session: SessionDep, user_id, **kwargs) -> Optional[User]:
#     # todo vérifier avec des dto
#     user = await session.get(User, user_id)
#     if not user:
#         return None
#     for key, value in kwargs.items():
#         if hasattr(user, key):
#             setattr(user, key, value)
#
#     session.add(user)
#     await session.commit()
#     await session.refresh(user)
#     return user
#
#
# async def delete_utilisateur(session: SessionDep, user_id):
#     user = session.get(User, user_id)
#     if not user:
#         return False
#
#     session.delete(user)
#     await session.commit()
#     return True
