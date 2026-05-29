from fastapi import APIRouter, Query

from app.api.deps import CurrentUser, OptionalUser, SessionDep
from app.schemas.engagement import RatingSummaryPublic, RatingUpsert
from app.services import engagement_service

router = APIRouter(prefix="/ratings", tags=["ratings"])


@router.post("", response_model=RatingSummaryPublic)
def create_or_update_rating(
    body: RatingUpsert,
    session: SessionDep,
    current_user: CurrentUser,
    article_id: int = Query(..., description="ID del artículo"),
) -> RatingSummaryPublic:
    return engagement_service.upsert_rating(
        session, article_id, current_user, body.value
    )


@router.get("/average", response_model=RatingSummaryPublic)
def get_rating_average(
    session: SessionDep,
    article_id: int = Query(..., description="ID del artículo"),
    current_user: OptionalUser = None,
) -> RatingSummaryPublic:
    return engagement_service.get_rating_summary(session, article_id, current_user)
