import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react"
import { memo } from "react"

import { cn } from "@/lib/utils"

export type GraphFlowEdgeData = {
  highlighted?: boolean
}

function GraphFlowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  interactionWidth,
  style,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  const highlighted = (data as GraphFlowEdgeData | undefined)?.highlighted === true

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        interactionWidth={interactionWidth}
        style={style}
        className={cn("graph-edge", highlighted && "graph-edge--highlight")}
      />
      {highlighted && (
        <path
          d={edgePath}
          fill="none"
          strokeWidth={2.5}
          strokeLinecap="round"
          className="graph-edge__flow"
          pointerEvents="none"
        />
      )}
    </>
  )
}

export const GraphFlowEdge = memo(GraphFlowEdgeComponent)
