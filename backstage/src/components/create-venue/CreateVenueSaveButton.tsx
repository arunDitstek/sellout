import React from "react";
import { Icons } from "@sellout/ui";
import Button, { ButtonTypes, ButtonIconPosition } from "@sellout/ui/build/components/Button";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as VenueActions from "../../redux/actions/venue.actions";

type CreateVenueSaveButtonProps = {};

const CreateVenueSaveButton: React.FC<CreateVenueSaveButtonProps> = () => {
  /* State */
  const venueState = useSelector((state: BackstageState) => state.venue);
  const { saving } = venueState;

  /* Actions */
  const dispatch = useDispatch();
  const saveVenue = () => dispatch(VenueActions.saveVenue());

  return (
      <Button
        type={ButtonTypes.Regular}
        text="SAVE & CONTINUE"
        icon={Icons.LongRightArrow}
        iconPosition={ButtonIconPosition.Right}
        onClick={() => saveVenue()}
      />
  );
};

export default CreateVenueSaveButton;
