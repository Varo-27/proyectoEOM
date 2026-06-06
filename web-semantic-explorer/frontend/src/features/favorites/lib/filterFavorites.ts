import type { FavoriteArticle } from "@/shared/api/workspaces"

import type { FavoritesFilters } from "./favoritesFilters"

function matchesSearch(favorite: FavoriteArticle, search: string): boolean {
  const query = search.trim().toLowerCase()
  if (!query) return true

  const haystack = [
    favorite.title,
    favorite.excerpt,
    ...favorite.authors,
    ...favorite.categories,
    ...favorite.places,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  return query.split(/\s+/).every((word) => haystack.includes(word))
}

function matchesRated(
  favorite: FavoriteArticle,
  rated: FavoritesFilters["rated"],
): boolean {
  switch (rated) {
    case "rated":
      return favorite.average_rating != null
    case "not_rated":
      return favorite.average_rating == null
    case "my_rating":
      return favorite.user_rating != null
    default:
      return true
  }
}

export function filterFavorites(
  favorites: FavoriteArticle[],
  filters: FavoritesFilters,
): FavoriteArticle[] {
  return favorites.filter((favorite) => {
    if (!matchesSearch(favorite, filters.search)) return false
    if (!matchesRated(favorite, filters.rated)) return false

    if (
      filters.author &&
      !favorite.authors.some(
        (author) => author.toLowerCase() === filters.author.toLowerCase(),
      )
    ) {
      return false
    }

    if (
      filters.category &&
      !favorite.categories.some(
        (category) => category.toLowerCase() === filters.category.toLowerCase(),
      )
    ) {
      return false
    }

    if (
      filters.place &&
      !favorite.places.some(
        (place) => place.toLowerCase() === filters.place.toLowerCase(),
      )
    ) {
      return false
    }

    return true
  })
}

export function collectFavoriteFilterOptions(favorites: FavoriteArticle[]) {
  const authors = new Set<string>()
  const categories = new Set<string>()
  const places = new Set<string>()

  for (const favorite of favorites) {
    favorite.authors.forEach((value) => authors.add(value))
    favorite.categories.forEach((value) => categories.add(value))
    favorite.places.forEach((value) => places.add(value))
  }

  return {
    authors: [...authors].sort((a, b) => a.localeCompare(b, "es")),
    categories: [...categories].sort((a, b) => a.localeCompare(b, "es")),
    places: [...places].sort((a, b) => a.localeCompare(b, "es")),
  }
}
