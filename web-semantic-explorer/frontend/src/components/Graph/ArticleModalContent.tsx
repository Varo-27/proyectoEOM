import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ChevronDown,
  ExternalLink,
  Heart,
  MapPin,
  MessageSquare,
  Tag,
} from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import useCustomToast from "@/hooks/useCustomToast"
import { cn } from "@/lib/utils"
import {
  type ArticleDetail,
  toggleFavoriteMock,
} from "@/mocks/articleDetail.mock"
import type { AppNode } from "@/store/useGraphStore"

import { formatArticleDate } from "./articleModalUtils"
import { StarRating } from "./StarRating"

type ArticleModalContentProps = {
  node: AppNode
  detail: ArticleDetail | undefined
}

export function ArticleModalContent({ node, detail }: ArticleModalContentProps) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const articleId = Number(node.id)

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavoriteMock(articleId),
    onSuccess: (response) => {
      queryClient.setQueryData<ArticleDetail>(
        ["article-detail-mock", node.id],
        (current) =>
          current ? { ...current, is_favorited: response.is_favorited } : current,
      )
      showSuccessToast(
        response.is_favorited
          ? "Artículo guardado en favoritos (mock)"
          : "Artículo eliminado de favoritos (mock)",
      )
    },
  })

  const displayTitle = detail?.title ?? node.data.title ?? "Sin título"
  const displayImage = detail?.image_url ?? node.data.imageUrl
  const displayAuthors =
    detail?.authors?.length
      ? detail.authors.join(", ")
      : node.data.author_name
  const displayExcerpt = detail?.excerpt ?? node.data.excerpt
  const displayUrl = detail?.url ?? node.data.url

  return (
    <>
      {displayImage && (
        <div className="h-48 w-full overflow-hidden border-b-2 border-foreground">
          <img
            src={displayImage}
            alt={displayTitle}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="space-y-5 px-6 py-5">
        <DialogHeader className="space-y-3 text-left">
          <p className="text-[10px] uppercase font-mono tracking-widest text-primary font-bold">
            Artículo
            <span className="ml-2 text-muted-foreground">· datos mock</span>
          </p>
          <DialogTitle className="font-serif text-2xl font-bold leading-tight text-pretty">
            <span className="eom-title-highlight">{displayTitle}</span>
          </DialogTitle>
          {displayAuthors && (
            <DialogDescription className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Por {displayAuthors}
            </DialogDescription>
          )}
          {detail?.date && (
            <p className="text-xs text-muted-foreground">
              {formatArticleDate(detail.date)}
            </p>
          )}
        </DialogHeader>

        {displayExcerpt && (
          <p className="text-sm leading-relaxed text-muted-foreground border-l-2 border-primary/40 pl-3">
            {displayExcerpt}
          </p>
        )}

        {detail && detail.categories.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              Categorías
            </div>
            <div className="flex flex-wrap gap-2">
              {detail.categories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="rounded-none border-foreground text-[10px] uppercase tracking-wider"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </section>
        )}

        {detail && detail.places.length > 0 && (
          <section className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Lugares
            </div>
            <div className="flex flex-wrap gap-2">
              {detail.places.map((place) => (
                <Badge
                  key={place}
                  variant="secondary"
                  className="rounded-none text-[10px] uppercase tracking-wider"
                >
                  {place}
                </Badge>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-foreground pt-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Valoración media
            </p>
            <div className="flex items-center gap-2">
              {detail?.average_rating != null ? (
                <>
                  <StarRating value={detail.average_rating} />
                  <span className="font-mono text-sm font-bold">
                    {detail.average_rating.toFixed(1)} / 5
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({detail.ratings_count})
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Sin valoraciones
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={favoriteMutation.isPending}
            aria-busy={favoriteMutation.isPending || undefined}
            aria-pressed={detail?.is_favorited ?? false}
            onClick={() => favoriteMutation.mutate()}
            className={cn(
              "inline-flex items-center gap-2 border-2 border-foreground px-4 py-2 text-[10px] uppercase tracking-widest transition-colors",
              detail?.is_favorited
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted",
            )}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                detail?.is_favorited && "fill-current",
              )}
            />
            {detail?.is_favorited ? "En favoritos" : "Favorito"}
          </button>
        </div>

        <div className="border-2 border-foreground">
          <button
            type="button"
            aria-expanded={commentsOpen}
            onClick={() => setCommentsOpen((value) => !value)}
            className="flex w-full items-center justify-between gap-3 bg-muted/60 px-4 py-3 text-left text-[10px] uppercase tracking-widest"
          >
            <span className="inline-flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5" />
              Comentarios
              {detail && (
                <span className="font-mono text-muted-foreground">
                  ({detail.comments.length})
                </span>
              )}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                commentsOpen && "rotate-180",
              )}
            />
          </button>

          {commentsOpen && (
            <div className="max-h-56 space-y-3 overflow-y-auto border-t-2 border-foreground px-4 py-3">
              {!detail?.comments.length && (
                <p className="text-sm text-muted-foreground">
                  Aún no hay comentarios en este artículo.
                </p>
              )}
              {detail?.comments.map((comment) => (
                <article
                  key={comment.id}
                  className="border-l-2 border-primary/30 pl-3"
                >
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {comment.author_name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">
                    {comment.content}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatArticleDate(comment.created_at)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>

        {displayUrl && (
          <a
            href={displayUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-foreground underline decoration-primary underline-offset-4"
          >
            Abrir artículo original
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </>
  )
}
