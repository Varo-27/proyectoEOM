import { Plus, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/shared/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

type FavoriteArticleAddMenuProps = {
  articleTitle: string
  activeWorkspaceName?: string
  isGuestMode: boolean
  onAddToCurrent: () => void
  onAddToNew: () => void
}

export function FavoriteArticleAddMenu({
  articleTitle,
  activeWorkspaceName,
  isGuestMode,
  onAddToCurrent,
  onAddToNew,
}: FavoriteArticleAddMenuProps) {
  const [open, setOpen] = useState(false)
  const menuId = `favorite-add-${articleTitle.replace(/\s+/g, "-").slice(0, 24)}`

  const pick = (action: () => void) => {
    setOpen(false)
    action()
  }

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Añadir ${articleTitle} a la investigación`}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          className={cn(
            "favorites-card__add-btn",
            open && "favorites-card__add-btn--open",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        id={menuId}
        align="end"
        side="bottom"
        sideOffset={4}
        className={cn(
          "graph-node__filter-menu",
          "eom-surface-brutal",
          "w-44 rounded-none border-foreground bg-background p-2 shadow-none",
        )}
        onClick={(event) => event.stopPropagation()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex items-start gap-1">
          <p className="graph-node__filter-menu-title flex-1" id={menuId}>
            Añadir
          </p>
          <button
            type="button"
            aria-label="Cerrar"
            className="graph-node__delete-close"
            onClick={() => setOpen(false)}
          >
            <X className="graph-node__icon" />
          </button>
        </div>
        <div
          className="mt-1 flex flex-col gap-1"
          role="group"
          aria-labelledby={menuId}
        >
          <button
            type="button"
            className="graph-node__filter-option py-1.5"
            onClick={() => pick(onAddToCurrent)}
          >
            <span className="truncate">
              {activeWorkspaceName ?? "Área actual"}
            </span>
          </button>
          <button
            type="button"
            className="graph-node__filter-option py-1.5"
            disabled={isGuestMode}
            title={
              isGuestMode
                ? "Inicia sesión para crear varias áreas de trabajo"
                : undefined
            }
            onClick={() => pick(onAddToNew)}
          >
            Nuevo
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
