import React from "react";
import { Icons } from "@sellout/ui";
import Button, { ButtonTypes, ButtonIconPosition } from "@sellout/ui/build/components/Button";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as ArtistActions from "../../redux/actions/artist.actions";

type CreateArtistSaveButtonProps = {};

const CreateArtistSaveButton: React.FC<CreateArtistSaveButtonProps> = () => {
  /* State */
  const artistState = useSelector((state: BackstageState) => state.artist);
  const { saving } = artistState;

  /* Actions */
  const dispatch = useDispatch();
  const saveArtist = () => dispatch(ArtistActions.saveArtist());

  return (
      <Button
        type={ButtonTypes.Regular}
        text="SAVE & CONTINUE"
        icon={Icons.LongRightArrow}
        iconPosition={ButtonIconPosition.Right}
        onClick={() => saveArtist()}
      />
  );
};

export default CreateArtistSaveButton;
