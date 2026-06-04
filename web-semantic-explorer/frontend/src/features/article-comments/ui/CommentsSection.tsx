import { ChevronDown, MessageSquare, Pencil, Trash2 } from "lucide-react"
import { Link as RouterLink } from "@tanstack/react-router"
import { useState } from "react"

import type { ArticleComment } from "@/entities/article"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { isLoggedIn } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

import { formatArticleDate } from "@/entities/article/lib/formatArticleDate"
import { useArticleComments } from "../lib/useArticleComments"

type CommentsSectionProps = {
  articleId: number
  comments: ArticleComment[] | undefined
}

export function CommentsSection({ articleId, comments }: CommentsSectionProps) {
  const [commentsOpen, setCommentsOpen] = useState(true)
  const [commentDraft, setCommentDraft] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editDraft, setEditDraft] = useState("")
  const loggedIn = isLoggedIn()
  const {
    createComment,
    updateComment,
    deleteComment,
    isCreating,
    isUpdating,
    isDeleting,
  } = useArticleComments(articleId)

  return (
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
          {comments && (
            <span className="text-muted-foreground">({comments.length})</span>
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
                createComment(trimmed, {
                  onSuccess: () => setCommentDraft(""),
                })
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
                disabled={isCreating || !commentDraft.trim()}
                className="rounded-none border-2 border-foreground uppercase tracking-widest text-[10px]"
              >
                Publicar
              </Button>
            </form>
          )}

          <div className="graph-article-modal__comments-list">
            {!comments?.length && (
              <p className="graph-article-modal__comments-empty">
                Aún no hay comentarios en este artículo.
              </p>
            )}
            {comments?.map((comment) => (
              <article key={comment.id} className="graph-article-modal__comment">
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
                          disabled={isDeleting}
                          onClick={() => deleteComment(comment.id)}
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
                      updateComment(
                        { id: comment.id, content: trimmed },
                        {
                          onSuccess: () => {
                            setEditingCommentId(null)
                            setEditDraft("")
                          },
                        },
                      )
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
                        disabled={isUpdating}
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
  )
}
