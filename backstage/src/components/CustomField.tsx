import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as EventActions from "../redux/actions/event.actions";
import * as AppActions from "../redux/actions/app.actions";
import { Colors, Icon, Icons } from "@sellout/ui";
import IEventCustomField from "@sellout/models/.dist/interfaces/IEventCustomField";
import Flex from "@sellout/ui/build/components/Flex";
import { ModalTypes } from "./modal/Modal";
import * as Polished from "polished";
import EventItemControls from "./EventItemControls";
import useEvent from "../hooks/useEvent.hook";
import useSeason from "../hooks/useSeason.hook";
import * as SeasonActions from "../redux/actions/season.actions";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  position: relative;
  width: 600px;
  border-radius: 10px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid ${Colors.Grey5};
  transition: all 0.2s;
  ${media.mobile`
    width: 100%;
  `};

  &:hover {
    border: 1px solid ${Polished.darken(0.05, Colors.Grey5)};
    cursor: pointer;
  }

  &:active {
    border: 1px solid ${Colors.Grey4};
  }
`;

const Content = styled.div`
  padding: 20px;
`;

const Title = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${Colors.Grey1};
`;

const Value = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
`;

type CustomFieldProps = {
  customField: IEventCustomField;
};

const CustomField: React.FC<CustomFieldProps> = ({ customField }) => {
  /* State */
  const { event, eventId } = useEvent();
  const { season, seasonId } = useSeason();

  /* Actions */
  const dispatch = useDispatch();
  const editCustomField = () => {
    if (event) {
      dispatch(EventActions.setCustomFieldId(customField._id as string));
    } else if (season) {
      dispatch(SeasonActions.setCustomFieldId(customField._id as string));
    }
    dispatch(AppActions.pushModal(ModalTypes.CustomField));
  };

  const toggleCustomFieldActive = () => {
    if (event) {
      dispatch(
        EventActions.setCustomFieldActive(
          eventId,
          customField._id as string,
          !customField.active
        )
      );
    } else if (season) {
      dispatch(
        SeasonActions.setCustomFieldActive(
          seasonId,
          customField._id as string,
          !customField.active
        )
      );
    }
  };

  const moveCustomFieldUp = () => {
    if (event) {
      dispatch(
        EventActions.moveCustomFieldUp(eventId, customField._id as string)
      );
    } else if (season) {
      dispatch(
        SeasonActions.moveCustomFieldUp(seasonId, customField._id as string)
      );
    }
  };

  const moveCustomFieldDown = () => {
    if (event) {
      dispatch(
        EventActions.moveCustomFieldDown(eventId, customField._id as string)
      );
    } else if (season) {
      dispatch(
        SeasonActions.moveCustomFieldDown(seasonId, customField._id as string)
      );
    }
  };

  const popModal = () => dispatch(AppActions.popModal());

  const removeCustomField = () => {
    if (event) {
      dispatch(
        EventActions.removeCustomField(eventId, customField._id as string)
      );
    } else if (season) {
      dispatch(
        SeasonActions.removeSeasonCustomField(
          seasonId,
          customField._id as string
        )
      );
    }
    popModal();
  };

  const confirmDeleteCustomField = () => {
    dispatch(
      AppActions.pushModalConfirmAction({
        title: "Are you sure?",
        message: `Are you sure you want to delete survey question ${customField.label}? This action cannot be undone.`,
        confirm: removeCustomField,
        cancel: popModal,
      })
    );
  };

  /** Render */
  return (
    <Container>
      <EventItemControls
        active={customField.active}
        toggleActive={toggleCustomFieldActive}
        moveUp={moveCustomFieldUp}
        moveDown={moveCustomFieldDown}
        remove={confirmDeleteCustomField}
        itemCount={
          event
            ? event?.ticketTypes?.length ?? 0
            : season?.ticketTypes?.length ?? 0
        }
      />
      <Content onClick={() => editCustomField()}>
        <Flex justify="space-between" align="center">
          <Title>
            <Flex>
              <Icon
                icon={Icons.HelpSolid}
                color={Colors.Grey1}
                size={12}
                margin="0 7px 0 0"
                top="-2px"
              />
              {customField.label}
            </Flex>
          </Title>
        </Flex>
        <Flex justify="space-between" margin="5px 0 0">
          <Value>{customField.type} Question</Value>
        </Flex>
      </Content>
    </Container>
  );
};

export default CustomField;
