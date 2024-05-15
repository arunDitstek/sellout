import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as AppActions from "../../redux/actions/app.actions";
import * as EventActions from "../../redux/actions/event.actions";
import TextButton from "@sellout/ui/build/components/TextButton";
import { Colors, Icons } from "@sellout/ui";
import { ModalTypes } from "../modal/Modal";
import BooleanInput from "../../elements/BooleanInput";
import IEventCustomField from "@sellout/models/.dist/interfaces/IEventCustomField";
import CustomField from "../CustomField";
import { Content, Spacer } from "../../components/create-flow/CreateFlowStyles";
import * as SeasonActions from "../../redux/actions/season.actions";

const Container = styled.div``;

type CreateEventCustomFieldsProps = {};

const CreateEventCustomFields: React.FC<CreateEventCustomFieldsProps> = () => {
  /* State */
  const state = useSelector((state: BackstageState) => state);
  const { event: eventState } = state;
  const { eventId, eventsCache } = eventState;

  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId, seasonCache } = seasonState;
  const season = seasonCache[seasonId];

  const firstPath = window.location.pathname.split("/")[1];
  const isEvent = firstPath === "create-event";
  const isSeason = firstPath === "create-season";

  const event = eventsCache[eventId];
  const customFields = isEvent
    ? event?.customFields || []
    : season?.customFields || [];
  const [hasCustomFields, setHasCustomFields] = React.useState(
    customFields?.length > 0
  );

  /* Actions */
  const dispatch = useDispatch();
  const addCustomField = () => {
    if (isEvent) {
      dispatch(EventActions.addCustomField(eventId));
    } else if (isSeason) {
      dispatch(SeasonActions.addCustomField(seasonId));
    }
    dispatch(AppActions.pushModal(ModalTypes.CustomField));
  };

  const popModal = () => dispatch(AppActions.popModal());

  const pushRemoveOptionWarning = () => {
    dispatch(
      AppActions.pushModalConfirmAction({
        title: "Delete survey questions",
        message: `You must manually delete each survey questions by clicking the trash can icon before selecting this option.`,
        confirmText: "OKAY",
        confirm: popModal,
        cancel: null,
      })
    );
  };

  /* Render */
  return (
    <Container>
      <Content>
        <BooleanInput
          active={hasCustomFields}
          onChange={() => {
            if (customFields?.length) {
              pushRemoveOptionWarning();
            } else {
              if (!hasCustomFields) {
                addCustomField();
              }
              setHasCustomFields(!hasCustomFields);
            }
          }}
          label="Would you like to add any survey questions for customers?"
        />
        {(() => {
          if (!hasCustomFields) return null;

          return (
            <Fragment>
              <Spacer />
              {customFields?.map((customField: IEventCustomField) => {
                return (
                  <Fragment key={customField._id}>
                    <CustomField
                      key={customField._id}
                      customField={customField}
                    />
                    <Spacer />
                  </Fragment>
                );
              })}
              <TextButton
                onClick={() => addCustomField()}
                icon={Icons.PlusCircleLight}
              >
                {customFields?.length
                  ? "Add another survey question"
                  : "Add a survey question"}
              </TextButton>
            </Fragment>
          );
        })()}
        <Spacer />
      </Content>
    </Container>
  );
};

export default CreateEventCustomFields;
