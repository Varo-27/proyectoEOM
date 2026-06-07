import { useMutation } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { GripVertical, Search, Star } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import {
  defaultFavoriteInjectPosition,
  EMPTY_FAVORITES_FILTERS,
  filterFavorites,
  injectFavoriteToGraph,
  useFavoritesList,
} from "@/features/favorites"
import type { FavoriteArticle } from "@/shared/api/workspaces"
import { isLoggedIn } from "@/shared/auth"
import { cn } from "@/shared/lib/utils"
import { Input } from "@/shared/ui/input"

import {
  type PaletteArticleDragData,
  setPaletteDragData,
} from "../palette/paletteDrag"

type ExplorerDragSidebarProps = {
  disabled?: boolean
}

const dragTileClass =
  "eom-draggable flex items-center gap-2 font-mono text-xs uppercase tracking-wider"

const favoriteItemClass =
  "eom-draggable flex w-full items-start gap-2 whitespace-normal px-2 py-2 text-left text-[11px]"

function toPaletteArticleDragData(
  favorite: FavoriteArticle,
): PaletteArticleDragData {
  return {
    article_id: favorite.article_id,
    title: favorite.title,
    excerpt: favorite.excerpt,
    image_url: favorite.image_url,
    url: favorite.url,
    authors: favorite.authors,
    categories: favorite.categories,
  }
}

export function ExplorerDragSidebar({ disabled }: ExplorerDragSidebarProps) {
  const loggedIn = isLoggedIn()
  const [search, setSearch] = useState("")
  const didDragRef = useRef(false)

  const { data, isLoading, isError } = useFavoritesList()

  const filtered = useMemo(
    () =>
      filterFavorites(data?.data ?? [], {
        ...EMPTY_FAVORITES_FILTERS,
        search,
      }),
    [data?.data, search],
  )

  const injectMutation = useMutation({
    mutationFn: async (favorite: FavoriteArticle) => {
      const added = injectFavoriteToGraph(
        favorite,
        defaultFavoriteInjectPosition(),
      )

      if (!added) {
        toast.message("Ya está en el lienzo", {
          description: favorite.title ?? `Artículo ${favorite.article_id}`,
        })
        return
      }

      toast.success("Artículo añadido al lienzo")
    },
  })

  const handleFavoriteClick = (favorite: FavoriteArticle) => {
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }

    injectMutation.mutate(favorite)
  }

  const favoritesDisabled = disabled || injectMutation.isPending

  return (
    <div className="graph-drag-sidebar">
      <div>
        <h2 className="eom-heading-section">Arrastrar al lienzo</h2>
        <p className="graph-drag-sidebar__hint">
          Arrastra una búsqueda o un favorito al grafo. También puedes hacer
          clic en un favorito para añadirlo.
        </p>
      </div>

      <section className="graph-drag-sidebar__section">
        <h3 className="graph-drag-sidebar__section-title">Búsqueda</h3>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          draggable={!disabled}
          aria-label="Arrastrar nueva búsqueda al lienzo"
          className={cn(
            dragTileClass,
            "h-10 justify-start bg-background px-3",
            disabled && "pointer-events-none opacity-50",
          )}
          onDragStart={(event) => {
            setPaletteDragData(event, { type: "query" })
          }}
        >
          <Search className="h-4 w-4 shrink-0 text-primary" />
          Nueva búsqueda
        </div>
      </section>

      {loggedIn && (
        <section className="graph-drag-sidebar__section">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-primary" />
              <h3 className="graph-drag-sidebar__section-title mb-0">
                Favoritos
              </h3>
            </div>
            <Link
              to="/favorites"
              className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Ver todos
            </Link>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute top-2.5 left-2 size-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Filtrar favoritos…"
              className="h-8 rounded-none border-foreground/40 pl-8 text-xs"
              aria-label="Filtrar favoritos"
            />
          </div>

          {isLoading && (
            <p className="text-xs text-muted-foreground">Cargando favoritos…</p>
          )}
          {isError && (
            <p className="text-xs text-destructive">
              No se pudieron cargar favoritos
            </p>
          )}

          <div className="graph-drag-sidebar__list max-h-48 overflow-y-auto">
            <ul className="flex flex-col gap-1.5 pr-2">
              {filtered.map((favorite) => (
                <li key={favorite.article_id}>
                  <div
                    role="button"
                    tabIndex={favoritesDisabled ? -1 : 0}
                    draggable={!favoritesDisabled}
                    aria-label={`Arrastrar al lienzo: ${favorite.title ?? `Artículo ${favorite.article_id}`}`}
                    aria-disabled={favoritesDisabled}
                    className={cn(
                      favoriteItemClass,
                      favoritesDisabled && "pointer-events-none opacity-50",
                    )}
                    onClick={() => handleFavoriteClick(favorite)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        handleFavoriteClick(favorite)
                      }
                    }}
                    onDragStart={(event) => {
                      didDragRef.current = true
                      setPaletteDragData(event, {
                        type: "article",
                        favorite: toPaletteArticleDragData(favorite),
                      })
                      event.stopPropagation()
                    }}
                    onDragEnd={() => {
                      window.setTimeout(() => {
                        didDragRef.current = false
                      }, 0)
                    }}
                  >
                    <GripVertical
                      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="line-clamp-2 font-medium">
                      {favorite.title ?? `Artículo ${favorite.article_id}`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {!isLoading && !isError && filtered.length === 0 && (
            <p className="text-xs text-muted-foreground">
              {(data?.count ?? 0) === 0
                ? "Aún no tienes favoritos."
                : "Ningún favorito coincide con el filtro."}
            </p>
          )}
        </section>
      )}

      {!loggedIn && (
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Inicia sesión para arrastrar tus favoritos al grafo.
        </p>
      )}
    </div>
  )
}
