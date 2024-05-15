import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as EventActions from "../../redux/actions/event.actions";
import { EventAgeEnum } from "@sellout/models/.dist/interfaces/IEvent";
import useEvent from "../../hooks/useEvent.hook";
import BooleanInput from "../../elements/BooleanInput";
import { Input } from "@sellout/ui";
import { Spacer } from "../create-flow/CreateFlowStyles";
import { VariantEnum } from "../../models/enums/VariantEnum";
import useSeason from "../../hooks/useSeason.hook";
import * as AppActions from "../../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";

const Container = styled.div`
  position: relative;
`;

type CreateEventTegIntegerationProps = { type: string };

const CreateEventTegIntegeration: React.FC<CreateEventTegIntegerationProps> = ({
  type,
}) => {
  /* Hooks */
  const { event, eventId } = useEvent();
  const { season, seasonId } = useSeason();
  /* Actions */
  const dispatch = useDispatch();

  const isEvent = type === VariantEnum.Event ? true : false;
  const setEventTeg = () => {
    if (isEvent) {
      dispatch(
        EventActions.setEventTegIntegeration(eventId, !event?.isGuestTicketSale)
      );
    } else {
      dispatch(
        AppActions.showNotification(
          "Season does not allow guests.",
          AppNotificationTypeEnum.Warning
        )
      );
    }
  };

  const setEventGuestValue = (guestTicketPerMember: string) =>
    dispatch(EventActions.setEventGuestValue(eventId, guestTicketPerMember));

  /** Render */

  return (
    <Container>
      <BooleanInput
        active={
          isEvent
            ? (event?.isGuestTicketSale as boolean)
            : (season?.isGuestTicketSale as boolean)
        }
        onChange={() => setEventTeg()}
        label="Allow Guest Ticket Sales"
      />

      {isEvent && isEvent && event?.isGuestTicketSale && (
        <>
          <Spacer />
          <Input
            label="Guest Tickets Per Member"
            subLabel="(required)"
            placeholder="0"
            width="200px"
            type="number"
            value={event?.guestTicketPerMember as string}
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              setEventGuestValue(e.currentTarget.value)
            }
          />
        </>
      )}
    </Container>
  );
};

export default CreateEventTegIntegeration;
