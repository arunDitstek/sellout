import React from "react";
import styled from "styled-components";
import CreateEventNavigation from './CreateEventNavigation'
import useIsCreateEventType from '../../hooks/useIsCreateEventType.hook';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

type CreateEventBreadCrumbProps = {};

const CreateEventBreadCrumb: React.FC<CreateEventBreadCrumbProps> = () => {
  const isCreateEventType: boolean = useIsCreateEventType();

  return (
    <Container>
      {!isCreateEventType && (
        <CreateEventNavigation />
      )}
    </Container>
  );
};

export default CreateEventBreadCrumb;
