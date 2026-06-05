from datetime import datetime, timezone

import pytest
from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.article import Article
from app.models.engagement import Comment, Favorite, Follow, Note, Rating
from app.models.relations import ArticleAuthor, ArticleCategory
from app.models.taxonomy import Author, Category
from app.services import engagement_service
from app.schemas.engagement import FollowCreate
from tests.utils.user import create_random_user


@pytest.fixture
def sample_article(db: Session) -> Article:
    article = Article(
        url="https://example.com/test-engagement",
        title="Artículo de prueba",
        excerpt="Resumen",
        date=datetime(2024, 6, 1, tzinfo=timezone.utc),
        paywalled=False,
    )
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


def test_get_article_detail_not_found(db: Session) -> None:
    with pytest.raises(HTTPException) as exc:
        engagement_service.get_article_detail(db, 999_999)
    assert exc.value.status_code == 404


def test_favorite_toggle_and_rating(
    db: Session, sample_article: Article
) -> None:
    user = create_random_user(db)
    article_id = sample_article.id
    assert article_id is not None

    detail = engagement_service.get_article_detail(db, article_id, user)
    assert detail.is_favorited is False
    assert detail.user_rating is None
    assert detail.ratings_count == 0

    fav_on = engagement_service.set_favorite(db, article_id, user, favorited=True)
    assert fav_on.is_favorited is True

    fav_again = engagement_service.set_favorite(db, article_id, user, favorited=True)
    assert fav_again.is_favorited is True
    favorites = db.exec(
        select(Favorite).where(Favorite.article_id == article_id)
    ).all()
    assert len(favorites) == 1

    rating = engagement_service.upsert_rating(db, article_id, user, 4)
    assert rating.user_rating == 4
    assert rating.average_rating == 4.0
    assert rating.ratings_count == 1

    half = engagement_service.upsert_rating(db, article_id, user, 3.5)
    assert half.user_rating == 3.5
    assert half.average_rating == 3.5

    engagement_service.upsert_rating(db, article_id, user, 5)
    summary = engagement_service.get_rating_summary(db, article_id, user)
    assert summary.user_rating == 5
    assert summary.average_rating == 5.0

    fav_off = engagement_service.set_favorite(db, article_id, user, favorited=False)
    assert fav_off.is_favorited is False


def test_comments_crud(db: Session, sample_article: Article) -> None:
    user = create_random_user(db)
    article_id = sample_article.id
    assert article_id is not None

    created = engagement_service.create_comment(
        db, article_id, user, "  Primer comentario  "
    )
    assert created.content == "Primer comentario"
    assert created.is_own is True

    listed = engagement_service.list_comments(db, article_id, user)
    assert len(listed) == 1
    assert listed[0].id == created.id

    updated = engagement_service.update_comment(
        db, created.id, user, "Comentario editado"
    )
    assert updated.content == "Comentario editado"

    engagement_service.delete_comment(db, created.id, user)
    listed_after = engagement_service.list_comments(db, article_id, user)
    assert listed_after == []

    comment = db.get(Comment, created.id)
    assert comment is not None
    assert comment.status == "deleted"


def test_note_and_follow(db: Session, sample_article: Article) -> None:
    user = create_random_user(db)
    article_id = sample_article.id
    assert article_id is not None

    author = Author(name="Ana Test", profile_url="https://example.com/ana")
    category = Category(name="Geopolítica")
    db.add(author)
    db.add(category)
    db.commit()
    db.refresh(author)
    db.refresh(category)

    db.add(ArticleAuthor(article_id=article_id, author_id=author.id))
    db.add(ArticleCategory(article_id=article_id, category_id=category.id))
    db.commit()

    empty_note = engagement_service.get_article_note(db, article_id, user)
    assert empty_note.content == ""

    saved = engagement_service.upsert_article_note(
        db, article_id, user, "  Mi nota privada  "
    )
    assert saved.content == "Mi nota privada"

    detail = engagement_service.get_article_detail(db, article_id, user)
    assert detail.user_note == "Mi nota privada"
    assert len(detail.follow_targets) == 2

    follow_on = engagement_service.set_follow(
        db,
        user,
        FollowCreate(target_type="author", target_id=author.id),
        following=True,
    )
    assert follow_on.is_following is True

    detail_after = engagement_service.get_article_detail(db, article_id, user)
    author_target = next(
        target for target in detail_after.follow_targets if target.target_type == "author"
    )
    assert author_target.is_following is True

    follows = engagement_service.list_follows(db, user)
    assert len(follows) == 1

    cleared = engagement_service.upsert_article_note(db, article_id, user, "   ")
    assert cleared.content == ""
    assert db.exec(select(Note).where(Note.article_id == article_id)).first() is None
