import { isLoggedIn } from "@/hooks/useAuth"

import { useArticleRating } from "../lib/useArticleRating"
import { InteractiveStarRating } from "./InteractiveStarRating"
import { StarRating } from "./StarRating"

type RatingPanelProps = {
  articleId: number
  averageRating: number | null | undefined
  ratingsCount: number | undefined
  userRating: number | null | undefined
}

export function RatingPanel({
  articleId,
  averageRating,
  ratingsCount,
  userRating,
}: RatingPanelProps) {
  const loggedIn = isLoggedIn()
  const { mutate, isPending } = useArticleRating(articleId)

  return (
    <div className="graph-article-modal__panel-block">
      <div className="space-y-2">
        <p className="graph-article-modal__panel-label">Valoración media</p>
        <div className="graph-article-modal__rating-row">
          {averageRating != null ? (
            <>
              <StarRating value={averageRating} />
              <span className="font-mono text-sm font-bold">
                {averageRating.toFixed(1)} / 5
              </span>
              <span className="text-xs text-muted-foreground">
                ({ratingsCount ?? 0})
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Sin valoraciones</span>
          )}
        </div>
      </div>

      {loggedIn && (
        <div className="space-y-2">
          <p className="graph-article-modal__panel-label">Tu valoración</p>
          <InteractiveStarRating
            value={userRating ?? null}
            disabled={isPending}
            onChange={(value) => mutate(value)}
          />
        </div>
      )}
    </div>
  )
}
