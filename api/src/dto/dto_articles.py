from typing import List
from pydantic import BaseModel


class CreateArticle(BaseModel):
    title: str
    content: str
    category: int


class GetArticleResponseMin(BaseModel):
    id: int
    title: str
    id_category: int
    creator: str
    category: str


class GetArticleResponseFull(GetArticleResponseMin):
    content: str


class GetAllArticleResponse(BaseModel):
    articles: List[GetArticleResponseMin]
    count: int
