import uuid
from datetime import datetime
from typing import Optional

from sqlmodel import select

from src.Messages.user_messages import (
    USER_DOESNT_EXISTS,
    USER_IS_DELETED,
    USER_IS_DISABLED,
    TARGET_USER_IS_ALREADY_DISABLED,
    TARGET_USER_DOESNT_EXISTS,
    TARGET_USER_IS_ADMIN,
    TARGET_USER_IS_ALREADY_ENABLED,
    TARGET_USER_IS_DELETED,
    TARGET_USER_IS_ALREADY_DELETED,
)
from src.Messages.validators_messages import (
    EMAIL_ALREADY_EXISTS_ERROR,
    LOGIN_ALREADY_EXISTS_ERROR,
)
from src.enums.Roles import Roles
from src.models import User
from src.dto.dto_utilisateurs import (
    CreateUser,
    UserAdminViewAllUsers,
    UserAdminViewSingleUser,
)
from src.services.PasswordService import PasswordService
from src.utils.db import SessionDep
from fastapi.exceptions import RequestValidationError
from sqlalchemy import func

DISABLED_STATUS = "disabled"
DELETED_STATUS = "deleted"
ENABLED_STATUS = "enabled"


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
    async def get_user(cls, session: SessionDep, user_id: uuid.UUID) -> Optional[User]:
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
        if user.deleted_at:
            raise USER_IS_DELETED
        if user.disabled_at:
            raise USER_IS_DISABLED
        return user

    @classmethod
    async def get_user_by_email(cls, session: SessionDep, email: str) -> Optional[User]:
        sql = select(User).where(User.email == email)
        result = await session.exec(sql)
        return result.first()

    @classmethod
    async def admin_patch_disable_user(
        cls, session: SessionDep, user_uuid: uuid.UUID
    ) -> True:
        user: Optional[User] = await UserService.get_user(session, user_uuid)
        if user is None:
            raise TARGET_USER_DOESNT_EXISTS
        if user.deleted_at:
            raise TARGET_USER_IS_DELETED
        if user.role == Roles.ADMIN:
            raise TARGET_USER_IS_ADMIN
        if user.disabled_at:
            raise TARGET_USER_IS_ALREADY_DISABLED
        user.disabled_at = datetime.now()
        await session.commit()
        return True

    @classmethod
    async def admin_patch_enable_user(
        cls, session: SessionDep, user_uuid: uuid.UUID
    ) -> True:
        user: Optional[User] = await UserService.get_user(session, user_uuid)
        if user is None:
            raise TARGET_USER_DOESNT_EXISTS
        if user.deleted_at:
            raise TARGET_USER_IS_DELETED
        if not user.disabled_at:
            raise TARGET_USER_IS_ALREADY_ENABLED
        user.disabled_at = None
        await session.commit()
        return True

    @classmethod
    async def admin_delete_user(cls, session: SessionDep, user_uuid: uuid.UUID) -> True:
        user: Optional[User] = await UserService.get_user(session, user_uuid)
        if user is None:
            raise TARGET_USER_DOESNT_EXISTS
        if user.deleted_at:
            raise TARGET_USER_IS_ALREADY_DELETED
        if user.role == Roles.ADMIN:
            raise TARGET_USER_IS_ADMIN
        user.deleted_at = datetime.now()
        await session.commit()
        return True

    @classmethod
    def build_status_filter(cls, sql, status: Optional[str]):
        if status == DELETED_STATUS:
            sql = sql.where(User.deleted_at != None)  # noqa: E711
        elif status == DISABLED_STATUS:
            sql = sql.where(User.deleted_at == None).where(User.disabled_at != None)  # noqa: E711
        elif status == ENABLED_STATUS:
            sql = sql.where(User.deleted_at == None).where(User.disabled_at == None)  # noqa: E711
        return sql

    @classmethod
    def build_role_filter(cls, sql, role: Optional[Roles] = None):
        if role in Roles.__members__.values():
            sql = sql.where(User.role == role)  # noqa: E711
        return sql

    @classmethod
    async def get_users_paginated(
        cls,
        session: SessionDep,
        page: int,
        size: int,
        status: Optional[str],
        role: Optional[Roles] = None,
    ) -> list[User]:
        offset = (page - 1) * size
        sql = select(User)
        if status:
            sql = UserService.build_status_filter(sql, status)
        if role:
            sql = UserService.build_role_filter(sql, role)
        sql = sql.offset(offset).limit(size)
        result = await session.exec(sql)
        return result.all()

    @classmethod
    async def get_total_users(
        cls, session: SessionDep, status: Optional[str], role: Optional[Roles] = None
    ) -> int:
        sql = select(func.count(User.id))
        if status:
            sql = UserService.build_status_filter(sql, status)
        if role:
            sql = UserService.build_role_filter(sql, role)
        result = await session.exec(sql)
        return result.one()

    @classmethod
    async def get_users_with_pagination(
        cls,
        session: SessionDep,
        page: int,
        size: int,
        status: Optional[str] = None,
        role: Optional[Roles] = None,
    ) -> UserAdminViewAllUsers:
        total_users = await UserService.get_total_users(session, status, role)
        users = await UserService.get_users_paginated(session, page, size, status, role)
        total_pages = (total_users + size - 1) // size
        mapped_users = [
            UserAdminViewSingleUser.model_validate(user.model_dump()) for user in users
        ]
        return UserAdminViewAllUsers(
            users=mapped_users,
            total_users=total_users,
            total_pages=total_pages,
            current_page=page,
        )


# async def update_utilisateur(session: SessionDep, user_id, **kwargs) -> Optional[User]:
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
