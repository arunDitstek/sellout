import React from "react";
import styled from "styled-components";
import { useSelector } from 'react-redux';
import { Colors, Icon, Icons } from "@sellout/ui";
import { BackstageState } from '../redux/store';
import { useHistory } from 'react-router-dom';
import * as Polished from 'polished';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TextContainer = styled.div`
  position: relative;
`;

const Text = styled.div`
  color: ${Colors.White};
  font-size: 1.8rem;
  font-weight: 500;
  word-wrap: nowrap;
  cursor: pointer;

  ::before {
    content: "";
    position: absolute;
    width: 100%;
    height: 1px;
    bottom: 0;
    left: 0;
    background-color: ${Colors.White};
    visibility: hidden;
    transform: scaleX(0);
    transition: all 0.2s ease-in-out 0s;
  }

  &:hover::before {
    visibility: visible;
    transform: scaleX(1);
  }
`;

const CurrentItem = styled.div`
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.8rem;
  margin-left: 16px;
`;

type ArtistDetailsBreadCrumbProps = {};

const ArtistDetailsBreadCrumb: React.FC<ArtistDetailsBreadCrumbProps> = () => {
  const artistState = useSelector((state: BackstageState) => state.artist);
  const { artistId, artistsCache } = artistState;
  const artist = artistsCache[artistId];
  const history = useHistory();

  /** Render */
  return (
    <Container>
      <TextContainer>
        <Text
          onClick={() => history.push('/admin/dashboard/performers')}
        >
          Performers
        </Text>
      </TextContainer>
      <Icon
        icon={Icons.RightChevronSolid}
        color={Polished.rgba(255, 255, 255, 0.6)}
        size={14}
        margin="0px 0px 0px 16px"
      />
      <CurrentItem>
        {artist?.name}
      </CurrentItem>
    </Container>
  );
};

export default ArtistDetailsBreadCrumb;