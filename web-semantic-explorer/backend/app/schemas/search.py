from typing import List
from datetime import datetime
from pydantic import BaseModel

from app.schemas.filters import ArticleMetadataFilters

class ArticleSearchResult(BaseModel):
    id: int
    title: str | None
    url: str
    excerpt: str | None
    image_url: str | None
    date: datetime | None
    paywalled: bool
    similarity: float
    authors: list[str] | None = None

class SearchResponse(BaseModel):
    query: str
    results: List[ArticleSearchResult]


__all__ = [
    "ArticleMetadataFilters",
    "ArticleSearchResult",
    "SearchResponse",
]
