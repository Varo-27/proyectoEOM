from fastapi import APIRouter, Query
from sqlmodel import select

from app.api.deps import SessionDep
from app.core.embeddings import embedding_client
from app.models.article import Article
from app.models.embedding import Embedding
from app.models.relations import ArticleAuthor
from app.models.taxonomy import Author
from app.schemas.filters import ArticleMetadataFilters
from app.schemas.search import ArticleSearchResult, SearchResponse
from app.services.filter_service import apply_metadata_filters

router = APIRouter(prefix="/search", tags=["search"])

@router.get("", response_model=SearchResponse)
def search_articles(
    session: SessionDep,
    q: str = Query(..., description="Texto libre a buscar en los artículos"),
    limit: int = Query(5, description="Número máximo de artículos a devolver"),
    place: str | None = Query(None, description="Filtra por nombre o slug de Place"),
    category: str | None = Query(None, description="Filtra por nombre de Category"),
    author: str | None = Query(None, description="Filtra por nombre de Author"),
    year_start: int | None = Query(None, description="Año mínimo de publicación (inclusive)"),
    year_end: int | None = Query(None, description="Año máximo de publicación (inclusive)"),
):
    """
    Busca artículos semánticamente similares a la frase proporcionada mediante búsqueda vectorial (pgvector).
    """
    filters = ArticleMetadataFilters(
        place=place,
        category=category,
        author=author,
        year_start=year_start,
        year_end=year_end,
    )

    # 1. Convertir la frase del usuario a vector usando el Singleton en memoria (caché automático si se repite)
    query_vector = embedding_client.embed_text(q)
    
    # 2. Consultar PostgreSQL usando distancia del coseno (<=>)
    statement = (
        select(Article, Embedding.vector.cosine_distance(query_vector).label("distance"))
        .join(Embedding, Article.id == Embedding.entity_id)
        .where(Embedding.entity_type == "article")
    )
    statement = apply_metadata_filters(statement, session, filters)
    statement = (
        statement
        .order_by(Embedding.vector.cosine_distance(query_vector))
        .limit(limit)
    )
    
    resultados_db = session.exec(statement).all()
    
    # 3. Mapear y preparar respuesta JSON (La distancia va de 0 a 2, la convertimos a similitud)
    response_items = []
    article_ids = [article.id for article, _distance in resultados_db]
    authors_map: dict[int, list[str]] = {}

    if article_ids:
        author_rows = session.exec(
            select(ArticleAuthor.article_id, Author.name)
            .join(Author, Author.id == ArticleAuthor.author_id)
            .where(ArticleAuthor.article_id.in_(article_ids))
        ).all()

        for article_id, author_name in author_rows:
            authors_map.setdefault(article_id, []).append(author_name)
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
                similarity=similarity,
                authors=authors_map.get(article.id, [])
            )
        )
        
    return SearchResponse(query=q, results=response_items)
