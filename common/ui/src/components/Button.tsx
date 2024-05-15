import React, { Fragment } from "react";
import styled from "styled-components";
import * as Polished from "polished";
// import Label from "../../../../backstage/src/elements/Label";
import { Colors } from "../Colors";
import Icon from "./Icon";
import Loader, { LoaderSizes } from "./Loader";

export enum ButtonTypes {
  Next = "Next",
  Regular = "Regular",
  Thin = "Thin",
}

export enum ButtonStates {
  Active = "Active",
  Warning = "Warning",
  Disabled = "Disabled",
}

export enum ButtonIconPosition {
  Left = "Left",
  Right = "Right",
}

type StyledButtonProps = {
  type: string;
  state: string;
  bgColor?: Colors;
  onClick?: any;
  margin?: string;
};

const StyledButton = styled.div<StyledButtonProps>`
  position: relative;
  height: ${(props) => {
    if (props.type === ButtonTypes.Next) {
      return "48px";
    }

    if (props.type === ButtonTypes.Regular) {
      return "40px";
    }

    if (props.type === ButtonTypes.Thin) {
      if (props.state === ButtonStates.Warning) {
        return "30px";
      }

      return "30px";
    }

    return null;
  }};
  width: ${(props) => {
    if (props.type === ButtonTypes.Next) {
      return "100%";
    }

    if (props.type === ButtonTypes.Regular) {
      return "fit-content";
    }

    if (props.type === ButtonTypes.Thin) {
      return "fit-content";
    }

    return null;
  }};
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  justify-content: center;
  white-space: nowrap;
  box-sizing: border-box;
  text-align: center;
  border-radius: 10px;
  transition: all 0.2s;
  margin: ${(props) => (Boolean(props.margin) ? props.margin : "0px")};
  padding: ${(props) => {
    if (props.type === ButtonTypes.Next) {
      return "0px";
    }

    if (props.type === ButtonTypes.Regular) {
      return "0 25px";
    }

    if (props.type === ButtonTypes.Thin) {
      return "0 15px";
    }

    return null;
  }};
  background-color: ${(props) => {
    if (props.state === ButtonStates.Disabled) {
      return Colors.Grey6;
    }

    if (props.state === ButtonStates.Warning) {
      return Colors.White;
    }

    return props.bgColor || Colors.Orange;
  }};
  border: ${(props) => {
    if (props.state === ButtonStates.Warning) {
      return `1px solid ${Colors.Grey5}`;
    }

    return null;
  }};

  &:hover {
    cursor: ${(props) => {
      if (props.state === ButtonStates.Disabled) {
        return null;
      }

      return props.onClick ? "pointer" : null;
    }};
    background-color: ${(props) => {
      if (props.state === ButtonStates.Disabled) {
        return Colors.Grey6;
      }

      if (props.state === ButtonStates.Warning) {
        return Colors.White;
      }

      return Polished.lighten(0.025, props.bgColor || Colors.Orange);
    }};
  }

  &:active {
    cursor: ${(props) => {
      if (props.state === ButtonStates.Disabled) {
        return null;
      }

      return props.onClick ? "pointer" : null;
    }};
    background-color: ${(props) => {
      if (props.state === ButtonStates.Disabled) {
        return Colors.Grey6;
      }

      if (props.state === ButtonStates.Warning) {
        return Colors.White;
      }

      return Polished.darken(0.025, props.bgColor || Colors.Orange);
    }};
  }
`;

type TextProps = {
  type: string;
  state: string;
  icon: boolean;
  iconPosition?: ButtonIconPosition;
  textColor?: Colors;
};

