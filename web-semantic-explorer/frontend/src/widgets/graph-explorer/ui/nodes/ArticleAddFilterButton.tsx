import { Filter, MapPin, Tag, User, X } from "lucide-react"
import { useState, type MouseEvent } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"

import type { ArticleExpandFilterKind } from "@/entities/graph"

type ArticleAddFilterButtonProps = {
  articleId: string
  disabled?: boolean
  onAddFilter: (kind: ArticleExpandFilterKind) => void
}

function stopGraphPointer(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
}

export function ArticleAddFilterButton({
  articleId,
  disabled = false,
  onAddFilter,
}: ArticleAddFilterButtonProps) {
  const [open, setOpen] = useState(false)
  const menuId = `add-filter-menu-${articleId}`

  const handlePick = (kind: ArticleExpandFilterKind) => {
    setOpen(false)
    onAddFilter(kind)
  }

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          aria-label="Añadir filtro"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={menuId}
          disabled={disabled}
          className={cn(
            "graph-node__btn-filter nodrag nopan",
            open && "graph-node__btn-filter--open",
          )}
          onClick={stopGraphPointer}
          onMouseDown={stopGraphPointer}
        >
          <Filter className="graph-node__icon" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        id={menuId}
        align="end"
        side="top"
        className={cn(
          "graph-node__filter-menu",
          "eom-brutal-border eom-shadow-xs eom-surface-flat",
          "rounded-none border-foreground bg-background p-2 shadow-none",
        )}
        onClick={stopGraphPointer}
        onMouseDown={stopGraphPointer}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex items-start gap-2">
          <p className="graph-node__filter-menu-title flex-1" id={menuId}>
            Añadir filtro
          </p>
          <button
            type="button"
            aria-label="Cerrar"
            className="graph-node__delete-close nodrag nopan"
            onClick={(event) => {
              stopGraphPointer(event)
              setOpen(false)
            }}
            onMouseDown={stopGraphPointer}
          >
            <X className="graph-node__icon" />
          </button>
        </div>
        <div className="mt-1 flex flex-col gap-1.5" role="group" aria-labelledby={menuId}>
          <button
            type="button"
            className="graph-node__filter-option nodrag nopan"
            onClick={(event) => {
              stopGraphPointer(event)
              handlePick("place")
            }}
            onMouseDown={stopGraphPointer}
          >
            <MapPin className="graph-node__icon shrink-0" />
            Lugar
          </button>
          <button
            type="button"
            className="graph-node__filter-option nodrag nopan"
            onClick={(event) => {
              stopGraphPointer(event)
              handlePick("category")
            }}
            onMouseDown={stopGraphPointer}
          >
            <Tag className="graph-node__icon shrink-0" />
            Categoría
          </button>
          <button
            type="button"
            className="graph-node__filter-option nodrag nopan"
            onClick={(event) => {
              stopGraphPointer(event)
              handlePick("author")
            }}
            onMouseDown={stopGraphPointer}
          >
            <User className="graph-node__icon shrink-0" />
            Autor
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
