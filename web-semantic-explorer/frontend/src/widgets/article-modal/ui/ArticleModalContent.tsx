import { ExternalLink, MapPin, Tag } from "lucide-react"

import type { ArticleDetail } from "@/entities/article"
import { formatArticleDate } from "@/entities/article/lib/formatArticleDate"
import { Badge } from "@/shared/ui/badge"
import { DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { CommentsSection } from "@/features/article-comments"
import { FavoriteButton } from "@/features/article-favorite"
import { FollowTargetsList } from "@/features/article-follow"
import { PrivateNoteSection } from "@/features/article-notes"
import { RatingPanel } from "@/features/article-rating"
import type { AppNode } from "@/entities/graph"

type ArticleModalContentProps = {
  node: AppNode
  detail: ArticleDetail | undefined
}

export function ArticleModalContent({ node, detail }: ArticleModalContentProps) {
  const articleId = Number(node.id)
  const displayTitle = detail?.title ?? node.data.title ?? "Sin título"
  const displayImage = detail?.image_url ?? node.data.imageUrl
  const displayAuthors = detail?.authors?.length
    ? detail.authors.join(", ")
    : node.data.author_name
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
      (detail.follow_targets?.length ?? 0) > 0)

  return (
    <>
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

          {(displayAuthors || detail?.date) && (
            <div className="graph-article-modal__meta">
              {displayAuthors && (
                <p className="graph-article-modal__byline">Por {displayAuthors}</p>
              )}
              {displayAuthors && detail?.date && (
                <span
                  className="graph-article-modal__meta-sep"
                  aria-hidden
                />
              )}
              {detail?.date && (
                <time className="graph-article-modal__date" dateTime={detail.date}>
                  {formatArticleDate(detail.date)}
                </time>
              )}
            </div>
          )}

          {displayExcerpt && (
            <p className="graph-article-modal__excerpt">{displayExcerpt}</p>
          )}
        </header>

        {hasTaxonomy && detail && (
          <div className="graph-article-modal__sections">
            {detail.categories.length > 0 && (
              <section className="graph-article-modal__section">
                <div className="graph-article-modal__section-label">
                  <Tag className="h-3.5 w-3.5 shrink-0" />
                  Categorías
                </div>
                <div className="flex flex-wrap gap-2">
                  {detail.categories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="graph-article-modal__badge"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {detail.places.length > 0 && (
              <section className="graph-article-modal__section">
                <div className="graph-article-modal__section-label">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  Lugares
                </div>
                <div className="flex flex-wrap gap-2">
                  {detail.places.map((place) => (
                    <Badge
                      key={place}
                      variant="secondary"
                      className="graph-article-modal__badge"
                    >
                      {place}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            <FollowTargetsList
              articleId={articleId}
              targets={detail.follow_targets ?? []}
            />
          </div>
        )}

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

        {displayUrl && (
          <a
            href={displayUrl}
            target="_blank"
            rel="noreferrer"
            className="graph-article-modal__footer-link"
          >
            Abrir artículo original
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </>
  )
}
