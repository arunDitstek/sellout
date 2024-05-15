import React from "react";
import styled from "styled-components";
import { Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Colors } from "@sellout/ui";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import CreateEventDetails from "../pages/create-event/CreateEventDetails.page";
import CreateEventDatesTimes from "../pages/create-event/CreateEventDatesTimes.page";
import CreateEventTicketTypes from "../pages/create-event/CreateEventTicketTypes.page";
import CreateEventUpgradeTypes from "../pages/create-event/CreateEventUpgradeTypes.page";
import CreateEventPromotions from "../pages/create-event/CreateEventPromotions.page";
import CreateEventAdvancedOptions from "../pages/create-event/CreateEventAdvancedOptions.page";
import CreateEventControls from "../components/create-event/CreateEventControls";
import CreateEventPreview from "../components/create-event/CreateEventPreview";
import * as EventActions from "../redux/actions/event.actions";
import * as AppActions from "../redux/actions/app.actions";
import PageLoader from "../components/PageLoader";
import DashboardLayout from "../components/DashboardLayout";
import ISaveChanges from "../models/interfaces/ISaveChanges";
import saveChangesState from "../models/states/saveChanges.state";
import * as ChangeUtil from "../utils/ChangeUtil";
import useEvent from "../hooks/useEvent.hook";
import { ModalTypes } from "../components/modal/Modal";

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
  min-width: 700px;
  overflow: scroll;
  ${media.mobile`
  min-width: 100%;
  `};
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

type CreateEventContainerProps = {
  match: any;
};

const CreateEventContainer: React.FC<CreateEventContainerProps> = ({
  match,
}) => {
  /* Hooks */
  const { event, eventId } = useEvent();

  /* Actions */
  const dispatch = useDispatch();
  const saveEvent = () => dispatch(EventActions.saveEvent(false, true));
  const reCacheEvent = () => dispatch(EventActions.reCacheEvent(eventId));

  const setSaveChanges = (saveChanges: Partial<ISaveChanges>) => {
    dispatch(AppActions.setSaveChanges(saveChanges));
  };

  const pushPublishModal = () =>
    dispatch(AppActions.pushModal(ModalTypes.PublishEvent));

  const isSaved = Boolean(event?.createdAt);
  const isPublished = Boolean(event?.published);

  let message =
    "Your event has not been saved. Would you like to discard the event or save it as a draft?";
  let confirmText = "SAVE DRAFT";
  let cancelText = "DISCARD EVENT";

  if (isSaved) {
    message =
      "Your event has unsaved changes. Would you like to discard changes or apply the changes to your event?";
    confirmText = "SAVE CHANGES";
    cancelText = "DISCARD CHANGES";
  }

  if (isPublished) {
    message =
      "You have made changes to a published event. Would you like to update the event or discard your changes?";
    confirmText = "UPDATE EVENT";
    cancelText = "DISCARD CHANGES";
  }

  /** Effects */
  React.useEffect(() => {
    async function effect() {
      if (event) {
        setSaveChanges({
          title: "Unsaved changes",
          message: message,
          confirmText: confirmText,
          cancelText: cancelText,
          hasChanges: await ChangeUtil.hasEventChanged(event),
          saveChanges: () => {
            if (isPublished) {
              pushPublishModal();
            } else {
              saveEvent();
            }
          },
          discardChanges: () => reCacheEvent(),
        });
      }
    }
    effect();
    return () => setSaveChanges(saveChangesState());
  }, [event]);

  /** Render */
  return (
    <DashboardLayout>
      {(() => {
        if (!event) {
          return <PageLoader nav={true} />;
        }

        // if(isCreateEventType) {
        //   return (
        //     <Container>
        //       <Content>
        //         <Route
        //           path={`${match.url}/type`}
        //           component={CreateEventType}
        //         />
        //       </Content>
        //     </Container>
        //   );
        // }

        return (
          <Container>
            <Content>
              <Route
                path={`${match.url}/details`}
                component={CreateEventDetails}
              />
              {/* <Route
                path={`${match.url}/venue`}
                component={CreateEventVenue}
              /> */}
              <Route
                path={`${match.url}/dates-times`}
                component={CreateEventDatesTimes}
              />
              <Route
                path={`${match.url}/ticket-types`}
                component={CreateEventTicketTypes}
              />
              <Route
                path={`${match.url}/upgrade-types`}
                component={CreateEventUpgradeTypes}
              />
              <Route
                path={`${match.url}/secret-codes`}
                component={CreateEventPromotions}
              />
              <Route
                path={`${match.url}/advanced-options`}
                component={CreateEventAdvancedOptions}
              />
              {/* <Redirect from={`${match.url}`} to={{ pathname: `${match.url}/details`, search: location.search }} /> */}
              <CreateEventControls />
            </Content>
            <HideOnMobile>
              <CreateEventPreview />
            </HideOnMobile>
          </Container>
        );
      })()}
    </DashboardLayout>
  );
};

export default CreateEventContainer;
