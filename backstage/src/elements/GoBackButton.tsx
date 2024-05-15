import React from "react";
import styled from "styled-components";
import { Icon, Icons, Colors } from '@sellout/ui';
import * as Polished from 'polished';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 28px;
  width: 86px;
  background-color: ${Colors.Grey6};
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    cursor: pointer;
    background-color: ${Polished.lighten(0.01, Colors.Grey6)};
  }

  &:active {
    background-color: ${Polished.darken(0.01, Colors.Grey6)};
  }
`; 


const Text = styled.div`
  color: ${Colors.Grey2};
  font-size: 1.2rem;
  margin-left: 7px;
`;

type GoBackButtonProps = {
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const GoBackButton: React.FC<GoBackButtonProps> = ({ 
  onClick,
 }) => {
  return (
    <Container
      onClick={onClick ? onClick : () => {}}
    >
      <Icon 
        icon={Icons.LeftArrowSolid} 
        color={Colors.Grey2}
        size={12}
      />
      <Text>GO BACK</Text>
    </Container>
  );
};

export default GoBackButton;
