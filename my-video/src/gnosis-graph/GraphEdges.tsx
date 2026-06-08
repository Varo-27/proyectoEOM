import { Easing, interpolate } from "remotion";
import { EOM } from "./theme";

export type GraphEdge = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  appearFrame: number;
};

type GraphEdgesProps = {
  edges: GraphEdge[];
  frame: number;
  width: number;
  height: number;
};

export const GraphEdges: React.FC<GraphEdgesProps> = ({
  edges,
  frame,
  width,
  height,
}) => {
  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2 }}
    >
      {edges.map((edge) => {
        const progress = interpolate(frame - edge.appearFrame, [0, 8], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        });
        const length = Math.hypot(edge.x2 - edge.x1, edge.y2 - edge.y1);
        const dashOffset = length * (1 - progress);

        return (
          <line
            key={edge.id}
            x1={edge.x1}
            y1={edge.y1}
            x2={edge.x2}
            y2={edge.y2}
            stroke={EOM.green}
            strokeWidth={4}
            strokeDasharray={length}
            strokeDashoffset={dashOffset}
            opacity={0.65}
          />
        );
      })}
    </svg>
  );
};
