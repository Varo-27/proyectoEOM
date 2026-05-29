from typing import TypeVar

from sqlalchemy import extract, func, or_
from sqlmodel import Session, select
from sqlmodel.sql.expression import Select

from app.models.article import Article
from app.models.relations import ArticleAuthor, ArticleCategory, ArticlePlace
from app.models.taxonomy import Author, Category, Place
from app.schemas.filters import ArticleMetadataFilters

T = TypeVar("T")


def apply_metadata_filters(
    statement: Select[T],
    session: Session,
    filters: ArticleMetadataFilters | None,
) -> Select[T]:
    """
    Restringe el statement a artículos que cumplen los filtros de metadatos.

    Usa subconsultas EXISTS correlacionadas por article_id. Debe aplicarse antes
    del order_by vectorial para que pgvector ordene solo sobre el subconjunto filtrado.
    """
    del session  # reservado para extensiones futuras (p. ej. caché de IDs elegibles)

    if filters is None or not filters.has_active_filters():
        return statement

    conditions = []

    if filters.place:
        pattern = f"%{filters.place}%"
        conditions.append(
            select(ArticlePlace.article_id)
            .join(Place, Place.id == ArticlePlace.place_id)
            .where(ArticlePlace.article_id == Article.id)
            .where(or_(Place.name.ilike(pattern), Place.slug.ilike(pattern)))
            .exists()
        )

    if filters.category:
        pattern = f"%{filters.category}%"
        conditions.append(
            select(ArticleCategory.article_id)
            .join(Category, Category.id == ArticleCategory.category_id)
            .where(ArticleCategory.article_id == Article.id)
            .where(Category.name.ilike(pattern))
            .exists()
        )

    if filters.author:
        # Filtro duro: coincidencia exacta de nombre (lista desplegable en UI)
        author_name = filters.author.strip()
        conditions.append(
            select(ArticleAuthor.article_id)
            .join(Author, Author.id == ArticleAuthor.author_id)
            .where(ArticleAuthor.article_id == Article.id)
            .where(func.lower(Author.name) == author_name.lower())
            .exists()
        )

    if filters.year_start is not None:
        conditions.append(extract("year", Article.date) >= filters.year_start)

    if filters.year_end is not None:
        conditions.append(extract("year", Article.date) <= filters.year_end)

    return statement.where(*conditions)
