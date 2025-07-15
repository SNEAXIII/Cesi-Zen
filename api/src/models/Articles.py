import uuid
from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Column
from sqlalchemy.types import Text

if TYPE_CHECKING:
    from src.models.User import User
    from src.models.Category import Category

# TODO fix typo in name...
class Article(SQLModel, table=True):
    __tablename__ = "article"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    content: str = Field(sa_column=Column(Text,nullable=False))
    created_at: datetime = Field(default_factory=datetime.now)
    id_user: uuid.UUID = Field(foreign_key="user.id")
    id_category: int = Field(foreign_key="category.id")

    # Relations
    user: "User" = Relationship(back_populates="articles")
    category: "Category" = Relationship(back_populates="articles")
