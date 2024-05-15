import React from "react";
import styled from "styled-components";

type FlexProps = {
  direction?: string;
  justify?: string;
  align?: string;
  padding?: string;
  margin?: string;
  flex?: string;
  height?: string;
};

const Container = styled.div<FlexProps>`
  display: flex;
  flex-direction: ${(props) => props.direction};
  justify-content: ${(props) => props.justify};
  align-items: ${(props) => props.align};
  padding: ${(props) => props.padding};
  margin: ${(props) => props.margin};
  flex: ${(props) => props.flex};
  height: ${(props) => props.height};
`;

const Flex: React.FC<FlexProps> = ({ 
  children,
  direction = 'row',
  justify = '',
  align = '',
  padding = '',
  margin = '',
  flex = '',
  height = '',
 }) => {
  return (
    <Container
      direction={direction}
      justify={justify}
      align={align}
      padding={padding}
      margin={margin}
      flex={flex}
      height={height}
    >
      {children}
    </Container>
  );
};

export default Flex;
