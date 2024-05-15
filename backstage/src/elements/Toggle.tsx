import React from "react";
import styled from "styled-components";
import { Colors } from "@sellout/ui";
import Tip from "@sellout/ui/build/components/Tip";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

type SliderContainerProps = {
  active: boolean;
}

const SliderContainer = styled.div<SliderContainerProps>`
  position: relative;
  height: 12px;
  width: 20px;
  border-radius: 100px;
  background-color: ${props => props.active ? Colors.Orange : Colors.Grey4};
  transition: all 0.2s;
`;

type SliderProps = {
  active: boolean;
}

const Slider = styled.div<SliderProps>`
  position: absolute;
  height: 9.5px;
  width: 9.5px;
  border-radius: 100%;
  background-color: ${Colors.White};
  transition: all;
  left: ${props => props.active ? '9px' : '1px'};
  transition: all 0.2s;
  top: 1px;
`;

const Title = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  margin-left: 10px;
`;
const InnerContainer = styled.div`
  display: flex;
  align-items: center;
  &:hover {
    cursor: pointer;
  }
}`; 

type ToggleProps = {
  active: boolean;
  onChange: Function;
  title?: string;
  tip?: string;
};

const Toggle: React.FC<ToggleProps> = ({
  active,
  onChange,
  title,
  tip,
}) => {
  return (
    <Container >
      <InnerContainer onClick={() => onChange(!active)}>
      <SliderContainer active={active}>
        <Slider active={active} />
      </SliderContainer>
      {title && <Title>{title}</Title>}
      {tip && <Tip tip={tip} margin="0 0 0 7px"/>}
      </InnerContainer>
    </Container>
  );
};

export default Toggle;
