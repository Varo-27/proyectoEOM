import { useVideoConfig } from "remotion";
import { EOM } from "./theme";

export const GridBackground: React.FC = () => {
  const { width, height } = useVideoConfig();
  const gap = 32;
  const lines: React.ReactNode[] = [];

  for (let x = 0; x <= width; x += gap) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke={EOM.green}
        strokeOpacity={0.12}
        strokeWidth={1}
      />,
    );
  }

  for (let y = 0; y <= height; y += gap) {
    lines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={EOM.green}
        strokeOpacity={0.12}
        strokeWidth={1}
      />,
    );
  }

  return (
    <svg
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {lines}
    </svg>
  );
};
