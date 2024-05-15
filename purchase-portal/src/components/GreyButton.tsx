import React from "react";
import styled from "styled-components";
import { Colors } from "@sellout/ui/build/Colors";
import Icon, { Icons } from '@sellout/ui/build/components/Icon';

const Container = styled.div`
  height: 28px;
  display: flex;
  align-items: center;
  background-color: ${Colors.Grey6};
  border-radius: 5px;
  padding: 0 8px;

  &:hover {
    cursor: pointer;
  }
`;

const Text = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${Colors.Grey2};
  text-transform: uppercase;
  margin-left: 7px;
`;

type GreyButtonProps = {
  text: string;
  icon: any;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const GreyButton: React.FC<GreyButtonProps> = ({
  text, 
  icon, 
  onClick = () => {} 
}) => {

  return (
    <Container onClick={onClick}>
      {icon && <Icon icon={icon} color={Colors.Grey2} size={12} />}
      <Text>{text}</Text>
    </Container>
  );
};

export default GreyButton;
