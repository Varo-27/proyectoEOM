from pydantic import BaseModel, Field


class ArticleMetadataFilters(BaseModel):
    """Filtros opcionales de metadatos para búsqueda y expansión del grafo."""

    place: str | None = Field(
        default=None, description="Filtra por nombre o slug de Place"
    )
    category: str | None = Field(
        default=None, description="Filtra por nombre de Category"
    )
    author: str | None = Field(
        default=None,
        description="Nombre exacto de Author (filtro duro, desde lista)",
    )
    year_start: int | None = Field(
        default=None, description="Año mínimo de publicación (inclusive)"
    )
    year_end: int | None = Field(
        default=None, description="Año máximo de publicación (inclusive)"
    )

    def has_active_filters(self) -> bool:
        return any(
            value is not None
            for value in (
                self.place,
                self.category,
                self.author,
                self.year_start,
                self.year_end,
            )
        )
