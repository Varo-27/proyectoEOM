from fastapi import APIRouter, Query

from app.api.deps import SessionDep
from app.schemas.search import SearchResponse
from app.services import search_service

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/", response_model=SearchResponse)
def search_articles(
    session: SessionDep,
    q: str = Query(..., description="Texto libre a buscar en los artículos"),
    limit: int = Query(5, description="Número máximo de artículos a devolver")
):
    """
    Busca artículos semánticamente similares a la frase proporcionada mediante búsqueda vectorial.
    """
    return search_service.search_articles(
        session=session,
        query=q,
        limit=limit
    )
