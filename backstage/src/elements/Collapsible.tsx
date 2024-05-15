import React from "react";
import styled from "styled-components";
import { Colors, Icon, Icons } from "@sellout/ui";

type ContainerProps = {

};

const Container = styled.div<ContainerProps>`
  
`;

type HeaderProps = {
  open: boolean;
};

const Header = styled.div<HeaderProps>`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 15px;
  background-color: ${Colors.White};
  border: 1px solid ${Colors.Grey5};
  border-radius: ${(props) => (props.open ? "10px 10px 0 0" : "10px")};

  &:hover {
    cursor: pointer;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Title = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  margin-left: 10px;
`;

const Content = styled.div`
  padding: 15px;
  background-color: ${Colors.White};
  border-radius: 0 0 10px 10px;
  border: 1px solid ${Colors.Grey5};
  border-top: 0px;
`;
 
type CollapsibleProps = {
  title: string;
  icon: any;
  children: React.ReactNode;
} & DropdownProps;

const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  icon,  
  children,
  isEnabled,
  enable,
  disable,
  moveUp,
  moveDown,
  remove,
}) => {
  const [open, setOpen] = React.useState(true);

  return (
    <Container>
      <Header onClick={() => setOpen(!open)} open={open}>
        <TitleContainer>
          <Icon icon={icon} size={14} color={Colors.Grey1} />
          <Title>{title}</Title>
        </TitleContainer>
      </Header>
      {open && <Content>{children}</Content>}
    </Container>
  );
};

export default Collapsible;

/********************************************************************************
 *  Dropdown
 *******************************************************************************/

type DropdownProps = {
  isEnabled?: boolean;
  enable?: Function;
  disable?: Function;
  moveUp?: Function;
  moveDown?: Function;
  remove?: Function;
}

const DropdownContainer = styled.div`

`;

const Dropdown: React.FC<DropdownProps> = ({
  isEnabled,
  enable,
  disable,
  moveUp,
  moveDown,
  remove,
}) => {
  const [open, setOpen] = React.useState(true);

  return (
    <DropdownContainer> 
      
    </DropdownContainer>
  );
};
