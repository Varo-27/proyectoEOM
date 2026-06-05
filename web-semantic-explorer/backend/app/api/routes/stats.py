from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func
from sqlmodel import select

from app.api.deps import SessionDep
from app.models.article import Article
from app.models.engagement import Rating
from app.models.relations import ArticlePlace
from app.models.taxonomy import Place
from app.schemas.stats import (
    HeatmapEntry,
    HeatmapResponse,
    PlaceArticlePreview,
    PlacePreviewResponse,
)
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


@router.get("/places/{place_id}/preview", response_model=PlacePreviewResponse)
def get_place_preview(
    place_id: int,
    session: SessionDep,
    limit: int = Query(6, ge=1, le=10),
) -> PlacePreviewResponse:
    """Artículos mejor valorados de un lugar para el modal del mapa."""
    place = session.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Lugar no encontrado")

    article_count = session.exec(
        select(func.count(ArticlePlace.article_id)).where(
            ArticlePlace.place_id == place_id
        )
    ).one()
    count = int(article_count or 0)

    avg_rating = func.avg(Rating.value).label("average_rating")
    ratings_count = func.count(Rating.id).label("ratings_count")

    rated_rows = session.exec(
        select(Article, avg_rating, ratings_count)
        .join(ArticlePlace, ArticlePlace.article_id == Article.id)
        .join(Rating, Rating.article_id == Article.id)
        .where(ArticlePlace.place_id == place_id)
        .group_by(Article.id)
        .having(func.count(Rating.id) > 0)
        .order_by(avg_rating.desc(), ratings_count.desc(), Article.date.desc())
        .limit(limit)
    ).all()

    previews: list[PlaceArticlePreview] = []
    seen_ids: set[int] = set()

    for article, average, rating_total in rated_rows:
        seen_ids.add(article.id)
        previews.append(
            PlaceArticlePreview(
                id=article.id,
                title=article.title,
                excerpt=article.excerpt,
                image_url=article.image_url,
                date=article.date.isoformat() if article.date else None,
                average_rating=(
                    round(float(average) / 2, 1) if average is not None else None
                ),
                ratings_count=int(rating_total or 0),
            )
        )

    remaining = limit - len(previews)
    if remaining > 0:
        filler_statement = (
            select(Article)
            .join(ArticlePlace, ArticlePlace.article_id == Article.id)
            .where(ArticlePlace.place_id == place_id)
            .order_by(Article.date.desc())
            .limit(remaining + len(seen_ids))
        )
        if seen_ids:
            filler_statement = filler_statement.where(Article.id.not_in(seen_ids))

        for article in session.exec(filler_statement).all():
            if article.id in seen_ids:
                continue
            seen_ids.add(article.id)
            previews.append(
                PlaceArticlePreview(
                    id=article.id,
                    title=article.title,
                    excerpt=article.excerpt,
                    image_url=article.image_url,
                    date=article.date.isoformat() if article.date else None,
                    average_rating=None,
                    ratings_count=0,
                )
            )
            if len(previews) >= limit:
                break

    return PlacePreviewResponse(
        place_id=place_id,
        name=place.name,
        article_count=count,
        top_rated=previews,
    )
