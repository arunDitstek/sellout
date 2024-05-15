import React from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import { TextButton } from "@sellout/ui";
import Label from "@sellout/ui/build/components/Label";
import { TypeCardNonInteractive } from '../TypeCard';
import useNavigateToCreateEvent from "../../hooks/useNavigateToCreateEvent.hook";
import * as DefaultImage from '../../utils/DefaultImage'

const Container = styled.div`
  position: relative;
`;

type CreateEventSwitchTypeProps = {};

const CreateEventSwitchType: React.FC<CreateEventSwitchTypeProps> = () => {
  /* Hooks */
  const navigateToCreateEvent = useNavigateToCreateEvent();

  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  /** Render */
  return (
    <Container>
      <Label
        text="Event Type"
      />
      <TypeCardNonInteractive
        text={event.type}
        imageUrl={DefaultImage.getEventImage(event.type)}
      />
      {!event?.hasOrders && (
        <TextButton onClick={() => navigateToCreateEvent(eventId, true)} margin="8px 0 0">
          Switch event type
        </TextButton>
      )}
    </Container>
  );
};

export default CreateEventSwitchType;
