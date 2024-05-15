import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as ArtistActions from "../../redux/actions/artist.actions";
import TypeCard from "../TypeCard";
import {
  ArtistTypeEnum,
} from "@sellout/models/.dist/interfaces/IArtist";
import { DefaultArtistImageUrls } from '@sellout/models/.dist/enums/DefaultArtistImageUrls';
import IArtistPressKit from "@sellout/models/.dist/interfaces/IArtistPressKit";
import * as Intercom from '../../utils/Intercom';
import Masonry from 'react-masonry-component';
import TextButton, { TextButtonSizes } from '@sellout/ui/build/components/TextButton';
import { Colors } from '@sellout/ui';
import * as DefaultImage from '../../utils/DefaultImage'

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const Text = styled.div`
  display: flex;
  font-weight: 500;
  font-size: 1.4rem;
  color: ${Colors.Grey1};
  align-items: center;
`;

type SelectArtistTypeProps = {};

const SelectArtistType: React.FC<SelectArtistTypeProps> = () => {
  /* State */
  const artistState = useSelector((state: BackstageState) => state.artist);
  const { artistId, artistsCache } = artistState;
  const artist = artistsCache[artistId];
  const pressKit: IArtistPressKit = artist?.pressKits?.[0] as IArtistPressKit;
  const artistImageUrl = pressKit.posterImageUrls[0];

  const addImage = (imageUrl: string) => {
    dispatch(
      ArtistActions.addPressKitImageUrl(
        artistId,
        pressKit._id,
        imageUrl
      )
    );
  };

  const dispatch = useDispatch();
  const setArtistType = (type: ArtistTypeEnum) => {
    dispatch(ArtistActions.setArtist(artistId, { type }));
    // Only update the aritst image automatically if there isn't one or the current one is a default.
    if (!artistImageUrl || Object.values(DefaultArtistImageUrls).includes(artistImageUrl as any)) {
      addImage(DefaultImage.getArtistImage(type));
    }
    dispatch(ArtistActions.saveArtist());
  };

  /** Render */
  return (
    <Container>
      <Masonry
        options={{ horizontalOrder: true }}
        enableResizableChildren
      >
        {Object.values(ArtistTypeEnum).map((type: ArtistTypeEnum) => {
          return (
            <TypeCard
              key={type}
              text={type}
              imageUrl={DefaultImage.getArtistImage(type)}
              onClick={() => setArtistType(type)}
              margin="0 19px 19px 0"
            />
          );
        })}
      </Masonry>
      <Text>
        Need a performer type that we don't have?
        &nbsp;<TextButton size={TextButtonSizes.Regular} onClick={() => Intercom.toggle()}>Let us know</TextButton>
      </Text>
    </Container>
  );
};

export default SelectArtistType;
