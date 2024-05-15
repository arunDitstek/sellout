import React from "react";
import styled from 'styled-components';
import { useDispatch } from "react-redux";
import * as ArtistActions from "../../redux/actions/artist.actions";
import IArtistPressKit from "@sellout/models/.dist/interfaces/IArtistPressKit";
import RichTextEditor from "../../elements/RichTextEditor";
import useArtist from "../../hooks/useArtist.hook";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  position: relative;
  width: 600px;
  ${media.mobile`
    width: 100%;
  `};
`;

type CreateArtistDescriptionProps = {};

const CreateArtistDescription: React.FC<CreateArtistDescriptionProps> = () => {
  /* Hooks */
  const { artist, artistId } = useArtist();
  /* State */
  const pressKit: IArtistPressKit = artist?.pressKits?.[0] as IArtistPressKit;

  /* Actions */
  const dispatch = useDispatch();
  const setPressKitDescription = (description: string) => {
    dispatch(
      ArtistActions.setPressKitDescription(artistId, pressKit._id, description)
    );
  };

  /** Render */
  return (
    <Container>
      <RichTextEditor
        value={pressKit.description as string}
        onChange={(description: string) => {
          setPressKitDescription(description);
        }}
        placeholder="Enter the artist bio"
        label="Bio"
        subLabel="(optional)"
      />
    </Container>
  );
};

export default CreateArtistDescription;
