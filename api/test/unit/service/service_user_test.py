import uuid
from datetime import datetime
from unittest.mock import AsyncMock

import pytest
from fastapi.exceptions import RequestValidationError
from freezegun import freeze_time

from src.Messages.jwt_messages import JwtCredentialsError, CREDENTIALS_EXCEPTION
from src.dto.dto_utilisateurs import CreateUser, UserAdminViewSingleUser
from src.enums.Roles import Roles
from src.Messages.user_messages import (
    TARGET_USER_DOESNT_EXISTS,
    TARGET_USER_IS_ADMIN,
    TARGET_USER_IS_ALREADY_DELETED,
    TARGET_USER_IS_ALREADY_DISABLED,
    TARGET_USER_IS_ALREADY_ENABLED,
    TARGET_USER_IS_DELETED,
    USER_DOESNT_EXISTS,
    USER_IS_DELETED,
    USER_IS_DISABLED,
    UserAdminError,
    UserLoginError,
)
from src.Messages.validators_messages import (
    EMAIL_ALREADY_EXISTS_ERROR,
    LOGIN_ALREADY_EXISTS_ERROR,
)
from src.models import User
from src.services.PasswordService import PasswordService
from src.services.UserService import UserService

ID: uuid.UUID = uuid.UUID("3fa85f64-5717-4562-b3fc-2c963f66afa6")
PLAIN_PASSWORD = "password"
HASHED_PASSWORD = "hash"
LOGIN = "User"
EMAIL = "user@gmail.com"
PASSWORD = "ComplexPassword1!"
ROLE = None
STATUS = None
PAGE = 1
SIZE = 10


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


def get_user_by_email_mock(mocker, return_value: bool):
    return mocker.patch.object(
        UserService,
        "get_user_by_email",
        return_value=return_value,
    )


def get_user_by_login_mock(mocker, return_value: bool | User):
    return mocker.patch.object(
        UserService,
        "get_user_by_login",
        return_value=return_value,
    )


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
async def test_get_users_paginated(mocker):
    # Arrange
    mock_exec_result = AsyncMock(return_value=None)
    mock_session = session_mock(mocker)
    mock_session.exec.return_value = mock_exec_result

    # Act
    await UserService.get_users_paginated(mock_session, PAGE, SIZE, STATUS, ROLE)

    # Assert
    mock_session.exec.assert_called_once()
    mock_exec_result.all.assert_called_once_with()


@pytest.mark.asyncio
async def test_get_total_users(mocker):
    # Arrange
    mock_exec_result = AsyncMock(return_value=None)
    mock_session = session_mock(mocker)
    mock_session.exec.return_value = mock_exec_result

    # Act
    await UserService.get_total_users(mock_session, STATUS, ROLE)

    # Assert
    mock_session.exec.assert_called_once()
    mock_exec_result.one.assert_called_once_with()


@pytest.mark.asyncio
async def test_get_users_with_pagination(mocker):
    # Arrange
    total_user_result = 45
    user_list_for_mock = [
        User(id=ID, login=LOGIN, email=EMAIL, hashed_password=HASHED_PASSWORD)
        for _ in range(10)
    ]
    expected_list_result = [
        UserAdminViewSingleUser.model_validate(user.model_dump())
        for user in user_list_for_mock
    ]
    mock_exec_result = AsyncMock(return_value=None)
    mock_session = session_mock(mocker)
    mock_session.exec.return_value = mock_exec_result
    mock_get_users_paginated = get_users_paginated_mock(mocker, user_list_for_mock)
    mock_get_total_users = get_total_users_mock(mocker, return_value=total_user_result)
    # Act
    result = await UserService.get_users_with_pagination(mock_session, PAGE, SIZE)

    # Assert
    assert result.users == expected_list_result
    assert result.total_users == total_user_result
    assert result.total_pages == 5
    assert result.current_page == PAGE
    mock_get_total_users.assert_called_once_with(mock_session, STATUS, ROLE)
    mock_get_users_paginated.assert_called_once_with(
        mock_session, PAGE, SIZE, STATUS, ROLE
    )


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
    fake_user = User(login=LOGIN)
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
        (User(login=LOGIN, deleted_at=datetime.now()), USER_IS_DELETED),
        (User(login=LOGIN, disabled_at=True), USER_IS_DISABLED),
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
    with pytest.raises(UserLoginError) as error:
        await UserService.get_user_by_login_with_validity_check(mock_session, LOGIN)

    # Assert
    assert error.value.detail == str(expected_error)
    mock_user_by_login.assert_called_once_with(mock_session, LOGIN)


@freeze_time(datetime.now())
@pytest.mark.asyncio
async def test_patch_disable_user_success(mocker):
    # Arrange
    fake_user = User(login=LOGIN)
    mock_session = session_mock(mocker)
    mock_get_user = get_user_mock(mocker, fake_user)

    # Act
    result = await UserService.admin_patch_disable_user(mock_session, ID)

    # Assert
    assert result is True
    assert fake_user.disabled_at == datetime.now()
    mock_get_user.assert_called_once_with(mock_session, ID)
    mock_session.commit.assert_called_once_with()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "fake_user,expected_error",
    [
        (None, TARGET_USER_DOESNT_EXISTS),
        (User(login=LOGIN, deleted_at=datetime.now()), TARGET_USER_IS_DELETED),
        (User(login=LOGIN, role=Roles.ADMIN), TARGET_USER_IS_ADMIN),
        (User(login=LOGIN, disabled_at=True), TARGET_USER_IS_ALREADY_DISABLED),
    ],
    ids=["user_doesnt_exists", "user_is_deleted", "user_is_admin", "user_is_disabled"],
)
async def test_patch_disable_user_error(mocker, fake_user, expected_error):
    # Arrange
    mock_session = session_mock(mocker)
    mock_get_user = get_user_mock(mocker, fake_user)

    # Act
    with pytest.raises(UserAdminError) as error:
        await UserService.admin_patch_disable_user(mock_session, ID)

    # Assert
    assert error.value.detail == str(expected_error)
    mock_get_user.assert_called_once_with(mock_session, ID)
    mock_session.commit.assert_not_called()


