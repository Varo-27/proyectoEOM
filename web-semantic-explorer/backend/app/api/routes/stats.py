from fastapi import APIRouter
from sqlalchemy import func
from sqlmodel import select

from app.api.deps import SessionDep
from app.models.relations import ArticlePlace
from app.models.taxonomy import Place
from app.schemas.stats import HeatmapEntry, HeatmapResponse
from app.place_geo import resolve_country_code, resolve_map_country_codes

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/heatmap", response_model=HeatmapResponse)
def get_heatmap(session: SessionDep) -> HeatmapResponse:
    """
    Agrega artículos por lugar (ArticlePlace) para alimentar el mapa de calor.
    """
    rows = session.exec(
        select(
            Place.id,
            Place.name,
            Place.slug,
            func.count(ArticlePlace.article_id).label("article_count"),
        )
        .join(ArticlePlace, ArticlePlace.place_id == Place.id)
        .group_by(Place.id, Place.name, Place.slug)
        .order_by(func.count(ArticlePlace.article_id).desc())
    ).all()

    entries: list[HeatmapEntry] = []
    total_articles = 0

    for place_id, name, slug, article_count in rows:
        count = int(article_count or 0)
        total_articles += count
        map_codes = resolve_map_country_codes(name, slug)
        entries.append(
            HeatmapEntry(
                place_id=place_id,
                name=name,
                slug=slug,
                country_code=resolve_country_code(name, slug),
                map_country_codes=map_codes,
                article_count=count,
            )
        )

    return HeatmapResponse(total_articles=total_articles, entries=entries)
