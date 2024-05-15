import React, { Fragment } from "react";
import styled from "styled-components";
import * as Polished from "polished";
import { Colors } from "../Colors";
import Icon, { Icons } from "./Icon";

// Fixed issue SELLOUT-24
const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: auto;
  min-height: 42px;
  /* background-color: red; */
`;

type IconContainerProps = {
  active: boolean;
  justify: string;
}

const IconContainer = styled.div<IconContainerProps>`
  display: flex;
  align-items: center;
  justify-content: ${props => props.justify};
  flex: 1;
  /* background-color: blue; */
  height: 100%;

  &:hover {
    cursor: ${props => (props.active ? "pointer" : null)};
  }

  .svg-inline--fa {
    color: ${props =>
      props.active ? Polished.lighten(0.025, Colors.Orange) : null} !important;
  }
`;

const Value = styled.div`
  font-size: 2.4rem;
  color: ${Colors.Grey1};
  min-width: 20px;
  text-align: center;
`;

export type CounterProps = {
 value: number,
 maxValue?: number,
 minValue: number,
 onIncrement: Function,
 onDecrement: Function,
};

export default function Counter({
  value,
  maxValue,
  minValue = 0,
  onIncrement,
  onDecrement, 
}: CounterProps) {

  const canDecrement = value > minValue;
  const canIncrement = Boolean(!Boolean(maxValue) || (maxValue && value < maxValue));

  return (
    <Container>
      {value > 0 && (
        <Fragment>
          <IconContainer
            active={canDecrement}
            onClick={() => (canDecrement ? onDecrement() : null)}
            justify="flex-start"
          >
            <Icon
              icon={Icons.MinusCircleLight}
              color={canDecrement ? Colors.Orange : Colors.Grey5}
              size={24}
            />
          </IconContainer>
          <Value>{value}</Value>
        </Fragment>
      )}
      <IconContainer
        active={canIncrement}
        onClick={() => (canIncrement ? onIncrement() : null)}
        justify="flex-end"
      >
        <Icon
          icon={Icons.PlusCircleLight}
          color={canIncrement ? Colors.Orange : Colors.Grey5}
          size={24}
        />
      </IconContainer>
    </Container>
  );
}
