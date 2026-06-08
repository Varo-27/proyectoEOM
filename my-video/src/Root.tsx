import "./index.css";
import { Composition } from "remotion";
import { DEMO_DURATION, INTRO_DURATION, PRESENTATION_DURATION } from "./gnosis-graph/duration";
import { GnosisGraphDemo } from "./gnosis-graph/GnosisGraphDemo";
import { GnosisGraphPresentation } from "./gnosis-graph/GnosisGraphPresentation";
import { Intro } from "./gnosis-graph/Intro";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GnosisGraphPresentation"
        component={GnosisGraphPresentation}
        durationInFrames={PRESENTATION_DURATION}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="Intro"
        component={Intro}
        durationInFrames={INTRO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GnosisGraphDemo"
        component={GnosisGraphDemo}
        durationInFrames={DEMO_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
