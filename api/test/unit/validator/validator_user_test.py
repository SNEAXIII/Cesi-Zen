import pytest
from email_validator import EmailSyntaxError
from fastapi.exceptions import RequestValidationError

from src.Exceptions.user_exceptions import (
    PASSWORD_WRONG_SIZE,
    PASSWORD_NEED_SPECIAL,
    PASSWORD_NEED_DIGIT,
    PASSWORD_NEED_UPPER,
    PASSWORD_NEED_LOWER,
    NOT_STR,
    EMAIL_INVALID,
    LOGIN_WRONG_SIZE,
    LOGIN_NON_ALPHANUM,
)
from src.Exceptions.validators_exception import PASSWORD_UNEQUAL_ERROR
from src.validators.user_validator import (
    password_validator,
    MAX_PASSWORD_LENGHT,
    MIN_PASSWORD_LENGHT,
    SPECIAL_CHARS,
    verify_password_match,
    correct_email_validator,
    login_validator,
    MIN_LOGIN_LENGHT,
    MAX_LOGIN_LENGHT,
)

LOGIN = "Login"
EMAIL = "Email"
PASSWORD = "Password"
WRONG_PASSWORD = "Wrong Password"

# For passwords tests
password_wrong_size = PASSWORD_WRONG_SIZE % (MIN_PASSWORD_LENGHT, MAX_PASSWORD_LENGHT)
password_need_special = PASSWORD_NEED_SPECIAL % SPECIAL_CHARS

all_password_error = (
    password_wrong_size,
    PASSWORD_NEED_DIGIT,
    PASSWORD_NEED_UPPER,
    PASSWORD_NEED_LOWER,
    password_need_special,
)

# For login tests
login_wrong_size = LOGIN_WRONG_SIZE % (MIN_LOGIN_LENGHT, MAX_LOGIN_LENGHT)


def compare_digest_mock(mocker, return_value: bool):
    return mocker.patch("hmac.compare_digest", return_value=return_value)


def validate_email_mock(mocker):
    return mocker.patch("email_validator.validate_email")


def test_password_validator_success():
    # Arrange
    password = "Complex1A!"

    # Act
    result = password_validator(password)

    # Assert
    assert password is result


@pytest.mark.parametrize(
    "password, expected_errors",
    [
        (1, [NOT_STR]),
        ("Secure1!", [password_wrong_size]),
        ("Se1!" * MAX_PASSWORD_LENGHT, [password_wrong_size]),
        ("Securized!", [PASSWORD_NEED_DIGIT]),
        ("securized1!", [PASSWORD_NEED_UPPER]),
        ("SECURIZED1!", [PASSWORD_NEED_LOWER]),
        ("Securized1", [password_need_special]),
        (" ", all_password_error),
    ],
    ids=[
        "password_not_str",
        "password_wrong_too_short",
        "password_wrong_too_long",
        "password_need_digit",
        "password_need_upper",
        "password_need_lower",
        "password_need_special",
        "all_errors",
    ],
)
def test_password_validator_wrong(password, expected_errors: list[str]):
    # Act
    with pytest.raises(ValueError) as error:
        password_validator(password)

    # Assert
    for possible_error in all_password_error:
        if possible_error in expected_errors:
            assert possible_error in str(error.value), (
                f"`{possible_error}` should NOT be in `{error.value}`"
            )
        else:
            assert possible_error not in str(error.value), (
                f"`{possible_error}` should be in `{error.value}`"
            )


def test_verify_password_match_success(mocker):
    # Arrange
    mock_compare_digest = compare_digest_mock(mocker, True)
    values = {"password": PASSWORD, "confirm_password": PASSWORD}

    # Act
    result = verify_password_match(values)

    # Assert
    assert values is result
    mock_compare_digest.assert_called_once_with(PASSWORD, PASSWORD)


def test_verify_password_match_error(mocker):
    # Arrange
    mock_compare_digest = compare_digest_mock(mocker, False)
    values = {"password": PASSWORD, "confirm_password": WRONG_PASSWORD}

    # Act
    with pytest.raises(RequestValidationError) as error:
        verify_password_match(values)

    # Assert
    assert error.value.errors() == [PASSWORD_UNEQUAL_ERROR]
    mock_compare_digest.assert_called_once_with(PASSWORD, WRONG_PASSWORD)


def test_email_validator_success(mocker):
    # Arrange
    mock_validate_email = validate_email_mock(mocker)
    mock_validate_email.return_value = True

    # Act
    result = correct_email_validator(EMAIL)

    # Assert
    assert result is EMAIL
    mock_validate_email.assert_called_once_with(EMAIL)


def test_email_validator_error_email_not_str(mocker):
    # Arrange
    wrong_email = 123
    mock_validate_email = validate_email_mock(mocker)

    # Act
    with pytest.raises(ValueError) as error:
        correct_email_validator(wrong_email)

    # Assert
    assert error.value.args[0] == NOT_STR
    mock_validate_email.assert_not_called()


def test_email_validator_error_wrong_email(mocker):
    # Arrange
    mock_validate_email = validate_email_mock(mocker)
    mock_validate_email.side_effect = EmailSyntaxError()

    # Act
    with pytest.raises(EmailSyntaxError) as error:
        correct_email_validator(EMAIL)

    # Assert
    assert error.value.args[0] == EMAIL_INVALID
    mock_validate_email.assert_called_once_with(EMAIL)


def test_login_validator_success():
    # Act
    result = login_validator(LOGIN)

    # Assert
    assert result is LOGIN


@pytest.mark.parametrize(
    "login, error_message",
    [
        (1, NOT_STR),
        ("Lo", login_wrong_size),
        ("L" * (MAX_LOGIN_LENGHT + 1), login_wrong_size),
        (f"{LOGIN}!!{LOGIN}", LOGIN_NON_ALPHANUM),
    ],
    ids=[
        "login_not_str",
        "password_wrong_too_short",
        "password_wrong_too_long",
        "password_non_alphanum",
    ],
)
def test_login_validator_error(login, error_message):
    # Act
    with pytest.raises(ValueError) as error:
        login_validator(login)

    # Assert
    assert error.value.args[0] == error_message
