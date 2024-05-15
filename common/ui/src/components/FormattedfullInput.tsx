import React, { useState } from "react";
import styled from "styled-components";
import * as Polished from "polished";
import { Colors } from '../Colors';
import Icon, { Icons } from './Icon';
import Label from "./Label";
import Flex from "./Flex"
import MaxLength from "./MaxLength";
import ValidationError from './ValidationError';
import { media } from '../utils/MediaQuery';

export enum InputfullFormats {
  Price = 'Price',
  Percent = 'Percent',
}

type ContainerProps = {
  width?: string;
}

const Container = styled.div<ContainerProps>`
  width: ${(props) => props.width};
`;

type FormProps = {
  hovered: boolean;
  focused: boolean;
  width?: string;
  margin?: string;
  disabled: boolean;
};

const Form = styled.form<FormProps>`
  margin: ${(props) => props.margin};
  width: ${(props) => props.width};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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
`;

const PriceContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 25px;
  background-color: ${Colors.Grey5};
`;

type StyledInputProps = {
  disabled: boolean;
};

const InputStyled = styled.input<StyledInputProps>`
  background-color: ${(props) =>
    props.disabled ? `${Colors.Grey6} !important` : null};
  color: ${(props) => (props.disabled ? Colors.Grey4 : Colors.Grey1)};
  outline: none;
  border: 0px;
  height: 38px;
  width: 100%;
  font-family: "neue-haas-grotesk-display", sans-serif;
  font-weight: 500;
  text-indent: 1px;
  transition: all 0.2s;
  padding: 0 16px;
  text-align: left;

  ${media.mobile`
    font-size: 1.6rem;
  `};

  ${media.desktop`
    font-size: 1.4rem;
  `};

  ::placeholder {
    color: ${Colors.Grey4};
  }
`;

const IconText = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey3};
`;

export type InputProps = {
  inputRef?: React.Ref<HTMLInputElement>;
  autoFocus?: boolean | undefined;
  placeholder?: string;
  value: string;
  defaultValue?: string;
  type?: string;
  format?: InputfullFormats;
  onMouseEnter?: any;
  onMouseLeave?: any;
  onChange?: any;
  onFocus?: any;
  onBlur?: any;
  onSubmit?: Function;
  canSubmit?: boolean;
  loading?: boolean;
  margin?: string;
  width?: string;
  onEnter?: Function;
  label?: string;
  subLabel?: string;
  tip?: string;
  maxLength?: number;
  validationError?: string;
  disabled?: boolean;
};

export default function Input({
  inputRef,
  autoFocus,
  placeholder,
  value,
  defaultValue,
  format = InputfullFormats.Price,
  type = "text",
  onMouseEnter,
  onMouseLeave,
  onChange,
  onFocus,
  onBlur,
  onSubmit,
  canSubmit = true,
  loading,
  margin,
  width,
  onEnter,
  label,
  subLabel,
  tip,
  maxLength,
  validationError,
  disabled = false,
}: InputProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);

  const submit = (event: any) => {
    event.preventDefault();
    if (onSubmit && canSubmit && !loading) {
      onSubmit();
    } else if (onEnter && !loading) {
      onEnter();
    }
  };

  return (
    <Container width={width}>
      <Flex justify="space-between">
        {label && <Label text={label} subText={subLabel} tip={tip} />}
        {maxLength && <MaxLength value={value} maxLength={maxLength} />}
      </Flex>
      <Form
        hovered={hovered}
        focused={focused}
        onSubmit={(event) => submit(event)}
        width={width}
        margin={margin}
        noValidate // disables default html5 validation
        disabled={disabled}
      >
        {format === InputfullFormats.Price && (
          <PriceContainer>
            <Icon 
              icon={Icons.Dollar} 
              size={14} 
              color={Colors.Grey3}
            />
          </PriceContainer>
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
        />
        {format === InputfullFormats.Percent && (
          <PriceContainer>
            <IconText>
              %
            </IconText>
          </PriceContainer>
        )}
      </Form>
      {validationError && (
        <ValidationError validationError={validationError} />
      )}
    </Container>
  );
}
