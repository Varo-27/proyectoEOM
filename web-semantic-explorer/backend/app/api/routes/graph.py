from typing import List
import numpy as np
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import SessionDep
from app.models.article import Article
from app.models.embedding import Embedding
from app.models.relations import ArticleAuthor
from app.models.taxonomy import Author
from app.schemas.graph import ExpandRequest, ExpandResponse, GraphNode, GraphEdge
from app.schemas.search import ArticleSearchResult
from app.services.filter_service import apply_metadata_filters

router = APIRouter(prefix="/graph", tags=["graph"])

def calc_cosine_distance_np(v1: np.ndarray, v2: np.ndarray) -> float:
    """Calcula la distancia del coseno usando numpy (código C ultra rápido)."""
    # Manejar arrays 1D
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 1.0
    similarity = np.dot(v1, v2) / (norm_v1 * norm_v2)
    return 1.0 - float(similarity)

@router.post("/expand", response_model=ExpandResponse)
def expand_graph(
    request: ExpandRequest,
    session: SessionDep,
    limit: int = 5,
    threshold: float = 0.85
):
    """
    Expande el grafo a partir de un artículo. Retorna N nodos nuevos que no existan en existing_node_ids
    y calcula las aristas cruzadas entre los nuevos y los existentes según afinidad.
    """
    # 1. Obtener el embedding original del nodo fuente
    source_embed_row = session.exec(
        select(Embedding.vector)
        .where(Embedding.entity_id == request.source_article_id)
        .where(Embedding.entity_type == "article")
    ).first()
    
    if source_embed_row is None:
        raise HTTPException(status_code=404, detail="El artículo origen no existe o no tiene embeddings.")

    # Convertimos explícitamente a list para no tener problemas de casting en DB (Punto 3 extra)
    source_vector = source_embed_row.tolist() if hasattr(source_embed_row, 'tolist') else source_embed_row

    # 2. Extraer Top 5 similares EXCLUYENDO los ya existentes (y el propio fuente por seguridad)
    exclude_ids = request.existing_node_ids + [request.source_article_id]
    
    statement = (
        select(Article, Embedding.vector.cosine_distance(source_vector).label("distance"), Embedding.vector)
        .join(Embedding, Article.id == Embedding.entity_id)
        .where(Embedding.entity_type == "article")
        .where(Article.id.notin_(exclude_ids))
    )
    statement = apply_metadata_filters(statement, session, request.filters)
    statement = (
        statement
        .order_by(Embedding.vector.cosine_distance(source_vector))
        .limit(limit)
    )
    
    new_results = session.exec(statement).all()

    new_nodes = []
    new_edges = []
    new_vectors = {}

    new_article_ids = [article.id for article, _distance, _vector in new_results]
    authors_map: dict[int, list[str]] = {}

    if new_article_ids:
        author_rows = session.exec(
            select(ArticleAuthor.article_id, Author.name)
            .join(Author, Author.id == ArticleAuthor.author_id)
            .where(ArticleAuthor.article_id.in_(new_article_ids))
        ).all()

        for article_id, author_name in author_rows:
            authors_map.setdefault(article_id, []).append(author_name)

    # Construir Nodos Nuevos y Aristas Directas (Padre -> Hijo)
    for article, distance, vector in new_results:
        vector = vector.tolist() if hasattr(vector, 'tolist') else vector
        similarity = 1 - float(distance)
        str_id = str(article.id)
        
        node_data = ArticleSearchResult(
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
        
        new_nodes.append(GraphNode(id=str_id, data=node_data))
        new_vectors[str_id] = vector
        
        # Arista Padre -> Nuevo Nodo
        new_edges.append(GraphEdge(
            id=f"edge-{request.source_article_id}-{str_id}",
            source=str(request.source_article_id),
            target=str_id,
            similarity=similarity
        ))

    # 3. Interconexión (Cruce de aristas). Calculamos afinidad de Nuevos vs Existentes
    if request.existing_node_ids:
        existing_vecs = session.exec(
            select(Embedding.entity_id, Embedding.vector)
            .where(Embedding.entity_type == "article")
            .where(Embedding.entity_id.in_(request.existing_node_ids))
        ).all()

        max_distance = 1 - threshold

        for existing_id, e_vector_raw in existing_vecs:
            e_str_id = str(existing_id)
            # Casteo explícito a numpy
            e_vector_np = np.array(e_vector_raw)
            for new_id, n_vector_raw in new_vectors.items():
                n_vector_np = np.array(n_vector_raw)
                
                dist = calc_cosine_distance_np(n_vector_np, e_vector_np)
                
                if dist <= max_distance:
                    sim = 1 - dist
                    new_edges.append(GraphEdge(
                        id=f"edge-{e_str_id}-{new_id}-cross",
                        source=e_str_id,
                        target=new_id,
                        similarity=sim
                    ))

    return ExpandResponse(new_nodes=new_nodes, new_edges=new_edges)
