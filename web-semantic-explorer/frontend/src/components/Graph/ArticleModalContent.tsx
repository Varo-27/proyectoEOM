import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  ChevronDown,
  ExternalLink,
  Heart,
  MapPin,
  MessageSquare,
  Pencil,
  Tag,
  Trash2,
} from "lucide-react"
import { Link as RouterLink } from "@tanstack/react-router"
import { useState } from "react"

import {
  type ArticleDetail,
  articleDetailQueryKey,
  createArticleComment,
  deleteComment,
  toggleArticleFavorite,
  updateComment,
  upsertArticleRating,
} from "@/api/articles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { cn } from "@/lib/utils"
import type { AppNode } from "@/store/useGraphStore"

import { formatArticleDate } from "./articleModalUtils"
import { InteractiveStarRating } from "./InteractiveStarRating"
import { StarRating } from "./StarRating"

type ArticleModalContentProps = {
  node: AppNode
  detail: ArticleDetail | undefined
}

function patchDetail(
  current: ArticleDetail | undefined,
  patch: Partial<ArticleDetail>,
): ArticleDetail | undefined {
  return current ? { ...current, ...patch } : current
}

export function ArticleModalContent({
  node,
  detail,
}: ArticleModalContentProps) {
  const [commentsOpen, setCommentsOpen] = useState(true)
  const [commentDraft, setCommentDraft] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState("")
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const articleId = Number(node.id)
  const detailKey = articleDetailQueryKey(articleId)
  const loggedIn = isLoggedIn()

  const favoriteMutation = useMutation({
    mutationFn: () => toggleArticleFavorite(articleId),
    onSuccess: (response) => {
      queryClient.setQueryData<ArticleDetail>(detailKey, (current) =>
        patchDetail(current, { is_favorited: response.is_favorited }),
      )
      showSuccessToast(
        response.is_favorited
          ? "Artículo guardado en favoritos"
          : "Artículo eliminado de favoritos",
      )
    },
    onError: () => showErrorToast("No se pudo actualizar el favorito"),
  })

  const ratingMutation = useMutation({
    mutationFn: (value: number) => upsertArticleRating(articleId, value),
    onSuccess: (summary) => {
      queryClient.setQueryData<ArticleDetail>(detailKey, (current) =>
        patchDetail(current, {
          user_rating: summary.user_rating,
          average_rating: summary.average_rating,
          ratings_count: summary.ratings_count,
        }),
      )
      showSuccessToast("Valoración guardada")
    },
    onError: () => showErrorToast("No se pudo guardar la valoración"),
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) => createArticleComment(articleId, content),
    onSuccess: async () => {
      setCommentDraft("")
      await queryClient.invalidateQueries({ queryKey: detailKey })
      showSuccessToast("Comentario publicado")
    },
    onError: () => showErrorToast("No se pudo publicar el comentario"),
  })

  const updateCommentMutation = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      updateComment(id, content),
    onSuccess: async () => {
      setEditingCommentId(null)
      setEditDraft("")
      await queryClient.invalidateQueries({ queryKey: detailKey })
      showSuccessToast("Comentario actualizado")
    },
    onError: () => showErrorToast("No se pudo editar el comentario"),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: detailKey })
      showSuccessToast("Comentario eliminado")
    },
    onError: () => showErrorToast("No se pudo eliminar el comentario"),
  })

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
    (detail.categories.length > 0 || detail.places.length > 0)

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

        {hasTaxonomy && (
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
          </div>
        )}

        <div className="graph-article-modal__panel">
          <div className="graph-article-modal__panel-block">
            <div className="space-y-2">
              <p className="graph-article-modal__panel-label">Valoración media</p>
              <div className="graph-article-modal__rating-row">
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

            {loggedIn && (
              <div className="space-y-2">
                <p className="graph-article-modal__panel-label">Tu valoración</p>
                <InteractiveStarRating
                  value={detail?.user_rating ?? null}
                  disabled={ratingMutation.isPending}
                  onChange={(value) => ratingMutation.mutate(value)}
                />
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!loggedIn || favoriteMutation.isPending}
            aria-busy={favoriteMutation.isPending || undefined}
            aria-pressed={detail?.is_favorited ?? false}
            onClick={() => {
              if (!loggedIn) {
                showErrorToast("Inicia sesión para guardar favoritos")
                return
              }
              favoriteMutation.mutate()
            }}
            className={cn(
              "graph-article-modal__favorite",
              detail?.is_favorited
                ? "graph-article-modal__favorite--active"
                : "graph-article-modal__favorite--idle",
              !loggedIn && "opacity-60",
            )}
          >
            <Heart
              className={cn("h-4 w-4", detail?.is_favorited && "fill-current")}
            />
            {detail?.is_favorited ? "En favoritos" : "Favorito"}
          </button>
        </div>

        <div className="graph-article-modal__comments">
          <button
            type="button"
            aria-expanded={commentsOpen}
            onClick={() => setCommentsOpen((value) => !value)}
            className="graph-article-modal__comments-toggle"
          >
            <span className="inline-flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5" />
              Comentarios
              {detail && (
                <span className="text-muted-foreground">
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
            <div className="graph-article-modal__comments-body">
              {!loggedIn && (
                <p className="rounded-none border border-dashed border-foreground/30 bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
                  <RouterLink
                    to="/login"
                    className="font-medium text-primary underline underline-offset-2"
                  >
                    Inicia sesión
                  </RouterLink>{" "}
                  para publicar comentarios o guardar favoritos.
                </p>
              )}

              {loggedIn && (
                <form
                  className="space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault()
                    const trimmed = commentDraft.trim()
                    if (!trimmed) return
                    commentMutation.mutate(trimmed)
                  }}
                >
                  <Textarea
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder="Escribe un comentario…"
                    rows={3}
                    className="rounded-none border-2 border-foreground text-sm"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={commentMutation.isPending || !commentDraft.trim()}
                    className="rounded-none border-2 border-foreground uppercase tracking-widest text-[10px]"
                  >
                    Publicar
                  </Button>
                </form>
              )}

              <div className="graph-article-modal__comments-list">
                {!detail?.comments.length && (
                  <p className="graph-article-modal__comments-empty">
                    Aún no hay comentarios en este artículo.
                  </p>
                )}
                {detail?.comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="graph-article-modal__comment"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {comment.author_name}
                        {comment.is_own && (
                          <span className="ml-2 text-primary">(tú)</span>
                        )}
                      </p>
                      {comment.is_own &&
                        loggedIn &&
                        editingCommentId !== comment.id && (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              aria-label="Editar comentario"
                              className="p-1 text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                setEditingCommentId(comment.id)
                                setEditDraft(comment.content)
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              aria-label="Eliminar comentario"
                              className="p-1 text-muted-foreground hover:text-destructive"
                              disabled={deleteCommentMutation.isPending}
                              onClick={() =>
                                deleteCommentMutation.mutate(comment.id)
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                    </div>

                    {editingCommentId === comment.id ? (
                      <form
                        className="mt-2 space-y-2"
                        onSubmit={(event) => {
                          event.preventDefault()
                          const trimmed = editDraft.trim()
                          if (!trimmed) return
                          updateCommentMutation.mutate({
                            id: comment.id,
                            content: trimmed,
                          })
                        }}
                      >
                        <Textarea
                          value={editDraft}
                          onChange={(event) => setEditDraft(event.target.value)}
                          rows={2}
                          className="rounded-none border-2 border-foreground text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={updateCommentMutation.isPending}
                            className="rounded-none text-[10px] uppercase"
                          >
                            Guardar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-none text-[10px] uppercase"
                            onClick={() => {
                              setEditingCommentId(null)
                              setEditDraft("")
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <p className="graph-article-modal__comment-text">
                        {comment.content}
                      </p>
                    )}

                    {editingCommentId !== comment.id && (
                      <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">
                        {formatArticleDate(comment.created_at)}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>

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
