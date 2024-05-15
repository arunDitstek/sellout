import React from "react";
import styled from "styled-components";

type ContainerProps = {
  open: boolean;
  showOverflow: boolean;
  height: string;
};

const Container = styled.div<ContainerProps>`
  position: relative;
  overflow: ${props => props.showOverflow ? null : 'hidden'};
  height: ${props => props.open ? props.height : '0px'};
  transition: 0.3s;
`;

type AnimateHeight = {
  children: React.ReactNode;
  open: boolean;
  height: string;
};

const AnimateHeight: React.FC<AnimateHeight> = ({ 
  children, 
  open, 
  height 
}) => {
  const [showOverflow, setShowOverflow] = React.useState(open);

  React.useEffect(() => {
    if(open) {
      setTimeout(() => setShowOverflow(true), 300);
    } else {
      setShowOverflow(false);
    }
  }, [open]);

  return (
    <Container
      open={open}
      height={height}
      showOverflow={showOverflow}
    >
      {children}
    </Container>
  );
};

export default AnimateHeight;
