import { Handle, type NodeProps, Position } from "@xyflow/react"
import { Search } from "lucide-react"
import type { AppNode } from "@/store/useGraphStore"

export function SearchNode({ data }: NodeProps<AppNode>) {
  return (
    <div
      className="graph-node-enter relative group w-70"
      style={{
        animationDelay: data.appearDelay ? `${data.appearDelay}ms` : undefined,
      }}
    >
      <div className="relative flex items-center gap-3 px-6 py-4 bg-foreground text-background rounded-full border-2 border-primary">
        <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Search className="w-4 h-4 text-primary" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[10px] uppercase font-mono tracking-widest text-primary/80">
            Semilla de búsqueda
          </span>
          <span className="font-serif text-base font-bold truncate">
            {data.title.replace("Búsqueda: ", "")}
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
