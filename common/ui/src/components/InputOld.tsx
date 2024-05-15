import React, { Fragment, useState } from "react";
import styled from "styled-components";
import * as Polished from 'polished';
import { Colors } from "../Colors";
import Icon, { Icons } from './Icon'
import Loader, { LoaderSizes } from "./Loader";

type FormProps = {
  hovered: boolean;
  focused: boolean;
  width?: string;
};

const Form = styled.form<FormProps>`
  width: ${props => props.width};
  display: flex;
  flex-direction: row;
  position: relative;
  border-radius: 10px;
  transition: all 0.2s;
  border: 1px solid
    ${props => {
      if (props.focused) return Colors.Grey3;
      if (props.hovered) return Colors.Grey4;
      return Colors.Grey5;
    }};
`;

type ButtonProps = {
  canSubmit: boolean;
};

const Button = styled.div<ButtonProps>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Colors.White};
  height: 50px;
  width: 50px;
  border-radius: 0 10px 10px 0;
  top: -1px;
  right: -1px;
  transition: all 0.2s;
  background-color: ${props =>
    props.canSubmit ? Colors.Orange : Colors.Grey6};

  &:hover {
    cursor: ${props => (props.onClick ? "pointer" : null)};
    background-color: ${props =>
      props.canSubmit ? Polished.lighten(0.025, Colors.Orange) : null};
  }

  &:active {
    cursor: ${props => (props.onClick ? "pointer" : null)};
    background-color: ${props =>
      props.canSubmit ? Polished.darken(0.025, Colors.Orange) : null};
  }
`;

const LeftContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 15px;
  top: 0px;
  left: 0px;
`;

const RightContainer = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  width: 50px;
  top: -1px;
  right: -1px;

  &:hover {
    cursor: ${props => (props.onClick ? "pointer" : null)};
  }
`;

const Spacer = styled.div`
  width: 50px;
`;

type StyledInputProps = {
  margin?: string;
  padding?: string;
}

const InputStyled = styled.input<StyledInputProps>`
  background-color: ${Colors.White};
  color: ${Colors.Grey1};
  outline: none;
  border: 0px;
  border-radius: 10px;
  height: 48px;
  width: fill-available;
  font-size: 1.4rem;
  font-weight: 500;
  padding: 0 0 0 10px;
  transition: all 0.2s;
  margin: ${props => props.margin};
  padding: ${props => props.padding};
  
  ::placeholder {
    color: ${Colors.Grey4};
  }
`;

export type InputProps = {
  inputRef?: React.Ref<HTMLInputElement>;
  autoFocus?: boolean | undefined;
  placeholder?: string;
  value: string;
  defaultValue?: string;
  icon?: any;
  type?: string;
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
};

export default function Input({
  inputRef,
  autoFocus,
  placeholder,
  value,
  defaultValue,
  icon,
  type = 'text',
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
}: InputProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const submit = (event: any) => {
    event.preventDefault();
    if(onSubmit && canSubmit && !loading) {
      onSubmit();
    }
  }
  
  return (
    <Form
      hovered={hovered}
      focused={focused}
      onSubmit={event => submit(event)}
      width={width}
    >
      {icon && (
        <LeftContainer>
          <Icon
            icon={icon}
            size={16}
            color={focused ? Colors.Grey1 : Colors.Grey4}
          />
        </LeftContainer>
      )}
      <InputStyled
        ref={inputRef}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        type={type}
        onChange={onChange}
        onFocus={event => {
          setFocused(true);
          if (onFocus) onFocus(event);
        }}
        onBlur={event => {
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
        margin={margin}
        padding={padding}
      />

      {(() => {
        if (onSubmit) {
          return (
            <Fragment>
              <Spacer />
              <Button
                canSubmit={canSubmit}
                onClick={event => submit(event)}
              >
                {(() => {
                  if (loading) {
                    return <Loader size={LoaderSizes.VerySmall} />;
                  }

                  return (
                    <Icon
                      icon={Icons.RightChevronCircle}
                      color={canSubmit ? Colors.White : Colors.Grey4}
                      size={16}
                    />
                  );
                })()}
              </Button>
            </Fragment>
          );
        }

        if (Boolean(value) && onClear) {
          return (
            <Fragment>
              <Spacer />
              <RightContainer onClick={() => onClear()}>
                <Icon
                  icon={Icons.CancelCircle}
                  color={Colors.Grey3}
                  size={16}
                />
              </RightContainer>
            </Fragment>
          );
        }

        return <Spacer />;
      })()}
    </Form>
  );
}
