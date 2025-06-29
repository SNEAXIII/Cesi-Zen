from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from src.models.Content import Content


class Category(SQLModel, table=True):
    __tablename__ = "category"


    id: Optional[int] = Field(default=None, primary_key=True)
    label: str

    # Relations
    contents: List["Content"] = Relationship(back_populates="category")
