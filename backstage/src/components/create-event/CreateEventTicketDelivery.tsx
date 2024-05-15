import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import { EventTicketDelivery } from "@sellout/models/.dist/interfaces/IEvent";
import TextArea from "../../elements/TextArea";
import { Spacer } from "../../components/create-flow/CreateFlowStyles";

const Container = styled.div`
  position: relative;
`;

type CreateEventTicketDeliveryProps = {};

const CreateEventTicketDelivery: React.FC<
  CreateEventTicketDeliveryProps
> = () => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  /* Actions */
  const dispatch = useDispatch();
  const setEventTicketDeliveryType = (
    ticketDeliveryType: EventTicketDelivery
  ) =>
    dispatch(
      EventActions.setEventTicketDeliveryType(eventId, ticketDeliveryType)
    );

  const items = Object.values(EventTicketDelivery).map(
    (sendQRCode: EventTicketDelivery) => {
      return {
        text: sendQRCode,
        value: sendQRCode,
      };
    }
  );

  /** Render */
  return (
    <Container>
      <Dropdown
        value={event?.ticketDeliveryType}
        items={items}
        onChange={(ticketDeliveryType: EventTicketDelivery) => {
          setEventTicketDeliveryType(ticketDeliveryType);
        }}
        label="Ticket delivery"
      />

      {event?.ticketDeliveryType !== EventTicketDelivery.Digital && (
        <>
          <Spacer />
          <TextArea
            label="Will-call instructions"
            //   subLabel="(required)"
            placeholder="Add will-call instructions here"
            width="370px"
            height="78px"
            value={event?.physicalDeliveryInstructions as string}
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              dispatch(
                EventActions.setEventphysicalDeliveryInstructions(
                  eventId,
                  e.currentTarget.value
                )
              )
            }
            maxLength={500}
          />
        </>
      )}
    </Container>
  );
};
export default CreateEventTicketDelivery;
