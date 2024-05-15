import React from "react";
import styled, { keyframes, css } from "styled-components";
import SideNavigationButtons from "./SideNavigationButtons";
import { Colors } from "@sellout/ui";

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0%);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0%);
  }

  to {
    transform: translateX(-100%);
  }
`;

type ContainerProps = {
  visible: boolean;
};
//fix initial position;
const Container = styled.div<ContainerProps>`
  transform: translateX(-100%);
  animation: ${(props) =>
    props.visible
      ? css`
          ${slideIn} 0.4s forwards
        `
      : css`
          ${slideOut} 0.4s forwards
        `};
  position: fixed;
  background-color: ${Colors.DarkBlue};
  box-shadow: 4px 0px 20px rgba(0, 0, 0, 0.05);
  height: calc(100% - 50px);
  width: 235px;
  overflow-x: hidden;
  overflow-y: scroll;
  z-index: 800;
  top: 50px;
  bottom: 0px;

  @media (max-width: 640px) {
    padding: 20px 0 10px 0;
  }

  @media print {
    display: none;
  }
`;

type MobileSideNavigation = {
  visible: boolean;
  setVisible: any;
};

const MobileSideNavigation: React.FC<MobileSideNavigation> = ({
  visible,
  setVisible,
}) => {
  return (
    <Container visible={visible}>
      <SideNavigationButtons open={true} setVisible={setVisible} />
    </Container>
  );
};

export default MobileSideNavigation;
