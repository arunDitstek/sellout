import React from "react";
import styled from "styled-components";
import { Colors } from '@sellout/ui';

type TextProps = {
  margin?: string;
}

const Text = styled.div<TextProps>`
  font-size: 1.4rem;
  font-weight: 500;
  margin: ${props => props.margin};
  color: ${Colors.Red};
`;

type TextButtonProps = {
  children: string;
  margin?: string;
};

const Error: React.FC<TextButtonProps> = ({
  children,
  margin,
 }) => {
  return (
    <Text
      margin={margin}
    >
      {children}
    </Text>
  );
};

export default Error;
