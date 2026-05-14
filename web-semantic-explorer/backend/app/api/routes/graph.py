from fastapi import APIRouter

from app.api.deps import SessionDep
from app.schemas.graph import ExpandRequest, ExpandResponse
from app.services import graph_service

router = APIRouter(prefix="/graph", tags=["graph"])

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
    return graph_service.expand_graph(
        session=session,
        request=request,
        limit=limit,
        threshold=threshold
    )
