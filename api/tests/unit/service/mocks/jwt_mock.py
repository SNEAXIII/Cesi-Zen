import jwt
from typing import Optional
from src.services.JWTService import JWTService


def decode_module_mock(mocker, return_value: Optional[dict[str, str]]):
    return mocker.patch.object(
        jwt,
        "decode",
        return_value=return_value,
    )


def decode_service_mock(mocker, return_value: Optional[dict[str, str]]):
    return mocker.patch.object(
        JWTService,
        "decode_jwt",
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
