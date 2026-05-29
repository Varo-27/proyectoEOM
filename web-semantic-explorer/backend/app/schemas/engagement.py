from datetime import datetime

from pydantic import BaseModel, Field


class ArticleCommentPublic(BaseModel):
    id: int
    content: str
    author_name: str
    created_at: datetime
    is_own: bool = False


class ArticleDetailPublic(BaseModel):
    id: int
    title: str | None
    url: str
    excerpt: str | None
    image_url: str | None
    date: datetime | None
    paywalled: bool
    authors: list[str]
    categories: list[str]
    places: list[str]
    comments: list[ArticleCommentPublic]
    average_rating: float | None
    ratings_count: int
    user_rating: int | None = None
    is_favorited: bool = False


class FavoriteStatusPublic(BaseModel):
    article_id: int
    is_favorited: bool


class RatingUpsert(BaseModel):
    value: int = Field(ge=1, le=5)


class RatingSummaryPublic(BaseModel):
    article_id: int
    average_rating: float | None
    ratings_count: int
    user_rating: int | None = None


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class CommentUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=4000)


class CommentPublic(BaseModel):
    id: int
    article_id: int
    content: str
    author_name: str
    created_at: datetime
    updated_at: datetime | None = None
    is_own: bool = False
