from datetime import datetime, timezone

import pytest
from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.article import Article
from app.models.engagement import Comment, Favorite, Rating
from app.services import engagement_service
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
