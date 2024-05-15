import React from "react";
import styled from "styled-components";
import CreateArtistNavigation from './CreateArtistNavigation'
import useIsCreateArtistType from '../../hooks/useIsCreateArtistType.hook';
import { Colors } from '@sellout/ui';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Text = styled.div`
  color: ${Colors.White};
  font-size: 1.8rem;
  font-weight: 500;
  margin-right: 16px;
  word-wrap: nowrap;
`;

type CreateArtistBreadCrumbProps = {};

const CreateArtistBreadCrumb: React.FC<CreateArtistBreadCrumbProps> = () => {

  const isCreateArtistType: boolean = useIsCreateArtistType();

  return (
    <Container>
      <Text>
        Create a performer
      </Text>
      {!isCreateArtistType && (
        <CreateArtistNavigation />
      )}
    </Container>
  );
};

export default CreateArtistBreadCrumb;
