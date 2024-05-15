import React from "react";
import styled from "styled-components";
import { Route } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import { Colors } from "@sellout/ui";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import CreateVenueDetails from "../pages/create-venue/CreateVenueDetails.page";
import CreateVenueControls from "../components/create-venue/CreateVenueControls";
import * as VenueActions from "../redux/actions/venue.actions";
import * as AppActions from "../redux/actions/app.actions";
import PageLoader from "../components/PageLoader";
import ISaveChanges from "../models/interfaces/ISaveChanges";
import saveChangesState from "../models/states/saveChanges.state";
import * as ChangeUtil from "../utils/ChangeUtil";
import useVenue from "../hooks/useVenue.hook";

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`;

const Content = styled.div`
  position: relative;
  background: ${Colors.OffWhite};
  height: 100%;
  flex: 1;
  /* min-width: 700px; */
  overflow: scroll;
`;

const HideOnMobile = styled.div`
  ${media.mobile`
    display: none;
  `};

  ${media.desktop`
    width: 400px;
  `};

  ${media.giant`
    flex: 1;
  `};
`;

type CreateVenueContainerProps = {
  match: any;
};

const CreateVenueContainer: React.FC<CreateVenueContainerProps> = ({
  match,
}) => {
  /* Hooks */
  const { venue } = useVenue();
  /* State */
  const venueStates = useSelector((state: BackstageState) => state.venue);
  const { venueId } = venueStates;

  /* Actions */
  const dispatch = useDispatch();

  const close = () => dispatch(AppActions.popModal());
  const saveVenue = () => dispatch(VenueActions.saveVenue(false, true));
  const reCacheVenue = () => dispatch(VenueActions.reCacheVenue(venueId));

  const setSaveChanges = (saveChanges: Partial<ISaveChanges>) => {
    dispatch(AppActions.setSaveChanges(saveChanges));
  };

  /** Effects */
  React.useEffect(() => {
    async function effect() {
      if (venue) {
        setSaveChanges({
          title: 'Unsaved changes',
          message: 'Your venue has unsaved changes. Would you like to discard changes or apply the changes to your venue?',
          confirmText: 'SAVE CHANGES',
          cancelText: 'DISCARD CHANGES',
          hasChanges: await ChangeUtil.hasVenueChanged(venue),
          saveChanges: () => saveVenue(),
          discardChanges: () => reCacheVenue(),
        });
      }
    }
    effect();
    return () => setSaveChanges(saveChangesState());
  }, [venue]);

  /** Render */
  return (
    <Container>
      {(() => {
        if (!venue) {
          return <PageLoader nav={true} />;
        }

        return (
          <Content>
            <Route
              path={`${match.url}/details`}
              component={CreateVenueDetails}
            />
            <CreateVenueControls />
          </Content>
        );
      })()}
    </Container>
  );
};

export default CreateVenueContainer;
