import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import { useHistory } from 'react-router-dom';
import SelectArtistType from '../../components/create-artist/SelectArtistType';
import {
  Title,
  TitleContainer,
} from '../../components/create-flow/CreateFlowStyles';

// this one is different from the normal createFlowStyles exported one
const Container = styled.div`
  padding: 32px;
  height: calc(100% - 190px);
  overflow: scroll;
  padding-bottom: 100px;
  display: flex;
`;

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

type CreateArtistTypeProps = {
  match: any;
};

const CreateArtistType: React.FC<CreateArtistTypeProps> = ({ match }) => {
  const history = useHistory();

  /* State */
  const artistState = useSelector((state: BackstageState) => state.artist);
  const { artistId, artistsCache } = artistState;
  const artist = artistsCache[artistId];

  // User is not allowed to change artist type after the artist is already created
  // so we redirect them.
  React.useLayoutEffect(() => {
    if (artist?.createdAt) {
      history.push(`/admin/dashboard/performers/create/details?artistId=${artistId}`)
    }
  }, [artist, artistId, history]);

  return (
    <Container>
      <Content>
        <TitleContainer>
          <Title>
            Choose Perfomer Type
          </Title>
        </TitleContainer>
        <SelectArtistType />
      </Content>
    </Container>
  );
};

export default CreateArtistType;
