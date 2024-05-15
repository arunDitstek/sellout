import React from "react";
import styled from "styled-components";
import { Colors } from "@sellout/ui";
import { FadeIn } from "@sellout/ui/build/components/Motion";

type TextProps = {
  margin?: string;
};

const Text = styled(FadeIn)<TextProps>`
  font-size: 1.4rem;
  font-weight: 500;
  margin: ${(props) => props.margin};
  color: ${Colors.Red};
`;

type ErrorProps = {
  children: string;
  margin?: string;
};

const Error: React.FC<ErrorProps> = ({ children, margin }) => {
  return <Text margin={margin}>{children}</Text>;
};

export default Error;
