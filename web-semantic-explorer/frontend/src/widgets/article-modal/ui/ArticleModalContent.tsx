import { ExternalLink } from "lucide-react"

import type { ArticleDetail } from "@/entities/article"
import { formatArticleDate } from "@/entities/article/lib/formatArticleDate"
import type { AppNode } from "@/entities/graph"
import { CommentsSection } from "@/features/article-comments"
import { FavoriteButton } from "@/features/article-favorite"
import { PrivateNoteSection } from "@/features/article-notes"
import { RatingPanel } from "@/features/article-rating"
import { DialogHeader, DialogTitle } from "@/shared/ui/dialog"

import { ArticleModalTaxonomy } from "./ArticleModalTaxonomy"

type ArticleModalContentProps = {
  node: AppNode
  detail: ArticleDetail | undefined
}

export function ArticleModalContent({
  node,
  detail,
}: ArticleModalContentProps) {
  const articleId = Number(node.id)
  const displayTitle = detail?.title ?? node.data.title ?? "Sin título"
  const displayImage = detail?.image_url ?? node.data.imageUrl
  const displayAuthors = detail?.authors?.length
    ? detail.authors
    : node.data.author_name
      ? [node.data.author_name]
      : []
  const displayExcerpt = detail?.excerpt ?? node.data.excerpt
  const displayUrl = detail?.url ?? node.data.url
  const displayImageCaption =
    typeof node.data.imageCaption === "string"
      ? node.data.imageCaption.trim() || null
      : null
  const hasTaxonomy =
    detail &&
    (detail.categories.length > 0 ||
      detail.places.length > 0 ||
      displayAuthors.length > 0)

  return (
    <div className="graph-article-modal__layout">
      <div className="graph-article-modal__primary">
        {displayImage && (
          <figure className="graph-article-modal__hero">
            <div className="graph-article-modal__hero-media">
              <img src={displayImage} alt={displayTitle} />
            </div>
            {displayImageCaption && (
              <figcaption className="graph-article-modal__hero-caption">
                {displayImageCaption}
              </figcaption>
            )}
          </figure>
        )}

        <div className="graph-article-modal__body">
          <header className="graph-article-modal__header">
            <DialogHeader className="space-y-0 text-left">
              <p className="graph-article-modal__kicker">Artículo</p>
              <DialogTitle className="graph-article-modal__title mt-2">
                <span className="eom-title-highlight">{displayTitle}</span>
              </DialogTitle>
            </DialogHeader>

            {detail?.date && (
              <time className="graph-article-modal__date" dateTime={detail.date}>
                {formatArticleDate(detail.date)}
              </time>
            )}

            {displayExcerpt && (
              <p className="graph-article-modal__excerpt">{displayExcerpt}</p>
            )}

            {displayUrl && (
              <a
                href={displayUrl}
                target="_blank"
                rel="noreferrer"
                className="graph-article-modal__original-link"
              >
                Abrir artículo original
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
              </a>
            )}
          </header>

          {hasTaxonomy && detail && (
            <ArticleModalTaxonomy
              articleId={articleId}
              categories={detail.categories}
              places={detail.places}
              authors={displayAuthors}
              followTargets={detail.follow_targets ?? []}
            />
          )}
        </div>
      </div>

      <div className="graph-article-modal__secondary">
        <div className="graph-article-modal__panel">
          <RatingPanel
            articleId={articleId}
            averageRating={detail?.average_rating}
            ratingsCount={detail?.ratings_count}
            userRating={detail?.user_rating}
          />
          <FavoriteButton
            articleId={articleId}
            isFavorited={detail?.is_favorited ?? false}
          />
        </div>

        <PrivateNoteSection
          articleId={articleId}
          userNote={detail?.user_note}
          userNoteUpdatedAt={detail?.user_note_updated_at}
        />

        <CommentsSection articleId={articleId} comments={detail?.comments} />
      </div>
    </div>
  )
}
