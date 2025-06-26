import hmac

import email_validator
from email_validator import EmailSyntaxError
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationInfo
from src.Messages.user_messages import (
    EMAIL_INVALID,
    LOGIN_NON_ALPHANUM,
    LOGIN_WRONG_SIZE,
    NOT_STR,
    PASSWORD_NEED_DIGIT,
    PASSWORD_NEED_LOWER,
    PASSWORD_NEED_SPECIAL,
    PASSWORD_NEED_UPPER,
    PASSWORD_WRONG_SIZE,
)
from src.Messages.validators_messages import PASSWORD_UNEQUAL_ERROR

SPECIAL_CHARS = "$@#%!^&*-_+="
MIN_LOGIN_LENGHT = 4
MAX_LOGIN_LENGHT = 15
MIN_PASSWORD_LENGHT = 10
MAX_PASSWORD_LENGHT = 50


def login_validator(login: str) -> str:
    if not isinstance(login, str):
        raise ValueError(NOT_STR)
    login = login.strip()
    if not MIN_LOGIN_LENGHT <= len(login) <= MAX_LOGIN_LENGHT:
        raise ValueError(LOGIN_WRONG_SIZE % (MIN_LOGIN_LENGHT, MAX_LOGIN_LENGHT))
    if not login.isalnum():
        raise ValueError(LOGIN_NON_ALPHANUM)
    return login


def correct_email_validator(email: str) -> str:
    if not isinstance(email, str):
        raise ValueError(NOT_STR)
    email = email.strip()
    try:
        email_validator.validate_email(email)
    except EmailSyntaxError:
        raise EmailSyntaxError(EMAIL_INVALID)
    return email


def password_validator(password: str) -> str:
    if not isinstance(password, str):
        raise ValueError(NOT_STR)
    errors = []
    if not MIN_PASSWORD_LENGHT <= len(password) <= MAX_PASSWORD_LENGHT:
        errors.append(PASSWORD_WRONG_SIZE % (MIN_PASSWORD_LENGHT, MAX_PASSWORD_LENGHT))
    if not any(char.isdigit() for char in password):
        errors.append(PASSWORD_NEED_DIGIT)
    if not any(char.isupper() for char in password):
        errors.append(PASSWORD_NEED_UPPER)
    if not any(char.islower() for char in password):
        errors.append(PASSWORD_NEED_LOWER)
    if not any(char in SPECIAL_CHARS for char in password):
        errors.append(PASSWORD_NEED_SPECIAL % SPECIAL_CHARS)
    if errors:
        str_error = ", ".join(errors)
        raise ValueError(f"Le mot de passe doit : {str_error}")
    return password


def verify_password_match(value: str, info: ValidationInfo) -> str:
    if "password" in info.data and not hmac.compare_digest(
        info.data["password"], value
    ):
        raise RequestValidationError(errors=[PASSWORD_UNEQUAL_ERROR])
    return value
