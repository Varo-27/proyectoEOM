import { Handle, type NodeProps, Position } from "@xyflow/react"
import type { AppNode } from "@/store/useGraphStore"

export function ArticleNode({ data }: NodeProps<AppNode>) {
    return (
        <div className="group relative w-[320px] bg-background border-2 border-foreground shadow-[4px_4px_0_0_var(--color-foreground)] transition-all duration-300 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--color-primary)]">
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 bg-background border-2 border-foreground"
            />
            <div className="flex flex-col h-full bg-card">
                <div className="px-4 py-2 border-b-2 border-foreground bg-muted flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-primary font-bold">
                        {data.category_name || "GEOPOLÍTICA"}
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground">
                        {data.author_name || "EL ORDEN MUNDIAL"}
                    </span>
                </div>
                {data.imageUrl && (
                    <div className="w-full h-32 border-b-2 border-foreground overflow-hidden">
                        <img
                            src={data.imageUrl}
                            alt={data.title}
                            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                    </div>
                )}
                <div className="p-4 flex flex-col gap-3">
                    <h3 className="font-serif text-xl font-bold leading-tight text-foreground decoration-2 group-hover:underline decoration-primary underline-offset-4">
                        {data.title}
                    </h3>
                    {data.author_name && (
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                            Por {data.author_name}
                        </p>
                    )}
                    {data.excerpt && (
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed relative before:content-[''] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[2px] before:bg-primary/30 pl-3">
                            {data.excerpt}
                        </p>
                    )}
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 bg-background border-2 border-foreground"
            />
        </div>
    )
}
