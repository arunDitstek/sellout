import React, { useState } from "react";
import styled from "styled-components";
import SideNavigationButtons from './SideNavigationButtons';
import { Colors } from '@sellout/ui';

type SideNavigationContainerProps = {
  open?: boolean;
};

const SideNavigationContainer = styled.div<SideNavigationContainerProps>`
  position: absolute;
  background-color: ${Colors.DarkBlue};
  box-shadow: 4px 0px 20px rgba(0, 0, 0, 0.05);
  width: ${(props) => props.open ? '240px' : '60px'};
  overflow-x: hidden;
  overflow-y: scroll;
  transition: all 0.4s;
  height: 100%;
  z-index: 2000;

  @media print {
    display: none;
  }
`;

type SideNavigationProps = {};

const SideNavigation: React.FC<SideNavigationProps> = () => {
  const [open, setOpen] = useState(false);

  const openSideNav = () => setOpen(true);
  const closeSideNav = () => setOpen(false);
  return (
    <SideNavigationContainer
      onMouseEnter={openSideNav}
      onMouseLeave={closeSideNav}
      open={open}
    >
      <SideNavigationButtons open={open} setOpen={setOpen} /> 
    </SideNavigationContainer>
  );
};

export default SideNavigation;
