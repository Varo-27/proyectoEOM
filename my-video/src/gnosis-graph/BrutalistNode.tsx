import { ReactNode } from "react";
import { EOM } from "./theme";

type BrutalistNodeProps = {
  children: ReactNode;
  width?: number | string;
  borderColor?: string;
  active?: boolean;
  style?: React.CSSProperties;
};

export const BrutalistNode: React.FC<BrutalistNodeProps> = ({
  children,
  width,
  borderColor = EOM.ink,
  active = false,
  style,
}) => {
  const shadowColor = active ? EOM.green : EOM.ink;

  return (
    <div
      style={{
        position: "relative",
        width,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          right: -4,
          bottom: -4,
          background: shadowColor,
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          border: `2px solid ${borderColor}`,
          background: EOM.white,
          padding: 16,
        }}
      >
        {children}
      </div>
    </div>
  );
};
