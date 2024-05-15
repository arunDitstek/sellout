import React from "react";
import styled from "styled-components";
import { Colors, Icons, Icon } from '@sellout/ui';

type ButtonProps = {
  margin?: string;
}

const Button = styled.div<ButtonProps>`
  /* transition: all 0.2s; */
  color: ${Colors.Grey3};
  cursor: pointer;
  margin: ${props => props.margin};
  font-weight: 500;
  font-size: 1.4rem;
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 20px;
  border-radius: 10px;
  box-sizing: border-box;
  border: 1px solid ${Colors.Grey5};

  &:hover {
    border: 1px solid ${Colors.Orange};
    color: ${Colors.Orange};
    background: rgba(255, 112, 15, 0.05);
  }
`;

const Left = styled.div`
  display: flex;
`;

const Right = styled.div`
  display: none;
  ${Button}:hover & {
    display: block;
  }
`;

const Text = styled.div`
`;

type HighlightButtonProps = {
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  margin?: string;
  text: string;
  icon?: any;
};

const HighlightButton: React.FC<HighlightButtonProps> = ({ 
  onClick,
  margin,
  text,
  icon,
 }) => {
  return (
    <Button
      onClick={onClick ? onClick : () => {}}
      margin={margin}
    >
    <Left>
      {icon && (
        <Icon
          icon={icon}
          size={14}
          color="inherit"
          margin="0px 10px 0px 0px"
        />
      )}
      <Text>
        {text}
      </Text>
    </Left>
    <Right>
      <Icon
        icon={Icons.RightChevronSolid}
        size={14}
        color="inherit"
      />
    </Right>
    </Button>
  );
};

export default HighlightButton;
