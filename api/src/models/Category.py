from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.User import User


class Category(SQLModel, table=True):
    __tablename__ = "category"

    id: Optional[int] = Field(default=None, primary_key=True)
    label: str
    description: str
    id_user: str = Field(foreign_key="user.id")

    # Relations
    user: "User" = Relationship(back_populates="categories")
