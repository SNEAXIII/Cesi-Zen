import pytest
from passlib.context import CryptContext

from src.services.PasswordService import PasswordService
from src.security.secrets import SECRET

PLAIN_PASSWORD = "password"
HASHED_PASSWORD = "hash"


def get_verify_mock(mocker):
    return mocker.patch.object(CryptContext, "verify")


def get_hash_mock(mocker):
    return mocker.patch.object(CryptContext, "hash")


@pytest.mark.asyncio
async def test_good_password_verify(mocker):
    # Arrange
    mock_verify = get_verify_mock(mocker)
    mock_verify.return_value = True

    # Act
    result = await PasswordService.verify_password(PLAIN_PASSWORD, HASHED_PASSWORD)

    # Assert
    mock_verify.assert_called_once_with(PLAIN_PASSWORD, HASHED_PASSWORD)
    assert result is mock_verify.return_value


@pytest.mark.asyncio
async def test_wrong_password_verify(mocker):
    # Arrange
    mock_verify = get_verify_mock(mocker)
    mock_verify.return_value = False

    # Act
    result = await PasswordService.verify_password(PLAIN_PASSWORD, HASHED_PASSWORD)

    # Assert
    mock_verify.assert_called_once_with(PLAIN_PASSWORD, HASHED_PASSWORD)
    assert result is mock_verify.return_value


@pytest.mark.asyncio
async def test_password_hash(mocker):
    # Arrange
    mock_hash = get_hash_mock(mocker)
    mock_hash.return_value = HASHED_PASSWORD

    # Act
    result = await PasswordService.get_string_hash(PLAIN_PASSWORD)

    # Assert
    mock_hash.assert_called_once_with(PLAIN_PASSWORD, rounds=SECRET.BCRYPT_HASH_ROUND)
    assert result is mock_hash.return_value
