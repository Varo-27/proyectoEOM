import { EOM, FONT } from "./theme";

export type NodeSize = {
  w: number;
  h: number;
  border: number;
  font: number;
  shadow: number;
};

const QUERY_SIZE: NodeSize = {
  w: 420,
  h: 100,
  border: 6,
  font: 15,
  shadow: 8,
};

/** Cuadrados desde profundidad 1 */
const SQUARE_SIZES: NodeSize[] = [
  { w: 76, h: 76, border: 5, font: 0, shadow: 6 },
  { w: 58, h: 58, border: 4, font: 0, shadow: 5 },
  { w: 48, h: 48, border: 4, font: 0, shadow: 5 },
  { w: 40, h: 40, border: 3, font: 0, shadow: 4 },
  { w: 34, h: 34, border: 3, font: 0, shadow: 4 },
  { w: 30, h: 30, border: 3, font: 0, shadow: 3 },
];

export const getNodeSize = (depth: number): NodeSize =>
  depth === 0
    ? QUERY_SIZE
    : SQUARE_SIZES[Math.min(depth - 1, SQUARE_SIZES.length - 1)]!;

export type SquareTone = "green" | "black";

type MinimalNodeProps = {
  label: string;
  depth: number;
  squareTone?: SquareTone;
  sublabel?: string;
  active?: boolean;
  opacity: number;
  scale: number;
  slideY: number;
};

export const MinimalNode: React.FC<MinimalNodeProps> = ({
  label,
  depth,
  squareTone = "green",
  sublabel,
  active = false,
  opacity,
  scale,
  slideY,
}) => {
  const { w, h, border, shadow } = getNodeSize(depth);
  const isQuery = depth === 0;

  const fill = isQuery
    ? EOM.white
    : squareTone === "green"
      ? EOM.green
      : EOM.ink;

  const shadowColor = isQuery
    ? active
      ? EOM.green
      : EOM.ink
    : squareTone === "green"
      ? EOM.ink
      : EOM.green;

  const borderColor = EOM.ink;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${slideY}px) scale(${scale})`,
        transformOrigin: "center top",
        width: w,
        height: h,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${shadow}px, ${shadow}px)`,
          background: shadowColor,
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          border: `${border}px solid ${isQuery && active ? EOM.green : borderColor}`,
          background: fill,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: isQuery ? "0 20px" : 0,
          overflow: "hidden",
        }}
      >
        {isQuery && (
          <div
            style={{
              height: 36,
              border: `4px solid ${EOM.input}`,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              fontFamily: FONT.mono,
              fontSize: 14,
              fontWeight: 600,
              color: label ? EOM.ink : EOM.gray,
              background: EOM.white,
            }}
          >
            {label || "consulta semántica…"}
            {sublabel === "cursor" && (
              <span
                style={{
                  width: 3,
                  height: 18,
                  marginLeft: 3,
                  background: EOM.green,
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const nodeBottom = (y: number, depth: number) => y + getNodeSize(depth).h;
export const nodeTop = (y: number) => y;
export const nodeCenterX = (x: number, depth: number) => x + getNodeSize(depth).w / 2;
export const nodeLeftFromCenter = (centerX: number, depth: number) =>
  centerX - getNodeSize(depth).w / 2;

export const squareToneForId = (id: string): SquareTone => {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h + id.charCodeAt(i) * (i + 1)) | 0;
  }
  return Math.abs(h) % 2 === 0 ? "green" : "black";
};
