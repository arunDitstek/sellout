import React, { Fragment, useState } from "react";
import styled from "styled-components";
import * as Polished from "polished";
import { Colors } from "../Colors";
import Icon, { Icons } from "./Icon";
import Loader, { LoaderSizes } from "./Loader";
import Label from "./Label";
import Flex from "./Flex";
import MaxLength from "./MaxLength";
import ValidationError from "./ValidationError";
import { media } from "../utils/MediaQuery";

export enum InputSizes {
  Large = "Large",
  Regular = "Regular",
}

type ContainerProps = {
  width?: string;
  margin?: string;
};

const Container = styled.div<ContainerProps>`
  width: ${(props) => props.width};
  margin: ${(props) => props.margin};
`;

const IncrementButton = styled.button`
  font-size: 22px;
  padding: 5px 14px;
  cursor: pointer;
  border: none;
  background-color: #f0f0f0;
`;

type FormProps = {
  hovered: boolean;
  focused: boolean;
  width?: string;
  disabled: boolean;
};

const Form = styled.form<FormProps>`
  width: ${(props) => props.width};
  display: flex;
  flex-direction: row;
  position: relative;
  border-radius: 10px;
  transition: all 0.2s;
  border: 1px solid
    ${(props) => {
      if (props.focused) return Colors.Grey4;
      if (props.hovered) return Polished.darken(0.05, Colors.Grey5);
      return Colors.Grey5;
    }};
  overflow: hidden;
  background-color: ${(props) =>
    props.disabled ? `${Colors.Grey6} !important` : null};

  > * {
    background-color: ${(props) =>
      props.disabled ? `${Colors.Grey6} !important` : null};
  }
`;

type ButtonProps = {
  canSubmit: boolean;
  size: InputSizes;
  codeApply?: string;
};

const Button = styled.div<ButtonProps>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Colors.White};
  height: ${(props) => {
    if (props.size === InputSizes.Large) return "50px";
    if (props.size === InputSizes.Regular) return "40px";
    return null;
  }};
  width: ${(props) => {
    if (props.size === InputSizes.Large) return "50px";
    if (props.size === InputSizes.Regular) return "40px";
    return null;
  }};
  border-radius: 0 10px 10px 0;
  top: -1px;
  right: ${(props) => (props.codeApply ? "17px" : "-1px")};
  transition: all 0.2s;

  &:hover {
    cursor: ${(props) => (props.onClick ? "pointer" : null)};
  }

  &:active {
    cursor: ${(props) => (props.onClick ? "pointer" : null)};
  }
`;

const IconContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
`;

const TextContainer = styled.div<any>`
  color: ${(props) => (props.canSubmit ? Colors.Orange : Colors.Orange)};
  font-size: 1.7rem;
  text-decoration: underline;
  font-weight: 500;
`;

type SmallContainerProps = {
  size: InputSizes;
};

const LeftContainer = styled.div<SmallContainerProps>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
  top: 0px;
  left: 0px;
  background-color: ${Colors.White};
`;

const RightContainer = styled.div<SmallContainerProps>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${(props) => {
    if (props.size === InputSizes.Large) return "50px";
    if (props.size === InputSizes.Regular) return "40px";
    return null;
  }};
  width: ${(props) => {
    if (props.size === InputSizes.Large) return "50px";
    if (props.size === InputSizes.Regular) return "40px";
    return null;
  }};
  top: -1px;
  right: -1px;
  background-color: ${Colors.White};

  &:hover {
    cursor: ${(props) => (props.onClick ? "pointer" : null)};
  }
`;

type SpacerProps = {
  incrementButton?: boolean;
};

const Spacer = styled.div<SpacerProps>`
  width: ${(props) => (props.incrementButton ? "0px" : "50px")};
  background-color: ${Colors.White};
`;

type StyledInputProps = {
  padding?: string;
  inputSize?: InputSizes;
  disabled: boolean;
  hasIcon: boolean;
};

export const InputStyled = styled.input<StyledInputProps>`
  background-color: ${Colors.White};
  color: ${(props) => (props.disabled ? Colors.Grey4 : Colors.Grey1)};
  outline: none;
  border: 0px;
  /* border-radius: 10px; */
  height: ${(props) => {
    if (props.inputSize === InputSizes.Large) return "48px";
    if (props.inputSize === InputSizes.Regular) return "38px";
    return null;
  }};
  width: fill-available;
  font-family: "neue-haas-grotesk-display", sans-serif;
  font-weight: 500;
  padding: 0px;
  padding-left: ${(props) => (props.hasIcon ? "8px" : "16px")};
  transition: all 0.2s;
  padding: ${(props) => props.padding};

  ::placeholder {
    color: ${Colors.Grey4};
  }

  ${media.mobile`
  font-size: 1.6rem;
`};

  ${media.desktop`
  font-size: 1.4rem;
`};
`;

