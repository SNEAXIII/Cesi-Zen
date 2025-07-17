from typing import Optional

from src.models import User
from src.services.UserService import UserService


def get_users_paginated_mock(mocker, return_value: list[User]):
    return mocker.patch.object(
        UserService,
        "get_users_paginated",
        return_value=return_value,
    )


def get_total_users_mock(mocker, return_value: int):
    return mocker.patch.object(
        UserService,
        "get_total_users",
        return_value=return_value,
    )


def get_user_mock(mocker, return_value: User):
    return mocker.patch.object(
        UserService,
        "get_user",
        return_value=return_value,
    )


def get_user_with_validity_check_mock(mocker, return_value: Optional[User]):
    return mocker.patch.object(
        UserService,
        "get_user_by_login_with_validity_check",
        return_value=return_value,
    )


def get_user_by_email_mock(mocker, return_value: bool):
    return mocker.patch.object(
        UserService,
        "get_user_by_email",
        return_value=return_value,
    )


def get_user_by_login_mock(mocker, return_value: bool):
    return mocker.patch.object(
        UserService,
        "get_user_by_login",
        return_value=return_value,
    )
