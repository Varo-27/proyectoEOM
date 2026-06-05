from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlmodel import Session, func, select

from app.models.article import Article
from app.models.engagement import Comment, Favorite, Follow, Note, Rating, get_datetime_utc
from app.models.relations import ArticleAuthor, ArticleCategory, ArticlePlace
from app.models.taxonomy import Author, Category, Place, Topic
from app.models.user import User
from app.schemas.engagement import (
    ArticleCommentPublic,
    ArticleDetailPublic,
    CommentPublic,
    FavoriteArticlePublic,
    FavoriteStatusPublic,
    FollowCreate,
    FollowPublic,
    FollowStatusPublic,
    FollowTargetPublic,
    FollowsListPublic,
    NotePublic,
    RatingSummaryPublic,
    normalize_rating_value,
)


def _rating_to_storage(value: float) -> int:
    return int(round(normalize_rating_value(value) * 2))


def _rating_from_storage(value: int) -> float:
    return value / 2

ALLOWED_FOLLOW_TYPES = frozenset({"author", "category", "topic", "article"})


def _author_display_name(user: User) -> str:
    if user.full_name and user.full_name.strip():
        return user.full_name.strip()
    return user.email.split("@")[0]


def _ensure_article(session: Session, article_id: int) -> Article:
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return article


def _ensure_follow_target(
    session: Session, target_type: str, target_id: int
) -> str:
    normalized = target_type.strip().lower()
    if normalized not in ALLOWED_FOLLOW_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"target_type debe ser uno de: {', '.join(sorted(ALLOWED_FOLLOW_TYPES))}",
        )

    if normalized == "author":
        author = session.get(Author, target_id)
        if not author:
            raise HTTPException(status_code=404, detail="Autor no encontrado")
        return author.name

    if normalized == "category":
        category = session.get(Category, target_id)
        if not category:
            raise HTTPException(status_code=404, detail="Categoría no encontrada")
        return category.name

    if normalized == "topic":
        topic = session.get(Topic, target_id)
        if not topic:
            raise HTTPException(status_code=404, detail="Tema no encontrado")
        return topic.name

    article = session.get(Article, target_id)
    if not article:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return article.title or article.url


def _is_following(
    session: Session, user: User, target_type: str, target_id: int
) -> bool:
    existing = session.exec(
        select(Follow.id)
        .where(Follow.user_id == user.id)
        .where(Follow.target_type == target_type)
        .where(Follow.target_id == target_id)
    ).first()
    return existing is not None


def _build_article_follow_targets(
    session: Session, article_id: int, user: User | None
) -> list[FollowTargetPublic]:
    author_rows = session.exec(
        select(Author.id, Author.name)
        .join(ArticleAuthor, ArticleAuthor.author_id == Author.id)
        .where(ArticleAuthor.article_id == article_id)
        .order_by(Author.name)
    ).all()
    category_rows = session.exec(
        select(Category.id, Category.name)
        .join(ArticleCategory, ArticleCategory.category_id == Category.id)
        .where(ArticleCategory.article_id == article_id)
        .order_by(Category.name)
    ).all()

    targets: list[FollowTargetPublic] = []
    for author_id, author_name in author_rows:
        if author_id is None:
            continue
        targets.append(
            FollowTargetPublic(
                target_type="author",
                target_id=author_id,
                label=author_name,
                is_following=_is_following(session, user, "author", author_id)
                if user
                else False,
            )
        )

    for category_id, category_name in category_rows:
        if category_id is None:
            continue
        targets.append(
            FollowTargetPublic(
                target_type="category",
                target_id=category_id,
                label=category_name,
                is_following=_is_following(session, user, "category", category_id)
                if user
                else False,
            )
        )

    return targets


def get_article_note(
    session: Session, article_id: int, user: User
) -> NotePublic:
    _ensure_article(session, article_id)

    note = session.exec(
        select(Note)
        .where(Note.user_id == user.id)
        .where(Note.article_id == article_id)
    ).first()

    if not note:
        return NotePublic(article_id=article_id, content="", updated_at=None)

    return NotePublic(
        article_id=article_id,
        content=note.content,
        updated_at=note.updated_at,
    )


def upsert_article_note(
    session: Session, article_id: int, user: User, content: str
) -> NotePublic:
    _ensure_article(session, article_id)

    trimmed = content.strip()
    existing = session.exec(
        select(Note)
        .where(Note.user_id == user.id)
        .where(Note.article_id == article_id)
    ).first()

    now = get_datetime_utc()

    if not trimmed:
        if existing:
            session.delete(existing)
            session.commit()
        return NotePublic(article_id=article_id, content="", updated_at=None)

    if existing:
        existing.content = trimmed
        existing.updated_at = now
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return NotePublic(
            article_id=article_id,
            content=existing.content,
            updated_at=existing.updated_at,
        )

    note = Note(
        user_id=user.id,
        article_id=article_id,
        content=trimmed,
        updated_at=now,
    )
    session.add(note)
    session.commit()
    session.refresh(note)
    return NotePublic(
        article_id=article_id,
        content=note.content,
        updated_at=note.updated_at,
    )


