from fastapi import APIRouter

from app.api.deps import CurrentUser, SessionDep
from app.schemas.engagement import FavoriteStatusPublic
from app.services import engagement_service

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.post("/{article_id}", response_model=FavoriteStatusPublic)
def add_favorite(
    article_id: int,
    session: SessionDep,
    current_user: CurrentUser,
) -> FavoriteStatusPublic:
    return engagement_service.set_favorite(
        session, article_id, current_user, favorited=True
    )


@router.delete("/{article_id}", response_model=FavoriteStatusPublic)
def delete_favorite(
    article_id: int,
    session: SessionDep,
    current_user: CurrentUser,
) -> FavoriteStatusPublic:
    return engagement_service.set_favorite(
        session, article_id, current_user, favorited=False
    )
