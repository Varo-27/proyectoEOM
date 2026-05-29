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
import { useState } from "react"

import {
  articleDetailQueryKey,
  createArticleComment,
  deleteComment,
  toggleArticleFavorite,
  updateComment,
  upsertArticleRating,
  type ArticleDetail,
} from "@/api/articles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import useCustomToast from "@/hooks/useCustomToast"
import { isLoggedIn } from "@/hooks/useAuth"
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

export function ArticleModalContent({ node, detail }: ArticleModalContentProps) {
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

        <div className="flex flex-wrap items-start justify-between gap-4 border-t-2 border-foreground pt-4">
          <div className="space-y-3 min-w-[200px]">
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

            {loggedIn && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Tu valoración
                </p>
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
              "inline-flex items-center gap-2 border-2 border-foreground px-4 py-2 text-[10px] uppercase tracking-widest transition-colors",
              detail?.is_favorited
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted",
              !loggedIn && "opacity-60",
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
            <div className="space-y-3 border-t-2 border-foreground px-4 py-3">
              {loggedIn && (
                <form
                  className="space-y-2"
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
                    disabled={
                      commentMutation.isPending || !commentDraft.trim()
                    }
                    className="rounded-none border-2 border-foreground uppercase tracking-widest text-[10px]"
                  >
                    Publicar
                  </Button>
                </form>
              )}

              <div className="max-h-56 space-y-3 overflow-y-auto">
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
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {comment.author_name}
                        {comment.is_own && (
                          <span className="ml-2 text-primary">(tú)</span>
                        )}
                      </p>
                      {comment.is_own && loggedIn && editingCommentId !== comment.id && (
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
                          onChange={(event) =>
                            setEditDraft(event.target.value)
                          }
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
                      <p className="mt-1 text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    )}

                    {editingCommentId !== comment.id && (
                      <p className="mt-1 text-[10px] text-muted-foreground">
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
