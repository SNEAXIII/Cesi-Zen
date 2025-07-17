from passlib.context import CryptContext
from src.services.PasswordService import PasswordService


def verify_password_mock(mocker, return_value: bool):
    return mocker.patch.object(
        PasswordService,
        "verify_password",
        return_value=return_value,
    )


def get_string_hash_mock(mocker, return_value: str):
    return mocker.patch.object(
        PasswordService,
        "get_string_hash",
        return_value=return_value,
    )


def get_verify_mock(mocker):
    return mocker.patch.object(CryptContext, "verify")


def get_hash_mock(mocker):
    return mocker.patch.object(CryptContext, "hash")
