import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes} from '@sellout/ui/build/components/Button';
import Error from '../../elements/Error';
import * as Validation from '@sellout/ui/build/utils/Validation';
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";
import CreateArtistName from "../create-artist/CreateArtistName";
import CreateArtistPosterImage from "../create-artist/CreateArtistPosterImage";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  width: 400px;
  ${media.mobile`
    width: 100%;
  `};
`;

const Spacer = styled.div`
  height: 30px;
`;

type CreateArtistModalProps = {
  createArtist: Function;
}

const CreateArtistModal: React.FC<CreateArtistModalProps> = ({
  createArtist,
}) => {
  /* State */
  const artistState = useSelector((state: BackstageState) => state.artist);
  const { artistId, artistsCache, errorMsg } = artistState;
  const artist = artistsCache[artistId];

  /* Actions */
  const dispatch = useDispatch();

  const popModal = () => dispatch(AppActions.popModal());

  /** Render */
  return (
    <ModalContainer>
      <ModalHeader title="Create Performer" close={popModal} />
      <ModalContent>
        <Container>
          <CreateArtistName />
          <Spacer />
          <CreateArtistPosterImage />
          {errorMsg && (
            <Error
              children={errorMsg}
              margin="16px 0px 0px"
            />
          )}
        </Container>
      </ModalContent>
      <ModalFooter>
        <div />
        <Button
          type={ButtonTypes.Thin}
          text="CREATE PERFORMER"
          onClick={() => {
            createArtist();  
          }}
        />
      </ModalFooter>
    </ModalContainer>
  );
};

export default CreateArtistModal;