@freeze_time(datetime.now())
@pytest.mark.asyncio
async def test_self_delete_success(mocker):
    # Arrange
    current_time = datetime.now()
    current_user = User(
        id=ID, login=LOGIN, email=EMAIL, hashed_password=HASHED_PASSWORD
    )
    mock_session = session_mock(mocker)
    mock_verify = verify_password_mock(mocker,True)

    # Act
    result = await UserService.self_delete(mock_session, current_user,PASSWORD)

    # Assert
    assert result is True
    assert current_user.deleted_at == current_time
    mock_verify.assert_called_once_with(PASSWORD,HASHED_PASSWORD)
    mock_session.commit.assert_called_once()

@pytest.mark.asyncio
async def test_self_delete_wrong_credentials(mocker):
    # Arrange
    deleted_at = datetime(2023, 1, 1, 12, 0, 0)
    current_user = User(
        id=ID,
        login=LOGIN,
        email=EMAIL,
        hashed_password=HASHED_PASSWORD,
        deleted_at=deleted_at,
    )
    mock_session = session_mock(mocker)
    mock_verify = verify_password_mock(mocker,False)

    # Act
    with pytest.raises(JwtCredentialsError) as error:
        await UserService.self_delete(mock_session, current_user, PASSWORD)

    # Assert
    assert error.value.detail == str(CREDENTIALS_EXCEPTION)
    assert current_user.deleted_at == deleted_at
    mock_verify.assert_called_once_with(PASSWORD,HASHED_PASSWORD)
    mock_session.commit.assert_not_called()
@pytest.mark.asyncio
async def test_self_delete_already_deleted(mocker):
    # Arrange
    deleted_at = datetime(2023, 1, 1, 12, 0, 0)
    current_user = User(
        id=ID,
        login=LOGIN,
        email=EMAIL,
        hashed_password=HASHED_PASSWORD,
        deleted_at=deleted_at,
    )
    mock_session = session_mock(mocker)
    mock_verify = verify_password_mock(mocker,True)

    # Act
    with pytest.raises(UserAdminError) as error:
        await UserService.self_delete(mock_session, current_user, PASSWORD)

    # Assert
    assert error.value.detail == str(TARGET_USER_IS_ALREADY_DELETED)
    assert current_user.deleted_at == deleted_at
    mock_verify.assert_called_once_with(PASSWORD,HASHED_PASSWORD)
    mock_session.commit.assert_not_called()


@pytest.mark.asyncio
async def test_patch_enable_user_success(mocker):
    # Arrange
    fake_user = User(login=LOGIN, disabled_at=True)
    mock_session = session_mock(mocker)
    mock_get_user = get_user_mock(mocker, fake_user)

    # Act
    result = await UserService.admin_patch_enable_user(mock_session, ID)

    # Assert
    assert result is True
    assert fake_user.disabled_at is None
    mock_get_user.assert_called_once_with(mock_session, ID)
    mock_session.commit.assert_called_once_with()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "fake_user,expected_error",
    [
        (None, TARGET_USER_DOESNT_EXISTS),
        (User(login=LOGIN, deleted_at=datetime.now()), TARGET_USER_IS_DELETED),
        (User(login=LOGIN), TARGET_USER_IS_ALREADY_ENABLED),
    ],
    ids=["user_doesnt_exists", "user_is_deleted", "user_is_disabled"],
)
async def test_patch_enable_user_error(mocker, fake_user, expected_error):
    # Arrange
    mock_session = session_mock(mocker)
    mock_get_user = get_user_mock(mocker, fake_user)

    # Act
    with pytest.raises(UserAdminError) as error:
        await UserService.admin_patch_enable_user(mock_session, ID)

    # Assert
    assert error.value.detail == str(expected_error)
    mock_get_user.assert_called_once_with(mock_session, ID)
    mock_session.commit.assert_not_called()


@freeze_time(datetime.now())
@pytest.mark.asyncio
async def test_delete_user_success(mocker):
    # Arrange
    fake_user = User(login=LOGIN)
    mock_session = session_mock(mocker)
    mock_get_user = get_user_mock(mocker, fake_user)

    # Act
    result = await UserService.admin_delete_user(mock_session, ID)

    # Assert
    assert result is True
    assert fake_user.deleted_at == datetime.now()
    mock_get_user.assert_called_once_with(mock_session, ID)
    mock_session.commit.assert_called_once_with()


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "fake_user,expected_error",
    [
        (None, TARGET_USER_DOESNT_EXISTS),
        (User(login=LOGIN, deleted_at=datetime.now()), TARGET_USER_IS_ALREADY_DELETED),
        (User(login=LOGIN, role=Roles.ADMIN), TARGET_USER_IS_ADMIN),
    ],
    ids=["user_doesnt_exists", "user_is_already_deleted", "user_is_an_admin"],
)
async def test_delete_user_error(mocker, fake_user, expected_error):
    # Arrange
    mock_session = session_mock(mocker)
    mock_get_user = get_user_mock(mocker, fake_user)

    # Act
    with pytest.raises(UserAdminError) as error:
        await UserService.admin_delete_user(mock_session, ID)

    # Assert
    assert error.value.detail == str(expected_error)
    mock_get_user.assert_called_once_with(mock_session, ID)
    mock_session.commit.assert_not_called()
