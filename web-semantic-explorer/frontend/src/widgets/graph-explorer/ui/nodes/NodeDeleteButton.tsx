import { Trash2, X } from "lucide-react"
import { useState, type MouseEvent } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useGraphStore } from "@/store/useGraphStore"

type NodeDeleteButtonProps = {
  nodeId: string
  ariaLabel?: string
}

function stopGraphPointer(event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
}

export function NodeDeleteButton({
  nodeId,
  ariaLabel = "Eliminar nodo",
}: NodeDeleteButtonProps) {
  const removeNode = useGraphStore((state) => state.removeNode)
  const [open, setOpen] = useState(false)
  const promptId = `delete-prompt-${nodeId}`

  const handleConfirm = () => {
    setOpen(false)
    removeNode(nodeId)
  }

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          aria-expanded={open}
          className={cn(
            "graph-node__icon-btn nodrag nopan",
            open && "graph-node__icon-btn--armed",
          )}
          onClick={stopGraphPointer}
          onMouseDown={stopGraphPointer}
        >
          <Trash2 className="graph-node__icon" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="top"
        className={cn(
          "graph-node__delete-menu",
          "eom-brutal-border eom-shadow-xs eom-surface-flat",
          "rounded-none border-foreground bg-background p-2 shadow-none",
        )}
        onClick={stopGraphPointer}
        onMouseDown={stopGraphPointer}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex items-start gap-2">
          <p
            className="graph-node__delete-prompt flex-1"
            id={promptId}
          >
            ¿Eliminar este nodo?
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
        <button
          type="button"
          className="graph-node__delete-confirm nodrag nopan"
          aria-describedby={promptId}
          onClick={(event) => {
            stopGraphPointer(event)
            handleConfirm()
          }}
          onMouseDown={stopGraphPointer}
        >
          Borrar
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
