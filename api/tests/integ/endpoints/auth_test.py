import re
from datetime import datetime, timezone, timedelta

import pytest

from src.Messages.validators_messages import VALIDATION_ERROR
from src.dto.dto_token import LoginResponse
from src.models import Article, Category, User, LoginLog, ExerciseCoherenceCardiac  # noqa: F401
from main import app
from src.security.secrets import SECRET
from src.services.JWTService import JWTService
from src.utils.db import get_session
from tests.integ.endpoints.setup.user_setup import push_one_user
from tests.utils.utils_constant import PLAIN_PASSWORD, USER_LOGIN
from tests.utils.utils_db import get_test_session, reset_test_db
from tests.utils.utils_client import get_test_client
from tests.utils.utils_random import is_valid_uuid

app.dependency_overrides[get_session] = get_test_session

# --- Constants ---
REGEX_BEARER = re.compile(r"(eyJ[\da-zA-Z]+\.){2}[\w-]+")
TOKEN_TYPE = "bearer"
ERROR_KEY = "errors"
PAYLOAD_KEY = "payload"
MISSING_TYPE = "missing"
MISSING_MESSAGE = "Field required"
USERNAME_KEY = "username"
PASSWORD_KEY = "password"


# --- Utility functions ---
def get_field_error(field: str, message: str, type: str) -> dict:
    return {field: {"message": message, "type": type}}


def get_field_missing_error(field: str) -> dict:
    return get_field_error(field, MISSING_MESSAGE, MISSING_TYPE)


def login_bad_params(
    contains_username: bool = True, contains_password: bool = True
) -> dict:
    payload = {}
    expected_errors = {"message": VALIDATION_ERROR, ERROR_KEY: {}}
    fields = {"username": contains_username, "password": contains_password}
    for field, present in fields.items():
        if present:
            payload[field] = ""
        else:
            new_error = get_field_missing_error(field)
            expected_errors[ERROR_KEY].update(new_error)
    return {PAYLOAD_KEY: payload, ERROR_KEY: expected_errors}


# --- Test cases ---
params_login_bad_request = {
    "missing_password": login_bad_params(contains_username=False),
    "missing_password_params": login_bad_params(contains_password=False),
    "missing_everything_params": login_bad_params(
        contains_username=False, contains_password=False
    ),
}


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "values",
    params_login_bad_request.values(),
    ids=[f"case_{k}" for k in params_login_bad_request.keys()],
)
async def test_login_bad_request(values: dict):
    # Arrange
    reset_test_db()
    route = "/auth/login"

    # Act
    async with get_test_client() as client:
        response = await client.post(
            route,
            data=values[PAYLOAD_KEY],
        )

    # Assert
    assert response.status_code == 400
    assert response.json() == values[ERROR_KEY]


@pytest.mark.asyncio
async def test_login_authorize():
    # Arrange
    reset_test_db()
    await push_one_user()
    payload = {USERNAME_KEY: USER_LOGIN, PASSWORD_KEY: PLAIN_PASSWORD}
    route = "/auth/login"

    # Act
    async with get_test_client() as client:
        response = await client.post(
            route,
            data=payload,
        )

    # Assert
    ## Status code
    assert response.status_code == 200
    ## Check body
    body = LoginResponse.model_validate(response.json())
    assert body.token_type == TOKEN_TYPE
    token = body.access_token
    assert REGEX_BEARER.match(token), f"The token format is not valid: {token}"
    ### Check jtw payload
    jwt_payload = JWTService.decode_jwt(token)
    #### Check expiration date
    expiration_td = timedelta(minutes=SECRET.ACCESS_TOKEN_EXPIRE_MINUTES)
    created_at = datetime.now(tz=timezone.utc).replace(microsecond=0)
    expected_time = (created_at + expiration_td).timestamp()
    assert jwt_payload["exp"] == expected_time
    #### Check content
    print(jwt_payload)
    assert is_valid_uuid(jwt_payload["user_id"])
    assert jwt_payload["sub"] == USER_LOGIN
    assert jwt_payload[]
    # TODO FINISH here