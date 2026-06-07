"""Tests unitarios de apply_metadata_filters (sin fixtures de artículos en BD)."""

from unittest.mock import MagicMock

import pytest
from sqlalchemy.dialects import postgresql
from sqlmodel import select

from app.models.article import Article
from app.models.embedding import Embedding
from app.schemas.filters import ArticleMetadataFilters
from app.services.filter_service import apply_metadata_filters


@pytest.fixture
def mock_session() -> MagicMock:
    """Session mock documentado: no se ejecutan queries; solo se compila SQL."""
    return MagicMock()


def _compile_sql(statement) -> str:
    return str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )


def test_has_active_filters_empty() -> None:
    filters = ArticleMetadataFilters()
    assert filters.has_active_filters() is False


def test_has_active_filters_with_place() -> None:
    filters = ArticleMetadataFilters(place="España")
    assert filters.has_active_filters() is True


def test_apply_metadata_filters_no_op_when_none(mock_session: MagicMock) -> None:
    base = select(Article).join(Embedding, Article.id == Embedding.entity_id)
    result = apply_metadata_filters(base, mock_session, None)
    assert _compile_sql(result) == _compile_sql(base)


def test_apply_metadata_filters_no_op_when_empty(mock_session: MagicMock) -> None:
    base = select(Article).join(Embedding, Article.id == Embedding.entity_id)
    result = apply_metadata_filters(base, mock_session, ArticleMetadataFilters())
    assert _compile_sql(result) == _compile_sql(base)


def test_apply_metadata_filters_place_adds_exists(mock_session: MagicMock) -> None:
    base = select(Article).join(Embedding, Article.id == Embedding.entity_id)
    filters = ArticleMetadataFilters(place="España")
    result = apply_metadata_filters(base, mock_session, filters)
    sql = _compile_sql(result).lower()
    assert "exists" in sql
    assert "article_place" in sql
    assert "place" in sql
    assert "españa" in sql


def test_apply_metadata_filters_category_exact_match(mock_session: MagicMock) -> None:
    base = select(Article).join(Embedding, Article.id == Embedding.entity_id)
    filters = ArticleMetadataFilters(category="Geopolítica")
    result = apply_metadata_filters(base, mock_session, filters)
    sql = _compile_sql(result).lower()
    assert "exists" in sql
    assert "article_category" in sql
    assert "geopolítica" in sql
    assert "%geopolítica%" not in sql


def test_apply_metadata_filters_author_exact_match(mock_session: MagicMock) -> None:
    base = select(Article).join(Embedding, Article.id == Embedding.entity_id)
    filters = ArticleMetadataFilters(author="Álvaro Merino")
    result = apply_metadata_filters(base, mock_session, filters)
    sql = _compile_sql(result).lower()
    assert "exists" in sql
    assert "article_author" in sql
    assert "álvaro merino" in sql
    assert "%álvaro%" not in sql


def test_apply_metadata_filters_year_range(mock_session: MagicMock) -> None:
    base = select(Article).join(Embedding, Article.id == Embedding.entity_id)
    filters = ArticleMetadataFilters(year_start=2020, year_end=2024)
    result = apply_metadata_filters(base, mock_session, filters)
    sql = _compile_sql(result).lower()
    assert "extract" in sql
    assert "2020" in sql
    assert "2024" in sql