def set_follow(
    session: Session, user: User, payload: FollowCreate, *, following: bool
) -> FollowStatusPublic:
    target_type = payload.target_type.strip().lower()
    _ensure_follow_target(session, target_type, payload.target_id)

    existing = session.exec(
        select(Follow)
        .where(Follow.user_id == user.id)
        .where(Follow.target_type == target_type)
        .where(Follow.target_id == payload.target_id)
    ).first()

    if following:
        if not existing:
            session.add(
                Follow(
                    user_id=user.id,
                    target_type=target_type,
                    target_id=payload.target_id,
                )
            )
            session.commit()
        return FollowStatusPublic(
            target_type=target_type,
            target_id=payload.target_id,
            is_following=True,
        )

    if existing:
        session.delete(existing)
        session.commit()

    return FollowStatusPublic(
        target_type=target_type,
        target_id=payload.target_id,
        is_following=False,
    )


def list_follows(session: Session, user: User) -> list[FollowPublic]:
    rows = session.exec(
        select(Follow)
        .where(Follow.user_id == user.id)
        .order_by(Follow.created_at.desc())
    ).all()

    results: list[FollowPublic] = []
    for follow in rows:
        try:
            label = _ensure_follow_target(session, follow.target_type, follow.target_id)
        except HTTPException:
            label = f"{follow.target_type} #{follow.target_id}"
        results.append(
            FollowPublic(
                target_type=follow.target_type,
                target_id=follow.target_id,
                label=label,
                created_at=follow.created_at,
            )
        )
    return results


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
    average_rating = (
        round(float(average_raw) / 2, 1) if average_raw is not None else None
    )

    user_rating: float | None = None
    if user:
        user_row = session.exec(
            select(Rating.value)
            .where(Rating.article_id == article_id)
            .where(Rating.user_id == user.id)
        ).first()
        user_rating = (
            _rating_from_storage(int(user_row)) if user_row is not None else None
        )

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
    user_note: str | None = None
    user_note_updated_at: datetime | None = None
    if user:
        favorite = session.exec(
            select(Favorite.id)
            .where(Favorite.user_id == user.id)
            .where(Favorite.article_id == article_id)
        ).first()
        is_favorited = favorite is not None

        note = session.exec(
            select(Note)
            .where(Note.user_id == user.id)
            .where(Note.article_id == article_id)
        ).first()
        if note:
            user_note = note.content
            user_note_updated_at = note.updated_at

    follow_targets = _build_article_follow_targets(session, article_id, user)

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
        user_note=user_note,
        user_note_updated_at=user_note_updated_at,
        follow_targets=follow_targets,
    )


def list_favorites(session: Session, user: User) -> list[FavoriteArticlePublic]:
    rows = session.exec(
        select(Favorite, Article)
        .join(Article, Article.id == Favorite.article_id)
        .where(Favorite.user_id == user.id)
        .order_by(Favorite.created_at.desc())
    ).all()

    results: list[FavoriteArticlePublic] = []
    for favorite, article in rows:
        author_rows = session.exec(
            select(Author.name)
            .join(ArticleAuthor, ArticleAuthor.author_id == Author.id)
            .where(ArticleAuthor.article_id == article.id)
            .order_by(Author.name)
        ).all()
        category_rows = session.exec(
            select(Category.name)
            .join(ArticleCategory, ArticleCategory.category_id == Category.id)
            .where(ArticleCategory.article_id == article.id)
            .order_by(Category.name)
        ).all()

        results.append(
            FavoriteArticlePublic(
                article_id=article.id,
                title=article.title,
                excerpt=article.excerpt,
                image_url=article.image_url,
                url=article.url,
                authors=list(author_rows),
                categories=list(category_rows),
                favorited_at=favorite.created_at,
            )
        )

    return results


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
    session: Session, article_id: int, user: User, value: float
) -> RatingSummaryPublic:
    _ensure_article(session, article_id)

    storage_value = _rating_to_storage(value)
    existing = session.exec(
        select(Rating)
        .where(Rating.article_id == article_id)
        .where(Rating.user_id == user.id)
    ).first()

    now = get_datetime_utc()
    if existing:
        existing.value = storage_value
        existing.updated_at = now
        session.add(existing)
    else:
        session.add(
            Rating(
                user_id=user.id,
                article_id=article_id,
                value=storage_value,
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
