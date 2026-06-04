import { Link as RouterLink } from "@tanstack/react-router"
import { Plus, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWorkspaceStore } from "@/store/workspace/useWorkspaceStore"

export function WorkspaceBar() {
  const workspaces = useWorkspaceStore((state) => state.workspaces)
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  )
  const isDirty = useWorkspaceStore((state) => state.isDirty)
  const isGuestMode = useWorkspaceStore((state) => state.isGuestMode)
  const switchWorkspace = useWorkspaceStore((state) => state.switchWorkspace)
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace)
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace)
  const isSyncing = useWorkspaceStore((state) => state.isSyncing)
  const syncError = useWorkspaceStore((state) => state.syncError)
  const renameActiveWorkspace = useWorkspaceStore(
    (state) => state.renameActiveWorkspace,
  )

  const activeWorkspace = workspaces.find((ws) => ws.id === activeWorkspaceId)
  const [nameDraft, setNameDraft] = useState(activeWorkspace?.name ?? "")

  useEffect(() => {
    setNameDraft(activeWorkspace?.name ?? "")
  }, [activeWorkspace?.name])

  const commitName = () => {
    if (nameDraft.trim() && !isGuestMode) {
      renameActiveWorkspace(nameDraft)
    }
  }

  if (isGuestMode) {
    return (
      <div className="graph-workspace">
        <div className="flex items-center justify-between gap-2">
          <h2 className="eom-heading-section">Sesión de invitado</h2>
          <span className="eom-label-status">
            {isDirty ? "Sin guardar" : "En este navegador"}
          </span>
        </div>

        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Una sola área temporal en esta pestaña (no se guarda en tu cuenta).
          Puedes explorar y buscar sin registrarte. Para varias áreas, favoritos
          y comentarios,{" "}
          <RouterLink
            to="/login"
            className="text-primary underline underline-offset-2"
          >
            inicia sesión
          </RouterLink>
          .
        </p>
      </div>
    )
  }

  return (
    <div className="graph-workspace">
      <div className="flex items-center justify-between gap-2">
        <h2 className="eom-heading-section">Área de trabajo</h2>
        <span className="eom-label-status">
          {isSyncing
            ? "Sincronizando…"
            : isDirty
              ? "Sin guardar"
              : "Guardada"}
        </span>
      </div>

      <Select
        value={activeWorkspaceId ?? undefined}
        onValueChange={switchWorkspace}
      >
        <SelectTrigger className="graph-workspace__select">
          <SelectValue placeholder="Elegir área" />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              {workspace.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={nameDraft}
        onChange={(event) => setNameDraft(event.target.value)}
        onBlur={commitName}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commitName()
          }
        }}
        className="graph-workspace__input"
        placeholder="Nombre del área"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="graph-workspace__btn h-9 flex-1 gap-1"
          onClick={() => {
            createWorkspace()
            const latest = useWorkspaceStore.getState().getActiveWorkspace()
            if (latest) {
              setNameDraft(latest.name)
            }
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-9 eom-surface-flat border border-foreground/30 px-2"
          disabled={workspaces.length <= 1 || !activeWorkspaceId}
          onClick={() =>
            activeWorkspaceId && deleteWorkspace(activeWorkspaceId)
          }
          aria-label="Eliminar área de trabajo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Tus áreas se guardan en este navegador y se sincronizan con tu cuenta.
        {syncError ? ` Error: ${syncError}` : null}
      </p>
    </div>
  )
}
