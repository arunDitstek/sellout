import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import { TextButton } from "@sellout/ui";
import Label from "@sellout/ui/build/components/Label";
import { TypeCardNonInteractive } from '../TypeCard';
import * as DefaultImage from '../../utils/DefaultImage'
import useNavigateToCreateArtist from '../../hooks/useNavigateToCreateArtist.hook';

const Container = styled.div`
  position: relative;
`;

type CreateArtistSwitchType = {};

const CreateArtistSwitchType: React.FC<CreateArtistSwitchType> = () => {
  /* Hooks */
  const navigateToCreateArtist = useNavigateToCreateArtist();

  /* State */
  const artistState = useSelector((state: BackstageState) => state.artist);
  const { artistId, artistsCache } = artistState;
  const artist = artistsCache[artistId];

  /** Render */
  return (
    <Container>
      <Label
        text="Performer type"
      />
      <TypeCardNonInteractive
        text={artist.type}
        imageUrl={DefaultImage.getArtistImage(artist.type)}
      />
      {!artist?.createdAt && (
        <TextButton onClick={() => navigateToCreateArtist(artistId, true)} margin="8px 0 0">
          Switch artist type
        </TextButton>
      )}
    </Container>
  );
};

export default CreateArtistSwitchType;
