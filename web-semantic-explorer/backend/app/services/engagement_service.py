from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlmodel import Session, func, select

from app.models.article import Article
from app.models.engagement import Comment, Favorite, Rating, get_datetime_utc
from app.models.relations import ArticleAuthor, ArticleCategory, ArticlePlace
from app.models.taxonomy import Author, Category, Place
from app.models.user import User
from app.schemas.engagement import (
    ArticleCommentPublic,
    ArticleDetailPublic,
    CommentPublic,
    FavoriteStatusPublic,
    RatingSummaryPublic,
)


def _author_display_name(user: User) -> str:
    if user.full_name and user.full_name.strip():
        return user.full_name.strip()
    return user.email.split("@")[0]


def _ensure_article(session: Session, article_id: int) -> Article:
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return article


def get_rating_summary(
    session: Session, article_id: int, user: User | None = None
) -> RatingSummaryPublic:
    _ensure_article(session, article_id)

    avg_row = session.exec(
        select(func.avg(Rating.value), func.count(Rating.id)).where(
            Rating.article_id == article_id
        )
    ).one()

    average_raw, count = avg_row
    average_rating = round(float(average_raw), 1) if average_raw is not None else None

    user_rating: int | None = None
    if user:
        user_row = session.exec(
            select(Rating.value)
            .where(Rating.article_id == article_id)
            .where(Rating.user_id == user.id)
        ).first()
        user_rating = int(user_row) if user_row is not None else None

    return RatingSummaryPublic(
        article_id=article_id,
        average_rating=average_rating,
        ratings_count=int(count or 0),
        user_rating=user_rating,
    )


def get_article_detail(
    session: Session, article_id: int, user: User | None = None
) -> ArticleDetailPublic:
    article = _ensure_article(session, article_id)

    author_rows = session.exec(
        select(Author.name)
        .join(ArticleAuthor, ArticleAuthor.author_id == Author.id)
        .where(ArticleAuthor.article_id == article_id)
        .order_by(Author.name)
    ).all()

    category_rows = session.exec(
        select(Category.name)
        .join(ArticleCategory, ArticleCategory.category_id == Category.id)
        .where(ArticleCategory.article_id == article_id)
        .order_by(Category.name)
    ).all()

    place_rows = session.exec(
        select(Place.name)
        .join(ArticlePlace, ArticlePlace.place_id == Place.id)
        .where(ArticlePlace.article_id == article_id)
        .order_by(Place.name)
    ).all()

    comment_rows = session.exec(
        select(Comment, User)
        .join(User, User.id == Comment.user_id)
        .where(Comment.article_id == article_id)
        .where(Comment.status == "active")
        .order_by(Comment.created_at.desc())
    ).all()

    comments = [
        ArticleCommentPublic(
            id=comment.id,
            content=comment.content,
            author_name=_author_display_name(comment_user),
            created_at=comment.created_at,
            is_own=user is not None and comment.user_id == user.id,
        )
        for comment, comment_user in comment_rows
        if comment.id is not None
    ]

    rating_summary = get_rating_summary(session, article_id, user)

    is_favorited = False
    if user:
        favorite = session.exec(
            select(Favorite.id)
            .where(Favorite.user_id == user.id)
            .where(Favorite.article_id == article_id)
        ).first()
        is_favorited = favorite is not None

    return ArticleDetailPublic(
        id=article.id,
        title=article.title,
        url=article.url,
        excerpt=article.excerpt,
        image_url=article.image_url,
        date=article.date,
        paywalled=article.paywalled,
        authors=list(author_rows),
        categories=list(category_rows),
        places=list(place_rows),
        comments=comments,
        average_rating=rating_summary.average_rating,
        ratings_count=rating_summary.ratings_count,
        user_rating=rating_summary.user_rating,
        is_favorited=is_favorited,
    )


def set_favorite(
    session: Session, article_id: int, user: User, *, favorited: bool
) -> FavoriteStatusPublic:
    _ensure_article(session, article_id)

    existing = session.exec(
        select(Favorite)
        .where(Favorite.user_id == user.id)
        .where(Favorite.article_id == article_id)
    ).first()

    if favorited:
        if not existing:
            session.add(Favorite(user_id=user.id, article_id=article_id))
            session.commit()
        return FavoriteStatusPublic(article_id=article_id, is_favorited=True)

    if existing:
        session.delete(existing)
        session.commit()
    return FavoriteStatusPublic(article_id=article_id, is_favorited=False)


def toggle_favorite(
    session: Session, article_id: int, user: User
) -> FavoriteStatusPublic:
    _ensure_article(session, article_id)

    existing = session.exec(
        select(Favorite)
        .where(Favorite.user_id == user.id)
        .where(Favorite.article_id == article_id)
    ).first()

    return set_favorite(session, article_id, user, favorited=existing is None)


def upsert_rating(
    session: Session, article_id: int, user: User, value: int
) -> RatingSummaryPublic:
    _ensure_article(session, article_id)

    existing = session.exec(
        select(Rating)
        .where(Rating.article_id == article_id)
        .where(Rating.user_id == user.id)
    ).first()

    now = get_datetime_utc()
    if existing:
        existing.value = value
        existing.updated_at = now
        session.add(existing)
    else:
        session.add(
            Rating(
                user_id=user.id,
                article_id=article_id,
                value=value,
                updated_at=now,
            )
        )
    session.commit()
    return get_rating_summary(session, article_id, user)


def list_comments(
    session: Session, article_id: int, user: User | None = None
) -> list[CommentPublic]:
    _ensure_article(session, article_id)

    rows = session.exec(
        select(Comment, User)
        .join(User, User.id == Comment.user_id)
        .where(Comment.article_id == article_id)
        .where(Comment.status == "active")
        .order_by(Comment.created_at.desc())
    ).all()

    return [
        CommentPublic(
            id=comment.id,
            article_id=comment.article_id,
            content=comment.content,
            author_name=_author_display_name(comment_user),
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            is_own=user is not None and comment.user_id == user.id,
        )
        for comment, comment_user in rows
        if comment.id is not None
    ]


def create_comment(
    session: Session, article_id: int, user: User, content: str
) -> CommentPublic:
    _ensure_article(session, article_id)

    comment = Comment(
        user_id=user.id,
        article_id=article_id,
        content=content.strip(),
        status="active",
    )
    session.add(comment)
    session.commit()
    session.refresh(comment)

    return CommentPublic(
        id=comment.id,
        article_id=comment.article_id,
        content=comment.content,
        author_name=_author_display_name(user),
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        is_own=True,
    )


def _get_own_comment(session: Session, comment_id: int, user: User) -> Comment:
    comment = session.get(Comment, comment_id)
    if not comment or comment.status != "active":
        raise HTTPException(status_code=404, detail="Comentario no encontrado")
    if comment.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes modificar este comentario",
        )
    return comment


def update_comment(
    session: Session, comment_id: int, user: User, content: str
) -> CommentPublic:
    comment = _get_own_comment(session, comment_id, user)
    comment.content = content.strip()
    comment.updated_at = datetime.now(timezone.utc)
    session.add(comment)
    session.commit()
    session.refresh(comment)

    return CommentPublic(
        id=comment.id,
        article_id=comment.article_id,
        content=comment.content,
        author_name=_author_display_name(user),
        created_at=comment.created_at,
        updated_at=comment.updated_at,
        is_own=True,
    )


def delete_comment(session: Session, comment_id: int, user: User) -> None:
    comment = _get_own_comment(session, comment_id, user)
    comment.status = "deleted"
    comment.updated_at = datetime.now(timezone.utc)
    session.add(comment)
    session.commit()
