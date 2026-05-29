import { Handle, type NodeProps, Position } from "@xyflow/react"
import { Sparkles } from "lucide-react"

import type { AppNode } from "@/store/useGraphStore"
import { useGraphStore } from "@/store/useGraphStore"

export function ArticleNode({ id, data }: NodeProps<AppNode>) {
  const activeNodeId = useGraphStore((state) => state.activeNodeId)
  const expandSimilar = useGraphStore((state) => state.expandSimilar)
  const isActive = activeNodeId === id

  return (
    <div
      className={`graph-node-enter graph-node-card group relative w-[300px] bg-background border-2 border-foreground shadow-[4px_4px_0_0_var(--color-foreground)] transition-all duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-primary)] ${isActive ? "graph-node-active" : ""}`}
      style={{
        animationDelay: data.appearDelay ? `${data.appearDelay}ms` : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-background !border-2 !border-foreground"
      />
      <div className="flex flex-col bg-card">
        <div className="flex items-center justify-between gap-2 border-b-2 border-foreground bg-muted px-3 py-2">
          <span className="truncate text-[10px] font-mono font-bold uppercase tracking-widest text-primary">
            {data.category_name || "Artículo"}
          </span>
          {data.author_name && (
            <span className="max-w-[48%] truncate text-right text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
              {data.author_name}
            </span>
          )}
        </div>

        {data.imageUrl && (
          <div className="h-28 overflow-hidden border-b-2 border-foreground">
            <img
              src={data.imageUrl}
              alt={data.title}
              className="h-full w-full object-cover filter grayscale transition-all duration-500 group-hover:grayscale-0"
            />
          </div>
        )}

        <div className="flex flex-col gap-2 p-3">
          <h3 className="font-serif text-lg font-bold leading-snug text-foreground decoration-primary decoration-2 underline-offset-4 group-hover:underline">
            {data.title}
          </h3>
          {data.excerpt && (
            <p className="line-clamp-2 pl-2 text-xs leading-relaxed text-muted-foreground before:absolute relative before:left-0 before:top-0.5 before:bottom-0.5 before:w-0.5 before:bg-primary/25">
              {data.excerpt}
            </p>
          )}
        </div>

        <div className="border-t-2 border-foreground bg-muted/50 px-3 py-2">
          <button
            type="button"
            className="nodrag nopan inline-flex w-full items-center justify-center gap-1.5 border border-foreground/30 bg-background px-3 py-1.5 text-[10px] uppercase tracking-widest text-foreground transition-colors hover:border-foreground hover:bg-primary hover:text-primary-foreground"
            onClick={(event) => {
              event.stopPropagation()
              expandSimilar?.(id)
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Más como este
          </button>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-background !border-2 !border-foreground"
      />
    </div>
  )
}
