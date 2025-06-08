from unittest.mock import AsyncMock

import pytest
from fastapi.exceptions import RequestValidationError

from src.Exceptions.user_exceptions import (
    USER_DOESNT_EXISTS,
    USER_IS_DELETED,
    USER_IS_DISABLED,
    UserError,
)
from src.Exceptions.validators_exception import (
    EMAIL_ALREADY_EXISTS_ERROR,
    LOGIN_ALREADY_EXISTS_ERROR,
)
from src.dto.dto_utilisateurs import CreateUser
from src.models import User
from src.services.UserService import UserService
from src.services.PasswordService import PasswordService

ID = "id"
PLAIN_PASSWORD = "password"
HASHED_PASSWORD = "hash"
LOGIN = "User"
EMAIL = "user@gmail.com"
TOKEN = "token"
PASSWORD = "ComplexPassword1!"


class FakeUser:
    def __init__(self, login: str, deleted: bool, disabled: bool):
        self.login = login
        self.deleted = deleted
        self.disabled = disabled


def get_user_by_email_mock(mocker, return_value: bool):
    return mocker.patch.object(
        UserService,
        "get_user_by_email",
        return_value=return_value,
    )


def get_user_by_login_mock(mocker, return_value: bool | FakeUser):
    return mocker.patch.object(
        UserService,
        "get_user_by_login",
        return_value=return_value,
    )


def get_string_hash_mock(mocker, return_value: str):
    return mocker.patch.object(
        PasswordService,
        "get_string_hash",
        return_value=return_value,
    )


def session_mock(mocker):
    return mocker.AsyncMock()


def get_create_user():
    return CreateUser(
        login=LOGIN, email=EMAIL, password=PASSWORD, confirm_password=PASSWORD
    )


@pytest.mark.asyncio
async def test_create_user_register_user_success(mocker):
    # Arrange
    create_user = get_create_user()
    mock_get_user_email = get_user_by_email_mock(mocker, False)
    mock_get_user_login = get_user_by_login_mock(mocker, False)
    mock_get_string_hash = get_string_hash_mock(mocker, HASHED_PASSWORD)
    mock_session = session_mock(mocker)
    expected_result = User(**create_user.model_dump(), hashed_password=HASHED_PASSWORD)

    # Act
    return_value = await UserService.create_user_register(mock_session, create_user)

    # Ignore certain values
    expected_result.id = None
    return_value.id = None
    expected_result.created_at = None
    return_value.created_at = None

    # Assert
    assert return_value == expected_result
    mock_get_user_email.assert_called_once_with(mock_session, create_user.email)
    mock_get_user_login.assert_called_once_with(mock_session, create_user.login)
    mock_get_string_hash.assert_called_once_with(PASSWORD)
    mock_session.add.assert_called_once_with(return_value)
    mock_session.commit.assert_called_once_with()
    mock_session.refresh.assert_called_once_with(return_value)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "is_find_by_email,is_find_by_login,expected_error",
    [
        (True, False, [EMAIL_ALREADY_EXISTS_ERROR]),
        (False, True, [LOGIN_ALREADY_EXISTS_ERROR]),
        (True, True, [EMAIL_ALREADY_EXISTS_ERROR, LOGIN_ALREADY_EXISTS_ERROR]),
    ],
    ids=["email", "login", "email_login"],
)
async def test_create_user_register_user_found_by_error(
    mocker,
    is_find_by_email,
    is_find_by_login,
    expected_error,
):
    # Arrange
    create_user = get_create_user()
    mock_get_user_email = get_user_by_email_mock(mocker, is_find_by_email)
    mock_get_user_login = get_user_by_login_mock(mocker, is_find_by_login)
    mock_session = session_mock(mocker)

    # Act
    with pytest.raises(RequestValidationError) as error:
        await UserService.create_user_register(mock_session, create_user)

    # Assert
    assert error.value.errors() == expected_error
    mock_get_user_email.assert_called_once_with(mock_session, create_user.email)
    mock_get_user_login.assert_called_once_with(mock_session, create_user.login)


@pytest.mark.asyncio
async def test_get_user(mocker):
    # Arrange
    mock_session = session_mock(mocker)

    # Act
    await UserService.get_user(mock_session, ID)

    # Assert
    mock_session.get.assert_called_once_with(User, ID)


@pytest.mark.asyncio
async def test_get_user_by_login(mocker):
    # Arrange
    mock_exec_result = AsyncMock(return_value=None)
    mock_session = session_mock(mocker)
    mock_session.exec.return_value = mock_exec_result

    # Act
    await UserService.get_user_by_login(mock_session, LOGIN)

    # Assert
    mock_session.exec.assert_called_once()
    mock_exec_result.first.assert_called_once_with()


@pytest.mark.asyncio
async def test_get_user_by_email(mocker):
    # Arrange
    mock_exec_result = AsyncMock(return_value=None)
    mock_session = session_mock(mocker)
    mock_session.exec.return_value = mock_exec_result

    # Act
    await UserService.get_user_by_email(mock_session, EMAIL)

    # Assert
    mock_session.exec.assert_called_once()
    mock_exec_result.first.assert_called_once_with()


@pytest.mark.asyncio
async def test_get_user_by_login_with_validity_check_success(mocker):
    # Arrange
    fake_user = FakeUser(login=LOGIN, deleted=False, disabled=False)
    mock_session = session_mock(mocker)
    mock_user_by_login = get_user_by_login_mock(mocker, fake_user)

    # Act
    result = await UserService.get_user_by_login_with_validity_check(
        mock_session, LOGIN
    )

    # Assert
    assert fake_user == result
    mock_user_by_login.assert_called_once_with(mock_session, LOGIN)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "fake_user,expected_error",
    [
        (None, USER_DOESNT_EXISTS),
        (FakeUser(login=LOGIN, deleted=True, disabled=False), USER_IS_DELETED),
        (FakeUser(login=LOGIN, deleted=False, disabled=True), USER_IS_DISABLED),
    ],
    ids=["user_doesnt_exists", "deleted", "disabled"],
)
async def test_get_user_by_login_with_validity_check_error(
    mocker, fake_user, expected_error
):
    # Arrange
    mock_session = session_mock(mocker)
    mock_user_by_login = get_user_by_login_mock(mocker, fake_user)

    # Act
    with pytest.raises(UserError) as error:
        await UserService.get_user_by_login_with_validity_check(mock_session, LOGIN)

    # Assert
    assert error.value.detail == str(expected_error)
    mock_user_by_login.assert_called_once_with(mock_session, LOGIN)
