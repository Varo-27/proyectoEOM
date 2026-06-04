import { ChevronDown, NotebookPen } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/shared/ui/button"
import { Textarea } from "@/shared/ui/textarea"
import { isLoggedIn } from "@/shared/auth"
import { cn } from "@/shared/lib/utils"

import { formatArticleDate } from "@/entities/article/lib/formatArticleDate"
import { useArticleNote } from "../lib/useArticleNote"

type PrivateNoteSectionProps = {
  articleId: number
  userNote: string | null | undefined
  userNoteUpdatedAt: string | null | undefined
}

export function PrivateNoteSection({
  articleId,
  userNote,
  userNoteUpdatedAt,
}: PrivateNoteSectionProps) {
  const [noteOpen, setNoteOpen] = useState(true)
  const [noteDraft, setNoteDraft] = useState("")
  const loggedIn = isLoggedIn()
  const { mutate, isPending } = useArticleNote(articleId)

  useEffect(() => {
    setNoteDraft(userNote ?? "")
  }, [userNote, articleId])

  if (!loggedIn) {
    return null
  }

  return (
    <div className="graph-article-modal__comments">
      <button
        type="button"
        aria-expanded={noteOpen}
        onClick={() => setNoteOpen((value) => !value)}
        className="graph-article-modal__comments-toggle"
      >
        <span className="inline-flex items-center gap-2">
          <NotebookPen className="h-3.5 w-3.5" />
          Nota privada
          {userNote?.trim() && <span className="text-primary">(guardada)</span>}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            noteOpen && "rotate-180",
          )}
        />
      </button>

      {noteOpen && (
        <form
          className="graph-article-modal__comments-body space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            mutate(noteDraft)
          }}
        >
          <p className="text-xs text-muted-foreground">
            Solo tú puedes ver esta nota. Puedes usar texto libre o markdown
            ligero.
          </p>
          <Textarea
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            placeholder="Apuntes de investigación, hipótesis, enlaces…"
            rows={4}
            className="rounded-none border-2 border-foreground text-sm"
          />
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="rounded-none border-2 border-foreground uppercase tracking-widest text-[10px]"
            >
              Guardar nota
            </Button>
            {userNoteUpdatedAt && (
              <span className="font-mono text-[10px] text-muted-foreground">
                Actualizada {formatArticleDate(userNoteUpdatedAt)}
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
