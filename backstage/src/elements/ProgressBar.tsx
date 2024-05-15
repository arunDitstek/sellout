import React from "react";
import styled from "styled-components";
import { Colors } from '@sellout/ui';

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 2px;
  background-color: ${Colors.Grey4};
`;

type InnerProps = {
  width: string;
  color: Colors;
}

const Inner = styled.div<InnerProps>`
  height: 2px;
  width: ${props => props.width};
  background-color: ${props => props.color};
`;

type ProgressBarProps = {
  value: number;
  maxValue: number;
  color?: Colors
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  maxValue,
  color = Colors.Grey2,
}) => {
  return (
    <Container>
      <Inner
        width={maxValue === 0 ? `0%` : `${(value / maxValue) * 100}%`}
        color={color}
      />
    </Container>
  );
};

export default ProgressBar;
