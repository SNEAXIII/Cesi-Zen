from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from src.models.Articles import Article


class Category(SQLModel, table=True):
    __tablename__ = "category"

    id: Optional[int] = Field(default=None, primary_key=True)
    label: str = Field(max_length=100, nullable=False, index=True)

    # Relations
    articles: List["Article"] = Relationship(back_populates="category")
