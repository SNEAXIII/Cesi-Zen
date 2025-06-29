from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.User import User
    from src.models.Category import Category


class Content(SQLModel, table=True):
    __tablename__ = "content"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    filepath: str
    id_user: str = Field(foreign_key="user.id")
    id_category: int = Field(foreign_key="category.id")

    # Relations
    user: "User" = Relationship(back_populates="contents")
    category: "Category" = Relationship(back_populates="contents")
