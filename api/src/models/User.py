import uuid
from datetime import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlmodel import Relationship, Field, SQLModel

from src.enums.Roles import Roles

if TYPE_CHECKING:
    from src.models.LoginLog import LoginLog
    from src.models.Category import Category
    from src.models.Content import Content
    from src.models.ExerciseLog import ExerciseLog


class User(SQLModel, table=True):
    __tablename__ = "user"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    login: str = Field(unique=True)
    email: str = Field(unique=True)
    hashed_password: str
    disabled_at: Optional[datetime] = Field(default=None)
    deleted_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    last_login_date: Optional[datetime] = Field(default=None)
    role: Roles = Field(default=Roles.USER)

    # Relations
    contents: List["Content"] = Relationship(back_populates="user")
    connexions: List["LoginLog"] = Relationship(back_populates="user")
    exercises: List["ExerciseLog"] = Relationship(back_populates="user")

    def set_last_login_date(self, date: Optional[datetime] = None):
        if date is None:
            date = datetime.now()
        self.last_login_date = date
