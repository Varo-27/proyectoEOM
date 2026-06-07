from pydantic import BaseModel


class AuthorOption(BaseModel):
    name: str


class AuthorsListResponse(BaseModel):
    authors: list[AuthorOption]


class CategoryOption(BaseModel):
    name: str


class CategoriesListResponse(BaseModel):
    categories: list[CategoryOption]
