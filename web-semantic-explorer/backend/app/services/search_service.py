from sqlmodel import Session, select
from app.core.embeddings import embedding_client
from app.models.article import Article
from app.models.embedding import Embedding
from app.schemas.search import ArticleSearchResult, SearchResponse

def search_articles(
    *,
    session: Session,
    query: str,
    limit: int = 5
) -> SearchResponse:
    # 1. Convertir la frase del usuario a vector
    query_vector = embedding_client.embed_text(query)
    
    # 2. Consultar PostgreSQL
    statement = (
        select(Article, Embedding.vector.cosine_distance(query_vector).label("distance"))
        .join(Embedding, Article.id == Embedding.entity_id)
        .where(Embedding.entity_type == "article")
        .order_by(Embedding.vector.cosine_distance(query_vector))
        .limit(limit)
    )
    
    resultados_db = session.exec(statement).all()
    
    # 3. Mapear
    response_items = []
    for article, distance in resultados_db:
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
        
    return SearchResponse(query=query, results=response_items)
