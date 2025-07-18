from datetime import datetime
from typing import Optional

from src.enums.Roles import Roles
from src.models import Article, Category, User, LoginLog, ExerciseCoherenceCardiac  # noqa: F401
from tests.utils.utils_db import load_objects


from tests.utils.utils_constant import (
    HASHED_PASSWORD,
    USER_LOGIN,
    USER_EMAIL,
    ADMIN_LOGIN,
    ADMIN_EMAIL,
)


def get_generic_user(
    login: Optional[str] = None,
    email: Optional[str] = None,
    role: Optional[Roles] = None,
    disabled_at: Optional[datetime] = None,
    deleted_at: Optional[datetime] = None,
) -> User:
    return User(
        login=login or USER_LOGIN,
        email=email or USER_EMAIL,
        hashed_password=HASHED_PASSWORD,
        role=role or Roles.USER,
        disabled_at=disabled_at,
        deleted_at=deleted_at,
    )


def get_user(
    disabled_at: Optional[datetime] = None,
    deleted_at: Optional[datetime] = None,
) -> User:
    return get_generic_user(disabled_at=disabled_at, deleted_at=deleted_at)


def get_admin(
    disabled_at: Optional[datetime] = None,
    deleted_at: Optional[datetime] = None,
) -> User:
    return get_generic_user(
        login=ADMIN_LOGIN,
        email=ADMIN_EMAIL,
        role=Roles.ADMIN,
        disabled_at=disabled_at,
        deleted_at=deleted_at,
    )


async def do_nothing():
    return


async def push_one_user():
    await load_objects([get_user()])


async def push_one_admin():
    await load_objects([get_admin()])
