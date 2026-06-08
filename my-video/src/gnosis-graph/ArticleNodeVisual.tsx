import { BrutalistNode } from "./BrutalistNode";
import { EOM, FONT } from "./theme";

export type ArticleNodeData = {
  id: string;
  category: string;
  title: string;
  compact?: boolean;
  tiny?: boolean;
};

type ArticleNodeVisualProps = ArticleNodeData & {
  opacity: number;
  scale: number;
};

export const ArticleNodeVisual: React.FC<ArticleNodeVisualProps> = ({
  category,
  title,
  compact = false,
  tiny = false,
  opacity,
  scale,
}) => {
  if (tiny) {
    return (
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
          width: 72,
          height: 36,
          border: `2px solid ${EOM.ink}`,
          background: EOM.white,
          boxShadow: `4px 4px 0 ${EOM.green}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT.mono,
          fontSize: 8,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: EOM.green,
          padding: "0 4px",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
        }}
      >
        {title.slice(0, 12)}
      </div>
    );
  }

  const width = compact ? 200 : 260;

  return (
    <div style={{ opacity, transform: `scale(${scale})`, transformOrigin: "center top" }}>
      <BrutalistNode width={width}>
        <div
          style={{
            borderBottom: `2px solid ${EOM.ink}`,
            background: EOM.surface,
            margin: -16,
            marginBottom: 12,
            padding: "8px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: FONT.mono,
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: EOM.green,
              fontWeight: 700,
            }}
          >
            {category}
          </span>
        </div>
        <h3
          style={{
            margin: 0,
            fontFamily: FONT.serif,
            fontSize: compact ? 13 : 15,
            lineHeight: 1.25,
            color: EOM.ink,
            background:
              "linear-gradient(0deg, rgba(73, 125, 11, 0.16) 50%, transparent 50%)",
          }}
        >
          {title}
        </h3>
        {!compact && (
          <p
            style={{
              margin: "8px 0 0",
              fontFamily: FONT.mono,
              fontSize: 10,
              lineHeight: 1.5,
              color: EOM.gray,
              borderLeft: `2px solid rgba(73, 125, 11, 0.25)`,
              paddingLeft: 8,
            }}
          >
            Fragmento semántico enlazado al grafo…
          </p>
        )}
      </BrutalistNode>
    </div>
  );
};
