import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  ChevronDown,
  ExternalLink,
  Heart,
  Loader2,
  MapPin,
  MessageSquare,
  Star,
  Tag,
} from "lucide-react"
import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import useCustomToast from "@/hooks/useCustomToast"
import { cn } from "@/lib/utils"
import {
  type ArticleDetail,
  fetchArticleDetailMock,
  toggleFavoriteMock,
} from "@/mocks/articleDetail.mock"
import type { AppNode } from "@/store/useGraphStore"

type ArticleNodeModalProps = {
  node: AppNode | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function StarRating({
  value,
  max = 5,
  size = "md",
}: {
  value: number
  max?: number
  size?: "sm" | "md"
}) {
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"

  return (
    <div className="flex items-center gap-0.5" aria-label={`Valoración ${value} de ${max}`}>
      {Array.from({ length: max }, (_, index) => {
        const filled = index < Math.round(value)
        return (
          <Star
            key={index}
            className={cn(
              iconClass,
              filled
                ? "fill-primary text-primary"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        )
      })}
    </div>
  )
}

function formatDate(value: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value))
}

export function ArticleNodeModal({
  node,
  open,
  onOpenChange,
}: ArticleNodeModalProps) {
  const [commentsOpen, setCommentsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const articleId = node ? Number(node.id) : NaN

  useEffect(() => {
    if (!open) {
      setCommentsOpen(false)
    }
  }, [open])

  const { data: detail, isLoading } = useQuery<ArticleDetail>({
    queryKey: ["article-detail-mock", node?.id],
    queryFn: () => fetchArticleDetailMock(node as AppNode),
    enabled: open && node != null,
  })

  const favoriteMutation = useMutation({
    mutationFn: () => toggleFavoriteMock(articleId),
    onSuccess: (response) => {
      queryClient.setQueryData<ArticleDetail>(
        ["article-detail-mock", node?.id],
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

  const displayTitle = detail?.title ?? node?.data.title ?? "Sin título"
  const displayImage = detail?.image_url ?? node?.data.imageUrl
  const displayAuthors =
    detail?.authors?.length
      ? detail.authors.join(", ")
      : node?.data.author_name
  const displayExcerpt = detail?.excerpt ?? node?.data.excerpt
  const displayUrl = detail?.url ?? node?.data.url

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[min(90vh,820px)] overflow-y-auto border-2 border-foreground p-0 shadow-[6px_6px_0_0_var(--color-foreground)] sm:max-w-2xl"
      >
        {isLoading && (
          <div className="flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando artículo…
          </div>
        )}

        {!isLoading && node && (
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
                <DialogTitle className="font-serif text-2xl font-bold leading-tight">
                  {displayTitle}
                </DialogTitle>
                {displayAuthors && (
                  <DialogDescription className="text-[11px] uppercase tracking-widest text-muted-foreground">
                    Por {displayAuthors}
                  </DialogDescription>
                )}
                {detail?.date && (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(detail.date)}
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
                          {formatDate(comment.created_at)}
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
        )}
      </DialogContent>
    </Dialog>
  )
}
