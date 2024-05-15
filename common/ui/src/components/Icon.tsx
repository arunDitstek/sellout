import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Colors } from "../Colors";
import { IconEnum } from "./Icons";
import styled from "styled-components";

const Container = styled.div<any>`
  color: ${(props) => props.color};

  &:hover {
    color: ${(props) => {
      if (props.color === "inherit") return null;
      return props.hoverColor;
    }};
  }
`;

export const Icons = IconEnum;

export type IconProps = {
  icon: any;
  color?: Colors | string | null;
  hoverColor?: Colors | string | null;
  onClick?: any | null;
  size?: string | number | undefined;
  position?: string;
  top?: string | number | undefined;
  left?: string | number | undefined;
  right?: string | number | undefined;
  zIndex?: number | void;
  margin?: string | number | undefined;
  tip?: string;
  transitionDuration?: string;
  rotation?: number;
};

export default function Icon({
  icon = Icons.AudienceRegular,
  color = Colors.Orange,
  hoverColor = null,
  onClick,
  size = 20,
  top,
  left,
  right,
  position = "relative" as any,
  zIndex,
  margin,
  tip,
  transitionDuration,
  rotation,
}: IconProps) {
  const cursor: string = onClick ? "pointer" : "";

  if (icon === Icons.TicketRegular) rotation = 90;
  if (icon === Icons.TicketSolid) rotation = 90;

  return (
    <Container color={color} hoverColor={hoverColor} data-tip={tip}>
      <FontAwesomeIcon
        icon={icon as any}
        onClick={onClick}
        style={{
          top,
          left,
          right,
          position: position as any,
          zIndex: zIndex as any,
          fontSize: size,
          transition: `all ${transitionDuration || "0.2s"}`,
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
          margin,
          cursor,
        }}
      />
    </Container>
  );
}
