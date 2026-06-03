import { Handle, type NodeProps, Position } from "@xyflow/react"
import { Search } from "lucide-react"
import type { AppNode } from "@/store/useGraphStore"

const SEARCH_TITLE_PREFIX = "Búsqueda: "

export function SearchNode({ data }: NodeProps<AppNode>) {
  const queryLabel = data.title.startsWith(SEARCH_TITLE_PREFIX)
    ? data.title.slice(SEARCH_TITLE_PREFIX.length)
    : data.title

  return (
    <div
      className="graph-node-enter group relative w-max max-w-[min(90vw,40rem)]"
      style={{
        animationDelay: data.appearDelay ? `${data.appearDelay}ms` : undefined,
      }}
    >
      <div className="relative flex w-max max-w-full items-center gap-4 rounded-full border-2 border-primary bg-foreground px-8 py-5 text-background">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <Search className="h-6 w-6 text-primary" />
        </div>
        <div className="flex shrink-0 flex-col gap-0.5">
          <span className="whitespace-nowrap font-mono text-md uppercase tracking-widest text-primary/80">
            Semilla de búsqueda
          </span>
          <span
            className="max-w-lg truncate font-sans text-2xl font-bold leading-tight"
            title={queryLabel}
          >
            {queryLabel}
          </span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 bg-primary border-2 border-foreground"
      />
    </div>
  )
}
