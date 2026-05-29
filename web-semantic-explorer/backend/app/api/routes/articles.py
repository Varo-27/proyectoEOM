from fastapi import APIRouter

from app.api.deps import CurrentUser, OptionalUser, SessionDep
from app.schemas.engagement import (
    ArticleDetailPublic,
    CommentCreate,
    CommentPublic,
    CommentUpdate,
    FavoriteStatusPublic,
    RatingSummaryPublic,
    RatingUpsert,
)
from app.services import engagement_service

router = APIRouter(prefix="/articles", tags=["articles"])


@router.get("/{article_id}", response_model=ArticleDetailPublic)
def get_article_detail(
    article_id: int,
    session: SessionDep,
    current_user: OptionalUser = None,
) -> ArticleDetailPublic:
    """Detalle del artículo con comentarios, valoraciones y estado de favorito del usuario."""
    return engagement_service.get_article_detail(session, article_id, current_user)


@router.post("/{article_id}/favorite", response_model=FavoriteStatusPublic)
def toggle_article_favorite(
    article_id: int,
    session: SessionDep,
    current_user: CurrentUser,
) -> FavoriteStatusPublic:
    return engagement_service.toggle_favorite(session, article_id, current_user)


@router.delete("/{article_id}/favorite", response_model=FavoriteStatusPublic)
def remove_article_favorite(
    article_id: int,
    session: SessionDep,
    current_user: CurrentUser,
) -> FavoriteStatusPublic:
    return engagement_service.set_favorite(
        session, article_id, current_user, favorited=False
    )


@router.post("/{article_id}/rating", response_model=RatingSummaryPublic)
def upsert_article_rating(
    article_id: int,
    body: RatingUpsert,
    session: SessionDep,
    current_user: CurrentUser,
) -> RatingSummaryPublic:
    return engagement_service.upsert_rating(
        session, article_id, current_user, body.value
    )


@router.get("/{article_id}/ratings/summary", response_model=RatingSummaryPublic)
def get_article_rating_summary(
    article_id: int,
    session: SessionDep,
    current_user: OptionalUser = None,
) -> RatingSummaryPublic:
    return engagement_service.get_rating_summary(session, article_id, current_user)


@router.get("/{article_id}/comments", response_model=list[CommentPublic])
def list_article_comments(
    article_id: int,
    session: SessionDep,
    current_user: OptionalUser = None,
) -> list[CommentPublic]:
    return engagement_service.list_comments(session, article_id, current_user)


@router.post("/{article_id}/comments", response_model=CommentPublic)
def create_article_comment(
    article_id: int,
    body: CommentCreate,
    session: SessionDep,
    current_user: CurrentUser,
) -> CommentPublic:
    return engagement_service.create_comment(
        session, article_id, current_user, body.content
    )


comments_router = APIRouter(prefix="/comments", tags=["comments"])


@comments_router.patch("/{comment_id}", response_model=CommentPublic)
def update_comment(
    comment_id: int,
    body: CommentUpdate,
    session: SessionDep,
    current_user: CurrentUser,
) -> CommentPublic:
    return engagement_service.update_comment(
        session, comment_id, current_user, body.content
    )


@comments_router.delete("/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    session: SessionDep,
    current_user: CurrentUser,
) -> None:
    engagement_service.delete_comment(session, comment_id, current_user)
