import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as ArtistActions from "../../redux/actions/artist.actions";
import { useHistory } from "react-router-dom";
import CreateFlowControls from "../create-flow/CreateFlowControls";
import useNavigateToArtistDetails from '../../hooks/useNavigateToArtistDetails.hook';
import * as AppActions from "../../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";

type CreateArtistControlsProps = {};

const CreateArtistControls: React.FC<CreateArtistControlsProps> = () => {
  /** Hooks */
  const history = useHistory();
  const dispatch = useDispatch();
  const [attemptedSave, setAttemptedSave] = React.useState(false);
  const [saveArtistClicked, setSaveArtistClicked] = React.useState(false);

  const navigateToArtistDetails = useNavigateToArtistDetails();

  /* State */
  const artistState = useSelector((state: BackstageState) => state.artist);
  const { artistId, saving, errorMsg } = artistState;

  // Determine if there was an error saving and react accordingly.
  // TODO: clean up and fix memory leak when creating for the first time.
  React.useEffect(() => {
    if (saveArtistClicked) {
      if (saving) setAttemptedSave(true);
      if (errorMsg) {
        setAttemptedSave(false);
        dispatch(AppActions.showNotification(errorMsg, AppNotificationTypeEnum.Error));
      } else if (!saving && !errorMsg && attemptedSave) {
        navigateToArtistDetails(artistId)
      }
    }
  }, [attemptedSave, dispatch, errorMsg, history, navigateToArtistDetails, saving, artistId, saveArtistClicked]);

  /* Actions */
  const saveArtist = (forward: boolean = true) => {
    dispatch(ArtistActions.saveArtist(forward));
    setSaveArtistClicked(true);
  }
  const navigateToPreviousStep = () =>
    dispatch(ArtistActions.navigateToPreviousStep());
  const exit = () => {
    saveArtist(false);
    history.push(`/admin/dashboard/performers`);
  };

  // arrows are hidden as we have not yet built the other pages for creating a performer
  return (
    <CreateFlowControls
      save={saveArtist}
      finalize={saveArtist}
      previous={navigateToPreviousStep}
      exit={exit}
      finalizeText="SAVE PERFORMER"
      saving={saving}
      hideArrows
    />
  );
};

export default CreateArtistControls;
