from datetime import datetime
from typing import Optional

import pytest

from src.Messages.jwt_messages import JwtCredentialsError, CREDENTIALS_EXCEPTION
from src.models import User
from src.services.AuthService import AuthService
from src.services.JWTService import JWTService
from src.services.UserService import UserService
from src.services.PasswordService import PasswordService

PLAIN_PASSWORD = "password"
HASHED_PASSWORD = "hash"
LOGIN = "User"
EMAIL = "user@gmail.com"
TOKEN = "token"


def get_user_mock(mocker, return_value: Optional[User]):
    return mocker.patch.object(
        UserService,
        "get_user_by_login_with_validity_check",
        return_value=return_value,
    )


def verify_password_mock(mocker, return_value: bool):
    return mocker.patch.object(
        PasswordService,
        "verify_password",
        return_value=return_value,
    )


def decode_mock(mocker, return_value: Optional[dict[str, str]]):
    return mocker.patch.object(
        JWTService,
        "decode_jwt",
        return_value=return_value,
    )


def session_mock(mocker):
    return mocker.AsyncMock()


def get_user():
    return User(login=LOGIN, email=EMAIL, hashed_password=HASHED_PASSWORD)


@pytest.mark.asyncio
async def test_authenticate_user_success(mocker):
    # Arrange
    user = get_user()
    mock_get_user = get_user_mock(mocker, user)
    mock_verify = verify_password_mock(mocker, True)
    mock_session = session_mock(mocker)

    assert user.last_login_date is None
    current_time = datetime.now()

    # Act
    return_value = await AuthService.authenticate_user(
        mock_session, LOGIN, PLAIN_PASSWORD
    )

    # Assert
    mock_get_user.assert_called_once_with(mock_session, LOGIN)
    mock_verify.assert_called_once_with(PLAIN_PASSWORD, user.hashed_password)
    mock_session.commit.assert_called_once_with()
    assert return_value is user
    # Last login date check
    assert isinstance(user.last_login_date, datetime)
    delta = (user.last_login_date - current_time).total_seconds()
    assert 0 <= delta < 1


@pytest.mark.asyncio
async def test_authenticate_user_nonexistent(mocker):
    # Arrange
    mock_get_user = get_user_mock(mocker, None)
    mock_verify = verify_password_mock(mocker, True)
    mock_session = session_mock(mocker)

    # Act
    with pytest.raises(JwtCredentialsError) as error:
        await AuthService.authenticate_user(mock_session, LOGIN, PLAIN_PASSWORD)

    # Arrange
    assert error.value.detail == str(CREDENTIALS_EXCEPTION)
    mock_get_user.assert_called_once_with(mock_session, LOGIN)
    mock_verify.assert_not_called()
    mock_session.commit.assert_not_called()


@pytest.mark.asyncio
async def test_authenticate_user_wrong_password(mocker):
    # Arrange
    user = get_user()
    mock_get_user = get_user_mock(mocker, user)
    mock_verify = verify_password_mock(mocker, False)
    mock_session = session_mock(mocker)

    # Act
    with pytest.raises(JwtCredentialsError) as error:
        await AuthService.authenticate_user(mock_session, LOGIN, PLAIN_PASSWORD)

    # Assert
    assert error.value.detail == str(CREDENTIALS_EXCEPTION)
    mock_get_user.assert_called_once_with(mock_session, LOGIN)
    mock_verify.assert_called_once_with(PLAIN_PASSWORD, user.hashed_password)
    mock_session.commit.assert_not_called()


@pytest.mark.asyncio
async def test_get_current_user_in_jwt_success(mocker):
    # Arrange
    user = User(login=LOGIN, email=EMAIL, hashed_password=HASHED_PASSWORD)
    mock_decode = decode_mock(mocker, {"sub": LOGIN})
    mock_get_user = get_user_mock(mocker, user)
    mock_session = session_mock(mocker)

    # Act
    result = await AuthService.get_current_user_in_jwt(mock_session, TOKEN)

    # Assert
    mock_decode.assert_called_once_with(TOKEN)
    mock_get_user.assert_called_once_with(mock_session, LOGIN)
    assert result == user


@pytest.mark.asyncio
async def test_get_current_user_in_jwt_user_not_found(mocker):
    # Arrange
    mock_decode = decode_mock(mocker, {"sub": LOGIN})
    mock_get_user = get_user_mock(mocker, None)
    mock_session = session_mock(mocker)

    # Act
    result = await AuthService.get_current_user_in_jwt(mock_session, TOKEN)

    # Assert
    mock_decode.assert_called_once_with(TOKEN)
    mock_get_user.assert_called_once_with(mock_session, LOGIN)
    assert result is None
