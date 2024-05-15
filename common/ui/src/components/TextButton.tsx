import React from "react";
import styled from "styled-components";
import { Colors } from '../Colors';
import Icon from './Icon';

export enum TextButtonSizes {
  Large = "Large",
  Regular = "Regular",
  Small = "Small",
}

type ContainerProps = {
  margin?: string;
};

const Container = styled.div<ContainerProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: ${(props) => props.margin};
`;

type TextProps = {
  size: TextButtonSizes;
  color: Colors;
};

const Text = styled.div<TextProps>`
  font-size: ${(props) => {
    if (props.size === TextButtonSizes.Large) return "1.8rem";
    if (props.size === TextButtonSizes.Regular) return "1.4rem";
    if (props.size === TextButtonSizes.Small) return "1.2rem";
    return "1.4rem";
  }};
  color: ${props => props.color};
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    text-decoration: none;
  }
`;

const TextWithoutLink = styled.span`
  padding-right: 2px;
`;

const InnerContainer = styled.div`
  display: flex;
  align-items: center;
}`;

type TextButtonProps = {
  children: string | React.ReactNode;
  size?: TextButtonSizes;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  margin?: string;
  icon?: any;
  iconRotation?: number;
  color?: Colors;
  textWithoutLink?:string| React.ReactNode;
};

const TextButton: React.FC<TextButtonProps> = ({
  children,
  size = TextButtonSizes.Regular,
  onClick,
  margin,
  icon,
  iconRotation,
  color = Colors.Orange,
  textWithoutLink,
}) => {

  const iconSize = (() => {
    if (size === TextButtonSizes.Large) {
      return 14;
    }
    if (size === TextButtonSizes.Regular) {
      return 12;
    }
    if (size === TextButtonSizes.Small) {
      return 10;
    }
    return 12;
  })();

  return (
    <Container margin={margin}>
      <InnerContainer onClick={onClick ? onClick : () => { }}>
        {icon && (
          <Icon
            icon={icon}
            size={iconSize}
            color={color}
            margin="0 7px 0 0"
            rotation={iconRotation}
          />
        )}
        <TextWithoutLink>{textWithoutLink}</TextWithoutLink>
        <Text size={size} color={color}>
          {children}
        </Text>
      </InnerContainer>
    </Container>
  );
};

export default TextButton;
