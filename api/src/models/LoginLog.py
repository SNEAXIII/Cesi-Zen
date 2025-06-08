from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.User import User


class LoginLog(SQLModel, table=True):
    __tablename__ = "login_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    date_connexion:datetime = Field(default_factory=datetime.now)
    id_user: str = Field(foreign_key="user.id")

    # Relations
    user: "User" = Relationship(back_populates="connexions")
