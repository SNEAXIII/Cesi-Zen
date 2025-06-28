import uuid
from typing import Optional


from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime

from src.enums.Roles import Roles
from src.validators.user_validator import (
    login_validator,
    correct_email_validator,
    password_validator,
    verify_password_match,
)


class Password(BaseModel):
    password_validator = field_validator("password", mode="after")(password_validator)
    password: str = Field(examples=["Securepass1!"])


class Passwords(Password):
    confirm_password_validator = field_validator("confirm_password", mode="after")(
        verify_password_match
    )
    confirm_password: str = Field(examples=["Securepass1!"])

class ResetPassword(Passwords):
    old_password: str = Field(examples=["Securepass1!"])

class CreateUser(Passwords):
    login_validator = field_validator("login", mode="after")(login_validator)
    login: str = Field(examples=["User"])

    email_validator = field_validator("email", mode="before")(correct_email_validator)
    email: EmailStr = Field(examples=["user@gmail.com"])





class UserBaseResponse(BaseModel):
    login: str = Field(examples=["User"])
    email: EmailStr = Field(examples=["user@gmail.com"])
    role: Roles = Field(examples=[Roles.USER.value])


class SuccessfullyCreatedUtilisateur(UserBaseResponse):
    created_at: datetime


class UserProfile(UserBaseResponse):
    last_login_date: Optional[datetime] = Field(default=None)


class UserAdminViewSingleUser(UserBaseResponse):
    id: uuid.UUID
    created_at: datetime
    last_login_date: Optional[datetime] = Field(default=None)
    disabled_at: Optional[datetime]
    deleted_at: Optional[datetime]


class UserAdminViewAllUsers(BaseModel):
    users: list[UserAdminViewSingleUser]
    total_users: int = Field(default=1)
    total_pages: int = Field(default=1)
    current_page: int = Field(default=1)
