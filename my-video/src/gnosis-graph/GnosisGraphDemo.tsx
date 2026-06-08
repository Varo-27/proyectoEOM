import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useMemo } from "react";
import { GraphEdges } from "./GraphEdges";
import { GridBackground } from "./GridBackground";
import { MinimalNode, squareToneForId } from "./MinimalNode";
import {
  buildRandomTree,
  lastAppearFrame,
} from "./randomTree";
import { cameraFromProgress, smoothGrowthProgress } from "./camera";
import { EOM, FONT } from "./theme";
import { typewriterText } from "./util";

const SEARCH_QUERY = "etnografía digital";

const popIn = (frame: number, appearFrame: number, fps: number) => {
  const progress = spring({
    frame: frame - appearFrame,
    fps,
    config: { damping: 14, stiffness: 220, mass: 0.48 },
  });
  const opacity = interpolate(frame - appearFrame, [0, 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return {
    scale: progress,
    opacity,
    slideY: interpolate(progress, [0, 1], [-18, 0]),
  };
};

export const GnosisGraphDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const centerX = width / 2;
  const rootY = 72;

  const { nodes, edges, graphHeight } = useMemo(
    () => buildRandomTree(centerX, rootY),
    [centerX, rootY],
  );

  const typingStart = 12;
  const queryText = typewriterText(frame, typingStart, SEARCH_QUERY, 22);
  const isTyping = frame >= typingStart && frame < typingStart + 26;
  const searched = frame >= 46;

  const growthEnd = lastAppearFrame(nodes);

  const growthProgress = smoothGrowthProgress(nodes, frame);

  const settle = interpolate(frame, [growthEnd, growthEnd + 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.55, 1),
  });

  const { zoom: cameraZoom, panY: cameraPan, focusY } = cameraFromProgress(
    growthProgress,
    rootY,
    graphHeight,
    settle,
  );

  return (
    <AbsoluteFill style={{ background: EOM.white, fontFamily: FONT.mono }}>
      <GridBackground />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${cameraZoom}) translateY(${cameraPan}px)`,
          transformOrigin: `${centerX}px ${focusY}px`,
        }}
      >
        <GraphEdges edges={edges} frame={frame} width={width} height={height} />

        {nodes.map((node) => {
          const { scale, opacity, slideY } = popIn(
            frame,
            node.id === "root" ? 0 : node.appearFrame,
            fps,
          );

          return (
            <div
              key={node.id}
              style={{
                position: "absolute",
                left: node.x,
                top: node.y,
                zIndex: node.depth + 2,
              }}
            >
              <MinimalNode
                label={
                  node.id === "root"
                    ? queryText || (searched ? SEARCH_QUERY : "")
                    : ""
                }
                depth={node.depth}
                squareTone={
                  node.id === "root" ? undefined : squareToneForId(node.id)
                }
                sublabel={
                  node.id === "root" && isTyping && Math.floor(frame / 8) % 2 === 0
                    ? "cursor"
                    : undefined
                }
                active={node.id === "root" && searched}
                opacity={opacity}
                scale={scale}
                slideY={slideY}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
