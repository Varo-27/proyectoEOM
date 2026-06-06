import { Link, useNavigate } from "@tanstack/react-router"
import { Star } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import type { AppNode } from "@/entities/graph"
import { useWorkspaceStore } from "@/entities/workspace"
import {
  addFavoriteToInvestigation,
  collectFavoriteFilterOptions,
  EMPTY_FAVORITES_FILTERS,
  type FavoritesFilters,
  filterFavorites,
  useFavoritesList,
} from "@/features/favorites"
import type { FavoriteArticle } from "@/shared/api/workspaces"
import { isLoggedIn } from "@/shared/auth"
import { ArticleNodeModal } from "@/widgets/article-modal"

import { FavoriteArticleCard } from "./FavoriteArticleCard"
import { FavoritesFilterBar } from "./FavoritesFilterBar"

export function FavoritesExplorer() {
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()
  const [filters, setFilters] = useState<FavoritesFilters>(
    EMPTY_FAVORITES_FILTERS,
  )
  const [articleModalNode, setArticleModalNode] = useState<AppNode | null>(null)
  const [articleModalOpen, setArticleModalOpen] = useState(false)

  const isGuestMode = useWorkspaceStore((state) => state.isGuestMode)
  const hydrateForCurrentUser = useWorkspaceStore(
    (state) => state.hydrateForCurrentUser,
  )
  const activeWorkspaceName = useWorkspaceStore((state) => {
    const active = state.workspaces.find(
      (ws) => ws.id === state.activeWorkspaceId,
    )
    return active?.name
  })

  useEffect(() => {
    void hydrateForCurrentUser()
  }, [hydrateForCurrentUser])

  const { data, isLoading, isError } = useFavoritesList()
  const favorites = data?.data ?? []

  const filterOptions = useMemo(
    () => collectFavoriteFilterOptions(favorites),
    [favorites],
  )

  const filteredFavorites = useMemo(
    () => filterFavorites(favorites, filters),
    [favorites, filters],
  )

  const handleOpen = useCallback((favorite: FavoriteArticle) => {
    setArticleModalNode({
      id: String(favorite.article_id),
      type: "article",
      position: { x: 0, y: 0 },
      data: {
        title: favorite.title?.trim() || "Sin título",
        excerpt: favorite.excerpt ?? undefined,
        imageUrl: favorite.image_url ?? undefined,
        author_name: favorite.authors.join(", ") || undefined,
        category_name: favorite.categories[0],
        appearDelay: 0,
      },
    })
    setArticleModalOpen(true)
  }, [])

  const handleAdd = useCallback(
    (favorite: FavoriteArticle, target: "current" | "new") => {
      if (target === "new" && isGuestMode) return

      addFavoriteToInvestigation(favorite, target, {
        isGuestMode,
        navigate,
      })
      toast.success(
        target === "new"
          ? "Artículo añadido a una nueva investigación"
          : "Artículo añadido al área actual",
      )
    },
    [isGuestMode, navigate],
  )

  if (!loggedIn) {
    return (
      <div className="favorites-page">
        <header className="favorites-page__header">
          <Star className="size-5 text-primary" aria-hidden />
          <h1 className="eom-heading-section">Favoritos</h1>
        </header>
        <p className="favorites-page__guest">
          Inicia sesión para ver y gestionar tus artículos guardados.{" "}
          <Link to="/login" className="underline underline-offset-4">
            Entrar
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="favorites-page">
      <header className="favorites-page__header">
        <Star className="size-5 text-primary" aria-hidden />
        <div>
          <h1 className="eom-heading-section">Favoritos</h1>
          <p className="favorites-page__subtitle">
            Artículos guardados con filtros avanzados y acceso al explorador.
          </p>
        </div>
      </header>

      <FavoritesFilterBar
        filters={filters}
        options={filterOptions}
        resultCount={filteredFavorites.length}
        totalCount={favorites.length}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FAVORITES_FILTERS)}
      />

      {isLoading && (
        <p className="favorites-page__status">Cargando favoritos…</p>
      )}
      {isError && (
        <p className="favorites-page__status favorites-page__status--error">
          No se pudieron cargar los favoritos.
        </p>
      )}

      {!isLoading && !isError && filteredFavorites.length === 0 && (
        <p className="favorites-page__status">
          {favorites.length === 0
            ? "Aún no tienes favoritos."
            : "Ningún favorito coincide con los filtros."}
        </p>
      )}

      {!isLoading && !isError && filteredFavorites.length > 0 && (
        <div className="favorites-grid" role="list">
          {filteredFavorites.map((favorite) => (
            <FavoriteArticleCard
              key={favorite.article_id}
              favorite={favorite}
              activeWorkspaceName={activeWorkspaceName}
              isGuestMode={isGuestMode}
              onOpen={handleOpen}
              onAddToCurrent={(item) => handleAdd(item, "current")}
              onAddToNew={(item) => handleAdd(item, "new")}
            />
          ))}
        </div>
      )}

      <ArticleNodeModal
        node={articleModalNode}
        open={articleModalOpen}
        onOpenChange={setArticleModalOpen}
      />
    </div>
  )
}
