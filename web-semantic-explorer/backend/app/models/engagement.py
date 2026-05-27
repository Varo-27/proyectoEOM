import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Index, Text, UniqueConstraint
from sqlmodel import Field, SQLModel


def get_datetime_utc() -> datetime:
    return datetime.now(timezone.utc)


class Favorite(SQLModel, table=True):
    __tablename__ = "favorite"
    __table_args__ = (
        UniqueConstraint("user_id", "article_id", name="uq_favorite_user_article"),
    )

    id: int | None = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    article_id: int = Field(foreign_key="article.id", index=True)
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class Rating(SQLModel, table=True):
    __tablename__ = "rating"
    __table_args__ = (
        UniqueConstraint("user_id", "article_id", name="uq_rating_user_article"),
    )

    id: int | None = Field(default=None, primary_key=True)
    user_id: uuid.UUID | None = Field(default=None, foreign_key="user.id", index=True)
    article_id: int = Field(foreign_key="article.id", index=True)
    value: int = Field(ge=1, le=5)
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class Comment(SQLModel, table=True):
    __tablename__ = "comment"

    id: int | None = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    article_id: int = Field(foreign_key="article.id", index=True)
    content: str = Field(sa_column=Column(Text))
    status: str = Field(default="active", max_length=20, index=True)
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class CommentReport(SQLModel, table=True):
    __tablename__ = "comment_report"
    __table_args__ = (
        UniqueConstraint(
            "comment_id",
            "reporter_user_id",
            name="uq_comment_reporter",
        ),
    )

    id: int | None = Field(default=None, primary_key=True)
    comment_id: int = Field(foreign_key="comment.id", index=True)
    reporter_user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    reason: str = Field(sa_column=Column(Text))
    status: str = Field(default="open", max_length=20, index=True)
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class Note(SQLModel, table=True):
    __tablename__ = "note"
    __table_args__ = (
        UniqueConstraint("user_id", "article_id", name="uq_note_user_article"),
    )

    id: int | None = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    article_id: int = Field(foreign_key="article.id", index=True)
    content: str = Field(sa_column=Column(Text))
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    updated_at: datetime | None = Field(
        default=None,
        sa_type=DateTime(timezone=True),  # type: ignore
    )


class Follow(SQLModel, table=True):
    __tablename__ = "follow"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "target_type",
            "target_id",
            name="uq_follow_user_target",
        ),
        Index("ix_follow_target", "target_type", "target_id"),
    )

    id: int | None = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    target_type: str = Field(max_length=20, index=True)
    target_id: int = Field(index=True)
    created_at: datetime = Field(
        default_factory=get_datetime_utc,
        sa_type=DateTime(timezone=True),  # type: ignore
    )
