from typing import Any

import numpy as np
from fastapi import HTTPException
from sqlmodel import Session, select

from app.models.article import Article
from app.models.embedding import Embedding
from app.models.relations import ArticleAuthor
from app.models.taxonomy import Author
from app.schemas.graph import ExpandRequest, ExpandResponse, GraphEdge, GraphNode
from app.schemas.search import ArticleSearchResult
from app.services.filter_service import apply_metadata_filters
from app.services.ranking_vector import build_expand_ranking_vector


def embedding_vector_from_row(row: Any) -> list[float]:
    raw = row.tolist() if hasattr(row, "tolist") else row
    return [float(value) for value in raw]


def calc_cosine_distance_np(v1: np.ndarray, v2: np.ndarray) -> float:
    """Calcula la distancia del coseno usando numpy."""
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)
    if norm_v1 == 0 or norm_v2 == 0:
        return 1.0
    similarity = np.dot(v1, v2) / (norm_v1 * norm_v2)
    return 1.0 - float(similarity)


def expand_graph(
    *,
    session: Session,
    request: ExpandRequest,
    limit: int = 5,
    threshold: float = 0.85,
) -> ExpandResponse:
    source_embed_row = session.exec(
        select(Embedding.vector)
        .where(Embedding.entity_id == request.source_article_id)
        .where(Embedding.entity_type == "article")
    ).first()

    if source_embed_row is None:
        raise HTTPException(
            status_code=404,
            detail="El artículo origen no existe o no tiene embeddings.",
        )

    source_vector = embedding_vector_from_row(source_embed_row)

    ranking_vector = build_expand_ranking_vector(
        session=session,
        source_vector=source_vector,
        seed_queries=request.seed_queries,
        context_article_ids=request.context_article_ids,
        exclude_article_id=request.source_article_id,
    )

    exclude_ids = request.existing_node_ids + [request.source_article_id]

    statement = (
        select(
            Article,
            Embedding.vector.cosine_distance(ranking_vector).label("distance"),  # type: ignore[attr-defined]
            Embedding.vector,
        )
        .join(Embedding, Article.id == Embedding.entity_id)  # type: ignore[arg-type]
        .where(Embedding.entity_type == "article")
        .where(Article.id.notin_(exclude_ids))  # type: ignore[union-attr]
    )
    statement = apply_metadata_filters(statement, session, request.filters)
    statement = statement.order_by(
        Embedding.vector.cosine_distance(ranking_vector)  # type: ignore[attr-defined]
    ).limit(limit)

    new_results = session.exec(statement).all()

    new_nodes = []
    new_edges = []
    new_vectors = {}

    new_article_ids = [
        article.id
        for article, _distance, _vector in new_results
        if article.id is not None
    ]
    authors_map: dict[int, list[str]] = {}

    if new_article_ids:
        author_rows = session.exec(
            select(ArticleAuthor.article_id, Author.name)
            .join(Author, Author.id == ArticleAuthor.author_id)  # type: ignore[arg-type]
            .where(ArticleAuthor.article_id.in_(new_article_ids))  # type: ignore[attr-defined]
        ).all()

        for article_id, author_name in author_rows:
            authors_map.setdefault(article_id, []).append(author_name)

    for article, distance, vector in new_results:
        if article.id is None:
            continue

        article_id = article.id
        vector_list = embedding_vector_from_row(vector)
        similarity = 1 - float(distance)
        str_id = str(article_id)

        node_data = ArticleSearchResult(
            id=article_id,
            title=article.title,
            url=article.url,
            excerpt=article.excerpt,
            image_url=article.image_url,
            date=article.date,
            paywalled=article.paywalled,
            similarity=similarity,
            authors=authors_map.get(article_id, []),
        )

        new_nodes.append(GraphNode(id=str_id, data=node_data))
        new_vectors[str_id] = vector_list

        new_edges.append(
            GraphEdge(
                id=f"edge-{request.source_article_id}-{str_id}",
                source=str(request.source_article_id),
                target=str_id,
                similarity=similarity,
            )
        )

    if request.existing_node_ids:
        existing_vecs = session.exec(
            select(Embedding.entity_id, Embedding.vector)
            .where(Embedding.entity_type == "article")
            .where(Embedding.entity_id.in_(request.existing_node_ids))  # type: ignore[attr-defined]
        ).all()

        max_distance = 1 - threshold

        for existing_id, e_vector_raw in existing_vecs:
            e_str_id = str(existing_id)
            e_vector_np = np.array(e_vector_raw)
            for new_id, n_vector_raw in new_vectors.items():
                n_vector_np = np.array(n_vector_raw)
                dist = calc_cosine_distance_np(n_vector_np, e_vector_np)

                if dist <= max_distance:
                    sim = 1 - dist
                    new_edges.append(
                        GraphEdge(
                            id=f"edge-{e_str_id}-{new_id}-cross",
                            source=e_str_id,
                            target=new_id,
                            similarity=sim,
                        )
                    )

    return ExpandResponse(new_nodes=new_nodes, new_edges=new_edges)
