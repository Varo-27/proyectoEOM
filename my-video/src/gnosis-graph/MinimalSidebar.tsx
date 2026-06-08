import { Img, staticFile } from "remotion";
import { BrutalistNode } from "./BrutalistNode";
import { EOM, FONT } from "./theme";

type MinimalSidebarProps = {
  opacity: number;
  translateX: number;
};

export const MinimalSidebar: React.FC<MinimalSidebarProps> = ({
  opacity,
  translateX,
}) => {
  return (
    <aside
      style={{
        width: 320,
        flexShrink: 0,
        borderLeft: `2px solid ${EOM.ink}`,
        background: EOM.white,
        display: "flex",
        flexDirection: "column",
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      <div
        style={{
          borderBottom: `2px solid ${EOM.ink}`,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <Img
          src={staticFile("logo_letras_ng.svg")}
          style={{ height: 28, width: "auto", objectFit: "contain" }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <div
            style={{
              flex: 1,
              height: 36,
              border: `2px solid ${EOM.border}`,
              background: EOM.white,
              fontFamily: FONT.mono,
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              padding: "0 10px",
              color: EOM.gray,
            }}
          >
            Workspace demo
          </div>
          <div
            style={{
              height: 36,
              padding: "0 14px",
              border: `2px solid ${EOM.ink}`,
              background: EOM.white,
              fontFamily: FONT.mono,
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
            }}
          >
            Nuevo
          </div>
        </div>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <span
          style={{
            fontFamily: FONT.mono,
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: EOM.gray,
          }}
        >
          Arrastra al lienzo
        </span>
        {["Consulta", "Artículo", "Filtro"].map((label) => (
          <BrutalistNode key={label} width="100%">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: EOM.greenPale,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: EOM.green,
                  fontFamily: FONT.mono,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                +
              </div>
              <div>
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: EOM.green,
                    fontWeight: 700,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: 13,
                    color: EOM.gray,
                    marginTop: 2,
                  }}
                >
                  Nodo {label.toLowerCase()}
                </div>
              </div>
            </div>
          </BrutalistNode>
        ))}
      </div>
    </aside>
  );
};
