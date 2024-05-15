import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as ArtistActions from "../../redux/actions/artist.actions";
import CreateArtistModal from './CreateArtistModal';

type CreateHeadliningAristModalProps = {};

const CreateHeadliningAristModal: React.FC<CreateHeadliningAristModalProps> = ({ }) => {
  /* Actions */
  const dispatch = useDispatch();

  const createArtist = () =>
    dispatch(ArtistActions.createHeadliningArtist());

  /** Render */
  return (
    <CreateArtistModal createArtist={createArtist} />
  );
};

export default CreateHeadliningAristModal;
