import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GridBackground } from "./GridBackground";
import { EOM, FONT } from "./theme";
import { INTRO_DURATION } from "./duration";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoIn = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 180, mass: 0.7 },
  });

  const subtitleOpacity = interpolate(frame, [22, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tagOpacity = interpolate(frame, [38, 56], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const authorOpacity = interpolate(frame, [52, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [INTRO_DURATION - 24, INTRO_DURATION],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        background: EOM.white,
        fontFamily: FONT.mono,
        opacity: fadeOut,
      }}
    >
      <GridBackground />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
        }}
      >
        <div
          style={{
            position: "relative",
            transform: `scale(${interpolate(logoIn, [0, 1], [0.82, 1])})`,
            opacity: logoIn,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: "translate(14px, 14px)",
              background: EOM.ink,
            }}
          />
          <div
            style={{
              position: "relative",
              border: `8px solid ${EOM.green}`,
              background: EOM.white,
              padding: "56px 80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Img
              src={staticFile("logo_letras_ng.svg")}
              style={{ height: 168, width: "auto" }}
            />
          </div>
        </div>

        <p
          style={{
            margin: 0,
            opacity: subtitleOpacity,
            fontFamily: FONT.serif,
            fontSize: 38,
            color: EOM.gray,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          Explorador semántico de El Orden Mundial
        </p>

        <p
          style={{
            margin: 0,
            opacity: tagOpacity,
            fontSize: 18,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: EOM.green,
            fontWeight: 700,
          }}
        >
          Del dato al grafo · De la consulta al conocimiento
        </p>

        <p
          style={{
            margin: 0,
            opacity: authorOpacity,
            fontFamily: FONT.serif,
            fontSize: 34,
            fontWeight: 600,
            color: EOM.ink,
            textAlign: "center",
            letterSpacing: "0.04em",
          }}
        >
          Álvaro Estévez Pazos
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
