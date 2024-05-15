import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Colors } from "@sellout/ui/build/Colors";
import Icon, { Icons } from '@sellout/ui/build/components/Icon';
import * as Polished from 'polished';
import { Flex } from '@sellout/ui';

const OptionContainer = styled.div`
  height: 56px;
  box-sizing: border-box;
  background: #FFFFFF;
  border: 1px solid ${Colors.Grey5};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  transition: all 0.1s;

  &:hover {
    cursor: ${props => props.onClick ? 'pointer' : null};
    background: ${Polished.rgba(Colors.Orange, 0.05)};
    border: 1px solid ${Colors.Orange};
  }
`;

const IconContainer = styled.div`
  position: relative;
  width: 20px;
  margin-left: 16px;
  display: flex;
  align-items: center;
`;

type TextProps = {
  color: Colors;
}

const Text = styled.div<TextProps>`
  font-size: 1.6rem;
  color: ${props => props.color};
  margin-left: 12px;
  font-weight: 500;
`;

type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;

type Option = {
  text: string;
  icon: any;
  onClick: ClickHandler;
};

type OptionProps = {
  option: Option;
}

const Option: React.FC<OptionProps> = ({
  option: { text, icon, onClick }
}: OptionProps) => {
  const [hovered, setHovered] = React.useState(false);

  return (
    <OptionContainer onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <Flex align="center">
        <Icon icon={icon} margin="0 0 0 16px" size="16px" top="1px" color={hovered ? Colors.Orange : Colors.Grey3}/>
        <Text color={hovered ? Colors.Orange : Colors.Grey3}>{text}</Text>
      </Flex>
      {hovered && <Icon icon={Icons.RightChevronRegular} top="1px" margin="0 16px 0 0" size="16px" color={Colors.Orange}/>}
    </OptionContainer>
  );
};

const SelectContainer = styled.div`
  margin: 0;
`;

type SelectProps = {
  options: Option[];
}

const Select: React.FC<SelectProps> = ({ options }) => {
  return (
    <SelectContainer>
      {options.map((option, index) => (
        <Option key={index} option={option} />
      ))}
    </SelectContainer>
  );
}

export default Select;
