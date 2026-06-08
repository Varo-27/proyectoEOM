import { Easing, interpolate } from "remotion";

export const clampInterp = (
  frame: number,
  input: [number, number],
  output: [number, number],
) =>
  interpolate(frame, input, output, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

export const typewriterText = (frame: number, start: number, text: string, cps = 14) => {
  const chars = Math.floor(Math.max(0, frame - start) / (30 / cps));
  return text.slice(0, Math.min(chars, text.length));
};

export const polar = (cx: number, cy: number, radius: number, angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
};
