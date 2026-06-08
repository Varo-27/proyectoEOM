import { AbsoluteFill, interpolate, Series, useCurrentFrame } from "remotion";
import { DEMO_DURATION, INTRO_DURATION } from "./duration";
import { GnosisGraphDemo } from "./GnosisGraphDemo";
import { Intro } from "./Intro";

export const GnosisGraphPresentation: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={INTRO_DURATION}>
          <Intro />
        </Series.Sequence>
        <Series.Sequence durationInFrames={DEMO_DURATION}>
          <DemoWithFadeIn />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};

const DemoWithFadeIn: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <GnosisGraphDemo />
    </AbsoluteFill>
  );
};
