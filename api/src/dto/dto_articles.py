from pydantic import BaseModel


class CreateArticle(BaseModel):
    title: str
    content: str
    category: int
