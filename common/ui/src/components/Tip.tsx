import React, { useLayoutEffect } from "react";
import styled from "styled-components";
import { Colors } from "../Colors";
import Icon, { Icons } from './Icon';
// import ReactTooltip from "react-tooltip";

type ContainerProps = {
  margin?: string;
};

const Container = styled.div<ContainerProps>`
  margin: ${(props) => props.margin};
`;

type TipProps = {
  tip?: string;
  margin?: string;
};

const Tip: React.FC<TipProps> = ({
  tip,
  margin,
}) => {
  useLayoutEffect(() => {
    // ReactTooltip.rebuild();
  }, []);
  return (
    <Container margin={margin} data-tip={tip}>
      <Icon icon={Icons.InfotipSolid} color={Colors.Grey4} size={12} />
    </Container>
  );
};

export default Tip;
