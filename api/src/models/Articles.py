import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.User import User
    from src.models.Category import Category


class Article(SQLModel, table=True):
    __tablename__ = "article"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content:str
    created_at: datetime = Field(default_factory=datetime.now)
    id_user: uuid.UUID = Field(foreign_key="user.id")
    id_category: int = Field(foreign_key="category.id")

    # Relations
    user: "User" = Relationship(back_populates="articles")
    category: "Category" = Relationship(back_populates="articles")
