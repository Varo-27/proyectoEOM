from typing import List
from pydantic import BaseModel
from app.schemas.filters import ArticleMetadataFilters
from app.schemas.search import ArticleSearchResult

class ExpandRequest(BaseModel):
    source_article_id: int
    existing_node_ids: List[int]
    filters: ArticleMetadataFilters | None = None

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    similarity: float | None = None

class GraphNode(BaseModel):
    id: str
    data: ArticleSearchResult

class ExpandResponse(BaseModel):
    new_nodes: List[GraphNode]
    new_edges: List[GraphEdge]
