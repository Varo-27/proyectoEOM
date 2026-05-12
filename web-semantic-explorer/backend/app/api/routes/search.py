from typing import List
from datetime import datetime

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlmodel import select

from app.api.deps import SessionDep
from app.core.embeddings import embedding_client
from app.models.article import Article
from app.models.embedding import Embedding

router = APIRouter(prefix="/search", tags=["search"])

# Schemas específicos para la respuesta y no devolver el modelo de DB en crudo
class ArticleSearchResult(BaseModel):
    id: int
    title: str | None
    url: str
    excerpt: str | None
    image_url: str | None
    date: datetime | None
    paywalled: bool
    similarity: float

class SearchResponse(BaseModel):
    query: str
    results: List[ArticleSearchResult]

@router.get("/", response_model=SearchResponse)
def search_articles(
    session: SessionDep,
    q: str = Query(..., description="Texto libre a buscar en los artículos"),
    limit: int = Query(5, description="Número máximo de artículos a devolver")
):
    """
    Busca artículos semánticamente similares a la frase proporcionada mediante búsqueda vectorial (pgvector).
    """
    # 1. Convertir la frase del usuario a vector usando el Singleton en memoria (caché automático si se repite)
    query_vector = embedding_client.embed_text(q)
    
    # 2. Consultar PostgreSQL usando distancia del coseno (<=>)
    statement = (
        select(Article, Embedding.vector.cosine_distance(query_vector).label("distance"))
        .join(Embedding, Article.id == Embedding.entity_id)
        .where(Embedding.entity_type == "article")
        .order_by(Embedding.vector.cosine_distance(query_vector))
        .limit(limit)
    )
    
    resultados_db = session.exec(statement).all()
    
    # 3. Mapear y preparar respuesta JSON (La distancia va de 0 a 2, la convertimos a similitud)
    response_items = []
    for article, distance in resultados_db:
        # Transforma distancia coseno a un coeficiente de similitud (aprox 1.0 = idénticos)
        # La distancia_coseno en pgvector es (1 - similitud_coseno), por tanto similitud = 1 - distancia
        similarity = 1 - float(distance)
        
        response_items.append(
            ArticleSearchResult(
                id=article.id,
                title=article.title,
                url=article.url,
                excerpt=article.excerpt,
                image_url=article.image_url,
                date=article.date,
                paywalled=article.paywalled,
                similarity=similarity
            )
        )
        
    return SearchResponse(query=q, results=response_items)
