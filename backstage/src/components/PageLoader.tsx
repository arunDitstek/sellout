import React from "react";
import styled from "styled-components";
import { Colors, Loader, LoaderSizes } from "@sellout/ui";

type ContainerProps = {
  fade: boolean;
  nav: boolean;
  sideNav: boolean;
  isVeryTop: boolean;
};

const Container = styled.div<ContainerProps>`
  position: absolute; //need to re-check
  height: calc(100% - 60px);
  width: calc(100% - 60px);
  left: 60px;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => (props.nav ? null : Colors.White)};
  z-index: ${(props) => (props.isVeryTop ? 9999999999 : 1999)};
  display: ${(props) => (props.fade ? "none" : null)};
  transition: ${(props) =>
    props.fade ? "visibility 0.2s 0.2s, opacity 0.2s ease-out" : null};
  margin: 0 auto;
`;

type LoaderContainerProps = {
  nav: boolean;
  sideNav: boolean;
};

const LoaderContainer = styled.div<LoaderContainerProps>`
  position: relative;
  margin: 0 auto;
`;

type PageLoaderProps = {
  nav?: boolean;
  fade?: boolean;
  sideNav?: boolean;
  isVeryTop?: boolean;
};

const PageLoader: React.FC<PageLoaderProps> = ({
  nav = false,
  sideNav = false,
  fade,
  isVeryTop = false,
}) => {
  const [innerFade, setInnerFade] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => setInnerFade(true));
  }, []);

  return (
    <Container
      fade={typeof fade === "boolean" ? fade : innerFade}
      nav={nav}
      sideNav={sideNav}
      isVeryTop={isVeryTop}
    >
      <LoaderContainer nav={nav} sideNav={sideNav}>
        <Loader size={LoaderSizes.Large} color={Colors.Orange} />
      </LoaderContainer>
    </Container>
  );
};

export default PageLoader;
