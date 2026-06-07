from fastapi import APIRouter
from sqlmodel import select

from app.api.deps import SessionDep
from app.models.relations import ArticleAuthor, ArticleCategory
from app.models.taxonomy import Author, Category
from app.schemas.taxonomy import (
    AuthorOption,
    AuthorsListResponse,
    CategoriesListResponse,
    CategoryOption,
)

router = APIRouter(prefix="/taxonomy", tags=["taxonomy"])


@router.get("/authors", response_model=AuthorsListResponse)
def list_authors(session: SessionDep) -> AuthorsListResponse:
    """Autores con al menos un artículo, ordenados por nombre (para filtros exactos)."""
    rows = session.exec(
        select(Author.name)
        .join(ArticleAuthor, ArticleAuthor.author_id == Author.id)
        .distinct()
        .order_by(Author.name)
    ).all()

    return AuthorsListResponse(
        authors=[AuthorOption(name=name) for name in rows if name]
    )


@router.get("/categories", response_model=CategoriesListResponse)
def list_categories(session: SessionDep) -> CategoriesListResponse:
    """Categorías con al menos un artículo, ordenadas por nombre (para filtros exactos)."""
    rows = session.exec(
        select(Category.name)
        .join(ArticleCategory, ArticleCategory.category_id == Category.id)
        .distinct()
        .order_by(Category.name)
    ).all()

    return CategoriesListResponse(
        categories=[CategoryOption(name=name) for name in rows if name]
    )
