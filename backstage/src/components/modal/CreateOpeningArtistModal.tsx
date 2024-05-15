import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as ArtistActions from "../../redux/actions/artist.actions";
import CreateArtistModal from './CreateArtistModal';

type CreateOpeningArtistModalProps = {};

const CreateOpeningArtistModal: React.FC<CreateOpeningArtistModalProps> = ({ }) => {
  /* Actions */
  const dispatch = useDispatch();

  const createArtist = () =>
    dispatch(ArtistActions.createOpeningArtist());

  /** Render */
  return (
    <CreateArtistModal createArtist={createArtist} />
  );
};

export default CreateOpeningArtistModal;
