import React, { Fragment, useState } from "react";
import styled from "styled-components";
import * as Polished from "polished";
import { Colors, Icon, Icons, Loader, LoaderSizes } from "@sellout/ui";
import Label from "@sellout/ui/build/components/Label";
import Flex from "@sellout/ui/build/components/Flex"
import MaxLength from "@sellout/ui/build/components/MaxLength";
import ValidationError from '@sellout/ui/build/components/ValidationError';
import { media } from '@sellout/ui/build/utils/MediaQuery';

type ContainerProps = {
  width?: string;
  margin?: string
}

const Container = styled.div<ContainerProps>`
  width: ${(props) => props.width};
  margin: ${(props) => props.margin};
`;

type TextAreaStyledProps = {
  padding?: string;
  height?: string;
  width?: string;
};

const TextAreaStyled = styled.textarea<TextAreaStyledProps>`
  background-color: ${Colors.White};
  color: ${Colors.Grey1};
  outline: none;
  border: 0px;
  border-radius: 10px;
  border: 1px solid ${Colors.Grey5};
  height: ${props => props.height};
  width: fill-available;
  font-family: "neue-haas-grotesk-display", sans-serif;
  font-weight: 500;
  padding: 10px 15px;
  text-indent: 1px;
  transition: all 0.2s;
  resize: none;

  ${media.mobile`
    font-size: 1.6rem;
  `};

  ${media.desktop`
    font-size: 1.4rem;
  `};


  &:hover {
    border: 1px solid ${Polished.darken(0.05, Colors.Grey5)};
  }

  &:focus {
    border: 1px solid ${Colors.Grey4};
  }
`;

export type TextAreaProps = {
  inputRef?: React.Ref<HTMLTextAreaElement>;
  autoFocus?: boolean | undefined;
  placeholder?: string;
  value: string;
  onMouseEnter?: any;
  onMouseLeave?: any;
  onChange?: any;
  onFocus?: any;
  onBlur?: any;
  margin?: string;
  padding?: string;
  width?: string;
  height?: string;
  label?: string;
  subLabel?: string;
  tip?: string;
  maxLength?: number;
  validationError?: string;
};

export default function TextArea({
  inputRef,
  autoFocus,
  placeholder,
  value,
  onMouseEnter,
  onMouseLeave,
  onChange,
  onFocus,
  onBlur,
  margin,
  width,
  height,
  label,
  subLabel,
  tip,
  maxLength,
  validationError,
}: TextAreaProps) {
  return (
    <Container width={width} margin={margin}>
      <Flex justify="space-between">
        {label && <Label text={label} subText={subLabel} tip={tip} />}
        {maxLength && <MaxLength value={value} maxLength={maxLength} />}
      </Flex>
      <TextAreaStyled
        ref={inputRef}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e: React.FormEvent<HTMLTextAreaElement>) => {
          if (maxLength && e.currentTarget.value.length > maxLength) {
            // do nothing, the max length has been reached
          } else {
            onChange(e);
          }
        }}
        onFocus={(event) => {
          if (onFocus) onFocus(event);
        }}
        onBlur={(event) => {
          if (onFocus) onBlur(event);
        }}
        onMouseEnter={(event: any) => {
          if (onMouseEnter) onMouseEnter(event);
        }}
        onMouseLeave={(event: any) => {
          if (onMouseLeave) onMouseLeave(event);
        }}
        height={height}
      />
      {validationError && (
        <ValidationError validationError={validationError} />
      )}
    </Container>
  );
}
