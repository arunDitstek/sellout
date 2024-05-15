import React from "react";
import styled from "styled-components";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const OuterContainer = styled.div`
  position: relative;
  width: 274px;
  overflow: scroll;
  min-width: 274px;
  z-index: 100;
  margin: 24px 0px 0px 24px;
  display: flex;

  @media print {
    display: none;
  }
  
`;

const InnerContainer = styled.div`
  position: absolute;
  width: 274px;
  height: 100%;
  min-width: 274px;

  ${media.mobile`
    position: relative;
  `};
`;

type PropTypes = {
  children?: React.ReactNode;
};

const SubSideNavigation: React.FC<PropTypes> = ({ children }) => {
  return (
    <OuterContainer>
      <InnerContainer>{children}</InnerContainer>
    </OuterContainer>
  );
};

export default SubSideNavigation;
