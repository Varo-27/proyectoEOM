from pydantic import BaseModel, Field


class HeatmapEntry(BaseModel):
    place_id: int
    name: str
    slug: str | None = None
    country_code: str | None = None
    map_country_codes: list[str] = []
    article_count: int


class HeatmapResponse(BaseModel):
    total_articles: int
    entries: list[HeatmapEntry] = Field(default_factory=list)
