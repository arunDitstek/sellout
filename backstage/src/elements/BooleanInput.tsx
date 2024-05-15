import React, { Component } from 'react';
import styled from 'styled-components';
import { Colors } from '@sellout/ui';
import Label from '@sellout/ui/build/components/Label';

type ContainerProps = {
  margin?: string;
};

const Container = styled.div<ContainerProps>`
  margin: ${props => props.margin};
`;

type ButtonsProps = {}

const Buttons = styled.div<ButtonsProps>`
  border: 1px solid ${Colors.Grey5};
  background-color: ${Colors.White};
  height: 38px;
  width: 100px;
  border-radius: 10px;
  display: flex;
  overflow: hidden;
`;

type ButtonProps = {
  selected: boolean;
  right?: boolean;
}

const Button = styled.div<ButtonProps>`
  background-color: ${props => (props.selected ? Colors.Orange : Colors.White)};
  color: ${props => (props.selected ? Colors.White : Colors.Grey4)};
  font-size: 1.4rem;
  font-weight: 600;
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  border-radius: ${props => (props.selected ? '10px' : '10px')};
  transition: all 0.2s;

  &:hover {
    cursor: pointer;
  }
`;

type BooleanInputProps = {
  active: boolean;
  onChange: Function;
  margin?: string;
  label?: string;
  labelOn?: string;
  labelOff?: string;
  tip?: string;
};

const BooleanInput: React.FC<BooleanInputProps> = ({
  active,
  onChange,
  margin,
  label,
  labelOn,
  labelOff,
  tip,
}) => {
  return (
    <Container
      margin={margin}
    >
      {label && <Label text={label} tip={tip} />}
      <Buttons>
        <Button
          selected={!active}
          onClick={() => onChange(false)}
        >
          {labelOff || "NO"}
        </Button>
        <Button
          selected={active}
          onClick={() => onChange(true)}
          right={true}
        >
          {labelOn || "YES"}
        </Button>
      </Buttons>
    </Container>
  );
};

export default BooleanInput;