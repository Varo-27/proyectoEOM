import { Easing, interpolate } from "remotion";
import type { FlatNode } from "./randomTree";

const FADE_FRAMES = 22;

/** Progreso 0–1 acumulado suavemente conforme aparecen nodos (sin saltos por fila). */
export const smoothGrowthProgress = (nodes: FlatNode[], frame: number) => {
  const maxWeight = nodes.reduce((s, n) => s + n.depth + 1, 0);
  if (maxWeight === 0) return 0;

  const weight = nodes.reduce((sum, node) => {
    const fade = interpolate(frame - node.appearFrame, [0, FADE_FRAMES], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    });
    return sum + fade * (node.depth + 1);
  }, 0);

  return weight / maxWeight;
};

export type CameraState = {
  zoom: number;
  panY: number;
  focusY: number;
};

export const cameraFromProgress = (
  progress: number,
  rootY: number,
  graphHeight: number,
  settle = 0,
): CameraState => {
  const zoom = interpolate(
    progress,
    [0, 0.12, 0.3, 0.5, 0.7, 0.88, 1],
    [1.52, 1.46, 1.38, 1.28, 1.18, 1.1, 1.02],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const panY = interpolate(progress, [0, 1], [0, 28], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.36, 1),
  });

  const focusY = interpolate(
    progress,
    [0, 0.35, 0.7, 1],
    [rootY + 95, rootY + 130, rootY + 200, rootY + graphHeight * 0.32],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return {
    zoom: zoom - settle * 0.02,
    panY: panY + settle * 4,
    focusY,
  };
};