const Text = styled.span<TextProps>`
  position: relative;
  font-size: ${(props) => {
    if (props.type === ButtonTypes.Next) {
      return "1.4rem";
    }

    if (props.type === ButtonTypes.Regular) {
      return "1.4rem";
    }

    if (props.type === ButtonTypes.Regular) {
      return "1.2rem";
    }

    if (props.type === ButtonTypes.Thin) {
      return "1.2rem";
    }

    return null;
  }};
  font-weight: ${(props) => {
    if (props.type === ButtonTypes.Next) {
      return "600";
      // return "700";
    }

    if (props.type === ButtonTypes.Regular) {
      return "600";
      // return "700";
    }

    if (props.type === ButtonTypes.Thin) {
      return "600";
    }

    return null;
  }};
  text-transform: uppercase;
  margin: ${(props) => {
    if (props.type === ButtonTypes.Next) {
      return "0 10px";
    }

    if (props.type === ButtonTypes.Regular) {
      if (props.iconPosition === ButtonIconPosition.Left) {
        return "0 0 0 10px";
      }

      if (props.iconPosition === ButtonIconPosition.Right) {
        return "0 10px 0 0";
      }

      return "0";
    }

    if (props.type === ButtonTypes.Thin) {
      if (props.iconPosition === ButtonIconPosition.Left) {
        return "0 0 0 7px";
      }

      if (props.iconPosition === ButtonIconPosition.Right) {
        return "0 7px 0 0";
      }

      return "0";
    }

    return null;
  }};
  color: ${(props: any) => {
    if (props.state)
      if (props.state === ButtonStates.Disabled) {
        return Colors.Grey5;
      }

    if (props.state === ButtonStates.Warning) {
      return Colors.Grey3;
    }

    return props.textColor || Colors.White;
  }};
  top: ${(props) => {
    if (props.type === ButtonTypes.Thin) {
      if (props.icon) {
        return "-1px";
      }

      return "0";
    }

    return null;
  }};
`;

export type ButtonProps = {
  type?: ButtonTypes;
  state?: ButtonStates;
  bgColor?: Colors;
  textColor?: Colors;
  text?: string;
  onClick?: any;
  icon?: any;
  iconPosition?: ButtonIconPosition;
  iconSize?: number;
  margin?: string;
  loading?: boolean;
  label?: string;
  tip?: string;
  subLabel?: string;
};

export default function Button({
  type = ButtonTypes.Next,
  state = ButtonStates.Active,
  bgColor,
  textColor,
  text,
  onClick = () => {},
  icon,
  iconPosition,
  iconSize = 14,
  // label,
  // tip,
  // subLabel,
  margin,
  loading = false,
}: ButtonProps) {
  const iconColor: Colors =
    state === ButtonStates.Disabled ? Colors.Grey3 : Colors.White;

  if (icon && !iconPosition) iconPosition = ButtonIconPosition.Left;

  const iconEl = (
    <Icon
      icon={icon}
      color={iconColor}
      size={iconSize}
      top={iconSize < 14 ? "-1px" : undefined}
    />
  );

  const click =
    loading || state === ButtonStates.Disabled ? null : () => onClick();

  return (
    <>
      {/* {label && <Label text={label} subText={subLabel} tip={tip} />} */}
      <StyledButton
        type={type}
        state={state}
        onClick={click}
        margin={margin}
        bgColor={bgColor}
      >
        {(() => {
          return (
            <Fragment>
              {(() => {
                if (loading) {
                  return (
                    <Fragment>
                      <Loader size={LoaderSizes.VerySmall} color={iconColor} />
                      {/* <Text 
                      type={type} 
                      state={state} 
                      icon={true}
                    >
                      Loading...
                    </Text> */}
                    </Fragment>
                  );
                }

                return (
                  <Fragment>
                    {icon && iconPosition === ButtonIconPosition.Left && iconEl}
                    {text && (
                      <Text
                        type={type}
                        state={state}
                        icon={Boolean(icon)}
                        iconPosition={iconPosition}
                        textColor={textColor}
                      >
                        {text}
                      </Text>
                    )}
                    {icon &&
                      iconPosition === ButtonIconPosition.Right &&
                      iconEl}
                  </Fragment>
                );
              })()}
            </Fragment>
          );
        })()}
      </StyledButton>
    </>
  );
}
