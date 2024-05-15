import React from 'react';
import styled from 'styled-components';
import { Colors } from '@sellout/ui';

const INITIAL_OFFSET = 25;
const circleConfig = {
  viewBox: '0 0 36 36',
  x: '18',
  y: '18',
  radio: '15.91549430918954'
};

const Container = styled.svg``;

const Ring = styled.circle``;

const Label = styled.g`
  transform: translateY(0.1em);
`;

const Percent = styled.text`
  font-size: 0.5em;
  text-anchor: middle;
  transform: translateY(-0.25em);
  font-weight: 600;
`;

const Text = styled.text`
  font-size: 0.4em;
  text-anchor: middle;
  transform: translateY(0.7em);
  font-weight: 500;
`;

type OuterContainerProps = {
  width?: string;
};

const OuterContainer = styled.div<OuterContainerProps>`
  width: ${props => props.width || '90px'};
`;

type ProgressCircleProps = {
  percentage: number;
  width?: string;
};

// could animate later or use D3
// https://dev.to/dastasoft/animated-circle-progress-bar-with-svg-as-react-component-28nm
const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  width,
}) => {
  /* Render */
  return (
    <OuterContainer width={width}>
      <Container viewBox={circleConfig.viewBox}>
        <Ring
          cx={circleConfig.x}
          cy={circleConfig.y}
          r={circleConfig.radio}
          fill="transparent"
          stroke={Colors.Grey5}
          strokeWidth="1px"
        />
        <Ring
          cx={circleConfig.x}
          cy={circleConfig.y}
          r={circleConfig.radio}
          fill="transparent"
          stroke={Colors.Green}
          strokeWidth="1px"
          strokeDasharray={`${percentage} ${100 - percentage}`}
          strokeDashoffset={INITIAL_OFFSET}
        />
        <Label>
          <Percent x="50%" y="50%" fill={Colors.Grey1}>
            {percentage}%
          </Percent>
          <Text x="50%" y="50%" fill={Colors.Grey3}>
            sold out
          </Text>
        </Label>
      </Container>
    </OuterContainer>
  );
};

export default ProgressCircle;