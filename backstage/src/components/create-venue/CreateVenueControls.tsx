import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as VenueActions from "../../redux/actions/venue.actions";
import { useHistory } from "react-router-dom";
import CreateFlowControls from "../create-flow/CreateFlowControls";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import * as AppActions from "../../redux/actions/app.actions";
import useNavigateToVenueDetails from '../../hooks/useNavigateToVenueDetails.hook';
import useVenue from "../../hooks/useVenue.hook";
import isDeepEqual from "fast-deep-equal";
import venueState from "../../models/states/venue.state";
import ISaveChanges from "../../models/interfaces/ISaveChanges";
import useHistoryHooks from "../../hooks/useHistory.hook";

type CreateVenueControlsProps = {};

const CreateVenueControls: React.FC<CreateVenueControlsProps> = () => {
  /** Hooks */
  const history = useHistory();
  const dispatch = useDispatch();
  const historyHooks = useHistoryHooks();
  const { venue } = useVenue();
  const [attemptedSave, setAttemptedSave] = React.useState(false);
  const navigateToVenueDetails = useNavigateToVenueDetails();

  /* State */
  const venueStates = useSelector((state: BackstageState) => state.venue);
  const { venueId, saving, errorMsg } = venueStates;

  // Determine if there was an error saving and react accordingly.
  // TODO: clean up and fix memory leak when creating for the first time.
  React.useEffect(() => {
    if (saving) setAttemptedSave(true);
    // Fixed issue SELLOUT-20
    if (errorMsg && attemptedSave) {
      setAttemptedSave(false);
      dispatch(AppActions.showNotification(errorMsg, AppNotificationTypeEnum.Error));
    } else if (!saving && !errorMsg && attemptedSave) {
      navigateToVenueDetails(venueId)
    }
  }, [attemptedSave, dispatch, errorMsg, history, navigateToVenueDetails, saving, venueId]);

  /* Actions */
  const saveVenue = (forward: boolean = true) => {
    dispatch(VenueActions.saveVenue(forward));
  }

  const navigateToPreviousStep = () => dispatch(VenueActions.navigateToPreviousStep());
  const setSaveChanges = (saveChanges: Partial<ISaveChanges>) => {
    dispatch(AppActions.setSaveChanges(saveChanges));
  };


  const exit = () => {
      setSaveChanges({
        title: 'Unsaved changes',
        message: 'Your venue has unsaved changes. Would you like to discard changes or apply the changes to your venue?',
        confirmText: 'SAVE CHANGES',
        cancelText: 'DISCARD CHANGES',
        hasChanges: true,
      });
      historyHooks.push(`/admin/dashboard/venues/details/overview?venueId=${venueId}`);
     
  };

  // arrows are hidden as we have not yet built the other pages for creating a venue
  return (
    <CreateFlowControls
      save={saveVenue}
      finalize={saveVenue}
      previous={navigateToPreviousStep}
      exit={exit}
      finalizeText="SAVE VENUE"
      saving={saving}
      hideArrows
    />
  );
};

export default CreateVenueControls;