export type InputProps = {
  inputRef?: React.Ref<HTMLInputElement>;
  autoFocus?: boolean | undefined;
  placeholder?: string;
  value: string;
  defaultValue?: string;
  icon?: any;
  iconColor?: Colors;
  type?: string;
  size?: InputSizes;
  onMouseEnter?: any;
  onMouseLeave?: any;
  onChange?: any;
  onFocus?: any;
  onBlur?: any;
  onSubmit?: Function;
  onClear?: Function;
  canSubmit?: boolean;
  loading?: boolean;
  margin?: string;
  padding?: string;
  width?: string;
  onEnter?: Function;
  label?: string;
  subLabel?: string;
  tip?: string;
  maxLength?: number;
  iconConditionalColor?: any;
  validationError?: string;
  disabled?: boolean;
  incrementButton?: boolean;
  handleIncrement?: any;
  handleDecrement?: any;
  codeApply?: string;
  discountCode?: string;
};

function Input(
  {
    autoFocus,
    placeholder,
    value,
    defaultValue,
    icon,
    iconColor,
    size = InputSizes.Regular,
    type = "text",
    onMouseEnter,
    onMouseLeave,
    onChange,
    onFocus,
    onBlur,
    onSubmit,
    onClear,
    canSubmit = true,
    loading,
    margin,
    padding,
    width,
    onEnter,
    label,
    subLabel,
    tip,
    maxLength,
    iconConditionalColor,
    validationError,
    disabled = false,
    incrementButton = false,
    handleIncrement,
    handleDecrement,
    codeApply,
    discountCode,
  }: InputProps,
  inputRef: any
) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const submit = (event: any) => {
    event.preventDefault();
    if (onSubmit && !loading) {
      onSubmit();
    } else if (onEnter && !loading) {
      onEnter();
    }
  };

  const iconSize = (() => {
    if (size === InputSizes.Large) return 16;
    if (size === InputSizes.Regular) return 14;
    return 14;
  })();

  const submitIconSize = (() => {
    if (size === InputSizes.Large) return 18;
    if (size === InputSizes.Regular) return 16;
    return 16;
  })();

  return (
    <Container width={width} margin={margin}>
      <Flex justify="space-between">
        {label && <Label text={label} subText={subLabel} tip={tip} />}
        {maxLength && (
          <MaxLength value={value as string} maxLength={maxLength} />
        )}
      </Flex>

      <Form
        hovered={hovered}
        focused={focused}
        onSubmit={(event) => submit(event)}
        width={width}
        disabled={disabled}
        noValidate // disables default html5 validation
      >
        {icon && (
          <LeftContainer size={size}>
            <IconContainer>
              <Icon
                icon={icon}
                size={iconSize}
                color={(() => {
                  if (iconColor) return iconColor;
                  return value
                    ? iconConditionalColor || Colors.Grey1
                    : focused
                    ? Colors.Grey3
                    : Colors.Grey4;
                })()}
              />
            </IconContainer>
          </LeftContainer>
        )}
        {incrementButton && (
          <IncrementButton onClick={handleDecrement}>-</IncrementButton>
        )}
        <InputStyled
          ref={inputRef}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          type={type}
          onChange={(e: React.FormEvent<HTMLInputElement>) => {
            if (maxLength && e.currentTarget.value.length > maxLength) {
              // do nothing, the max length has been reached
            } else {
              onChange(e);
            }
          }}
          onFocus={(event) => {
            setFocused(true);
            if (onFocus) onFocus(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            if (onFocus) onBlur(event);
          }}
          onMouseEnter={(event: any) => {
            setHovered(true);
            if (onMouseEnter) onMouseEnter(event);
          }}
          onMouseLeave={(event: any) => {
            setHovered(false);
            if (onMouseLeave) onMouseLeave(event);
          }}
          padding={padding}
          inputSize={size}
          hasIcon={Boolean(icon)}
        />
        {incrementButton && (
          <IncrementButton onClick={handleIncrement}>+</IncrementButton>
        )}

        {(() => {
          if (onSubmit) {
            return (
              <Fragment>
                <Spacer incrementButton />
                <Button
                  canSubmit={canSubmit}
                  onClick={(event) => submit(event)}
                  size={size}
                  codeApply={codeApply}
                >
                  {(() => {
                    if (loading) {
                      return (
                        <Loader
                          size={LoaderSizes.VerySmall}
                          color={Colors.Orange}
                        />
                      );
                    }

                    return (
                      <>
                        {!codeApply && (
                          <Icon
                            icon={Icons.RightChevronCircle}
                            color={canSubmit ? Colors.Orange : Colors.Grey5}
                            size={submitIconSize}
                          />
                        )}
                        {codeApply && (
                          <TextContainer
                          canSubmit={canSubmit}
                          >
                            {discountCode ? "Clear" : "Apply"}
                          </TextContainer>
                        )}
                      </>
                    );
                  })()}
                </Button>
              </Fragment>
            );
          }

          if (loading) {
            return (
              <Fragment>
                <Spacer incrementButton />
                <RightContainer size={size}>
                  <Loader size={LoaderSizes.SuperSmall} color={Colors.Orange} />
                </RightContainer>
              </Fragment>
            );
          }

          if (Boolean(value) && onClear) {
            return (
              <Fragment>
                <Spacer incrementButton />
                <RightContainer onClick={() => onClear()} size={size}>
                  <Icon
                    icon={Icons.CancelCircle}
                    color={Colors.Grey4}
                    hoverColor={Colors.Grey3}
                    size={iconSize}
                  />
                </RightContainer>
              </Fragment>
            );
          }

          return <Spacer incrementButton />;
        })()}
      </Form>
      {validationError && <ValidationError validationError={validationError} />}
    </Container>
  );
}

export default React.forwardRef(Input);
