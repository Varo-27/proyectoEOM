import { BrutalistNode } from "./BrutalistNode";
import { EOM, FONT } from "./theme";

type QueryNodeVisualProps = {
  queryText: string;
  cursorVisible: boolean;
  searched: boolean;
  buttonPulse: number;
  opacity: number;
  scale: number;
  translateY: number;
};

export const QueryNodeVisual: React.FC<QueryNodeVisualProps> = ({
  queryText,
  cursorVisible,
  searched,
  buttonPulse,
  opacity,
  scale,
  translateY,
}) => {
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: "center top",
      }}
    >
      <BrutalistNode width={420} borderColor={EOM.green} active={searched}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: EOM.greenPale,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: EOM.green,
                fontSize: 18,
              }}
            >
              ⌕
            </div>
            <div>
              <div
                style={{
                  fontFamily: FONT.mono,
                  fontSize: 10,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: EOM.green,
                  fontWeight: 700,
                }}
              >
                Consulta semántica
              </div>
              <div
                style={{
                  fontFamily: FONT.serif,
                  fontSize: 15,
                  color: EOM.ink,
                  marginTop: 4,
                }}
              >
                {searched ? queryText : "Escribe y pulsa Explorar"}
              </div>
            </div>
          </div>

          <div
            style={{
              height: 40,
              border: `2px solid ${EOM.input}`,
              background: EOM.white,
              display: "flex",
              alignItems: "center",
              padding: "0 12px",
              fontFamily: FONT.mono,
              fontSize: 13,
              color: queryText ? EOM.ink : EOM.gray,
            }}
          >
            {queryText || "Temática, autor, lugar..."}
            {cursorVisible && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 16,
                  marginLeft: 2,
                  background: EOM.green,
                }}
              />
            )}
          </div>

          <div
            style={{
              height: 36,
              border: `2px solid ${EOM.ink}`,
              background: searched ? EOM.green : EOM.green,
              color: EOM.white,
              fontFamily: FONT.mono,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${1 + buttonPulse * 0.04})`,
            }}
          >
            {searched ? "Explorando…" : "Explorar"}
          </div>
        </div>
      </BrutalistNode>
    </div>
  );
};
