import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import RichTextEditor from "../../elements/RichTextEditor";
import BooleanInput from "../../elements/BooleanInput";
import * as AppActions from "../../redux/actions/app.actions";
import { Spacer } from "../../components/create-flow/CreateFlowStyles";
import * as SeasonActions from "../../redux/actions/season.actions";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  position: relative;
  width: 600px;
  ${media.mobile`
    width: 100%;
  `};
`;

type CreateEventDescriptionProps = {};

const CreateEventDescription: React.FC<CreateEventDescriptionProps> = () => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId, seasonCache } = seasonState;
  const season = seasonCache[seasonId];

  const firstPath = window.location.pathname.split("/")[1];
  const isEvent = firstPath === "create-event";
  const isSeason = firstPath === "create-season";

  /* State */
  const userAgreement = isEvent
    ? event?.userAgreement || ""
    : season?.userAgreement || "";

  const [hasUserAgreement, setHasUserAgreement] = React.useState(
    userAgreement?.length > 0
  );
  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());

  const setUserAgreement = (userAgreement: string) => {
    if (isEvent) {
      dispatch(EventActions.setEventUserAgreement(eventId, userAgreement));
    } else if (isSeason) {
      dispatch(SeasonActions.setSeasonUserAgreement(seasonId, userAgreement));
    }
  };

  const deleteUserAgreement = () => {
    if (isEvent) {
      dispatch(EventActions.setEventUserAgreement(eventId, ""));
    } else if (isSeason) {
      dispatch(SeasonActions.setSeasonUserAgreement(seasonId, "userAgreement"));
    }
    setHasUserAgreement(!hasUserAgreement);
    popModal();
  };

  const pushRemoveOptionWarning = () => {
    dispatch(
      AppActions.pushModalConfirmAction({
        title: "Delete event waiver",
        message: `Are you sure that you want to delete the event waiver? This action cannot be undone`,
        confirmText: "OKAY",
        confirm: deleteUserAgreement,
        cancel: popModal,
      })
    );
  };

  /** Render */
  return (
    <Container>
      <BooleanInput
        active={hasUserAgreement}
        onChange={() => {
          if (userAgreement) {
            pushRemoveOptionWarning();
          } else {
            setHasUserAgreement(!hasUserAgreement);
          }
        }}
        label="Would you like to add a consent waiver to this event?"
      />
      {(() => {
        if (!hasUserAgreement) return null;

        return (
          <Fragment>
            <Spacer />
            <RichTextEditor
              value={
                isEvent
                  ? (event?.userAgreement as string)
                  : (season?.userAgreement as string)
              }
              onChange={(userAgreement: string) => {
                setUserAgreement(userAgreement);
              }}
              placeholder="Enter the event consent waiver"
              label="Waiver Content"
            />
          </Fragment>
        );
      })()}
    </Container>
  );
};

export default CreateEventDescription;
