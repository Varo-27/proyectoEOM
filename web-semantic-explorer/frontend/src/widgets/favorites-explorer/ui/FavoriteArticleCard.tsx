import { StarRating } from "@/features/article-rating"
import type { FavoriteArticle } from "@/shared/api/workspaces"
import { cn } from "@/shared/lib/utils"

import { FavoriteArticleAddMenu } from "./FavoriteArticleAddMenu"

type FavoriteArticleCardProps = {
  favorite: FavoriteArticle
  activeWorkspaceName?: string
  isGuestMode: boolean
  onOpen: (favorite: FavoriteArticle) => void
  onAddToCurrent: (favorite: FavoriteArticle) => void
  onAddToNew: (favorite: FavoriteArticle) => void
}

export function FavoriteArticleCard({
  favorite,
  activeWorkspaceName,
  isGuestMode,
  onOpen,
  onAddToCurrent,
  onAddToNew,
}: FavoriteArticleCardProps) {
  const title = favorite.title?.trim() || "Sin título"

  return (
    <article className="favorites-card">
      <button
        type="button"
        className={cn("eom-tile-card favorites-card__open")}
        onClick={() => onOpen(favorite)}
      >
        {favorite.image_url ? (
          <img
            src={favorite.image_url}
            alt=""
            className="favorites-card__thumb"
            loading="lazy"
          />
        ) : (
          <span className="favorites-card__thumb-fallback" aria-hidden>
            EOM
          </span>
        )}
        <span className="favorites-card__body">
          <span className="favorites-card__title">{title}</span>
          {favorite.authors.length > 0 && (
            <span className="favorites-card__meta">{favorite.authors[0]}</span>
          )}
          {favorite.average_rating != null ? (
            <span className="favorites-card__rating">
              <StarRating value={favorite.average_rating} size="sm" />
              <span className="favorites-card__rating-value">
                {favorite.average_rating.toFixed(1)}
              </span>
            </span>
          ) : (
            <span className="favorites-card__empty">Sin valoraciones</span>
          )}
        </span>
      </button>

      <FavoriteArticleAddMenu
        articleTitle={title}
        activeWorkspaceName={activeWorkspaceName}
        isGuestMode={isGuestMode}
        onAddToCurrent={() => onAddToCurrent(favorite)}
        onAddToNew={() => onAddToNew(favorite)}
      />
    </article>
  )
}
