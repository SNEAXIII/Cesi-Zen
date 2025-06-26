from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
import pytest
from freezegun import freeze_time
from jwt import ExpiredSignatureError

from src.Messages.jwt_messages import (
    JwtError,
    EXPIRED_EXCEPTION,
    CANT_FIND_USER_TOKEN_EXCEPTION,
    INVALID_ROLE_EXCEPTION,
    JwtCredentialsError,
    CREDENTIALS_EXCEPTION,
)
from src.enums.Roles import Roles
from src.models import User
from src.security.secrets import SECRET
from src.services.JWTService import JWTService

ID = "UUIDV4"
LOGIN = "User"
TOKEN = "token"
HASHED_PASSWORD = "hash"
EMAIL = "user@gmail.com"


def get_user():
    return User(login=LOGIN, email=EMAIL, hashed_password=HASHED_PASSWORD)


def decode_mock(mocker, return_value: Optional[dict[str, str]]):
    return mocker.patch.object(
        jwt,
        "decode",
        return_value=return_value,
    )


def encode_mock(mocker):
    return mocker.patch.object(
        jwt,
        "encode",
    )


def create_token_mock(mocker):
    return mocker.patch.object(
        JWTService,
        "create_token",
    )


@pytest.mark.parametrize("role", Roles.__members__.values())
def test_decode_jwt_success(mocker, role):
    # Arrange
    data = {"sub": LOGIN, "role": role}
    mock_decode = decode_mock(mocker, data)

    # Act
    result = JWTService.decode_jwt(TOKEN)

    # Assert
    assert result is data
    mock_decode.assert_called_once_with(
        TOKEN, SECRET.SECRET_KEY, algorithms=[SECRET.ALGORITHM]
    )


def test_decode_jwt_token_expired(mocker):
    # Arrange
    mock_decode = decode_mock(mocker, None)
    mock_decode.side_effect = ExpiredSignatureError

    # Act
    with pytest.raises(JwtError) as error:
        JWTService.decode_jwt(TOKEN)

    # Assert
    mock_decode.assert_called_once_with(
        TOKEN, SECRET.SECRET_KEY, algorithms=[SECRET.ALGORITHM]
    )
    assert error.value.detail == str(EXPIRED_EXCEPTION)


def test_decode_jwt_token_no_user(mocker):
    # Arrange
    data = {"role": Roles.USER}
    mock_decode = decode_mock(mocker, data)

    # Act
    with pytest.raises(JwtError) as error:
        JWTService.decode_jwt(TOKEN)

    # Assert
    mock_decode.assert_called_once_with(
        TOKEN, SECRET.SECRET_KEY, algorithms=[SECRET.ALGORITHM]
    )
    assert error.value.detail == str(CANT_FIND_USER_TOKEN_EXCEPTION)


@pytest.mark.parametrize(
    "data",
    [
        {"sub": LOGIN, "role": "UnvalidRole"},
        {"sub": LOGIN},
    ],
    ids=["unvalid_role", "missing_role"],
)
def test_decode_jwt_token_wrong_role(mocker, data):
    # Arrange
    mock_decode = decode_mock(mocker, data)

    # Act
    with pytest.raises(JwtError) as error:
        JWTService.decode_jwt(TOKEN)

    # Assert
    mock_decode.assert_called_once_with(
        TOKEN, SECRET.SECRET_KEY, algorithms=[SECRET.ALGORITHM]
    )
    assert error.value.detail == str(INVALID_ROLE_EXCEPTION)


@freeze_time(datetime.now())
def test_create_access_token_success(mocker):
    # Arrange
    user = get_user()
    mock_create_token = create_token_mock(mocker)
    expected_data = {
        "user_id": str(user.id),
        "sub": user.login,
        "email": user.email,
        "role": user.role,
    }
    expected_expires_delta = timedelta(minutes=SECRET.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Act
    JWTService.create_access_token(user)

    # Assert
    mock_create_token.assert_called_once_with(
        data=expected_data,
        expires_delta=expected_expires_delta,
    )


def test_create_access_token_no_user():
    # Arrange
    user = None

    # Act
    with pytest.raises(JwtCredentialsError) as error:
        JWTService.create_access_token(user)

    # Assert
    assert error.value.detail == str(CREDENTIALS_EXCEPTION)


@freeze_time(datetime.now())
def test_create_token_success(mocker):
    # Arrange
    input_data = {"sub": LOGIN, "role": Roles.USER.value}
    mock_encode_mock = encode_mock(mocker)
    expected_expires_delta = timedelta(minutes=SECRET.ACCESS_TOKEN_EXPIRE_MINUTES)
    expected_expires_date_time = datetime.now(tz=timezone.utc) + expected_expires_delta
    expected_data = {**input_data, "exp": expected_expires_date_time}

    # Act
    JWTService.create_token(input_data, expected_expires_delta)

    # Assert
    mock_encode_mock.assert_called_once_with(
        expected_data, SECRET.SECRET_KEY, algorithm=SECRET.ALGORITHM
    )
