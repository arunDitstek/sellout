import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import TypeCard from "../TypeCard";
import { EventTypeEnum } from '@sellout/models/.dist/interfaces/IEvent';
import Masonry from 'react-masonry-component';
import TextButton, { TextButtonSizes } from '@sellout/ui/build/components/TextButton';
import { Colors } from '@sellout/ui';
import * as Intercom from '../../utils/Intercom';
import { DefaultEventImageUrls } from '@sellout/models/.dist/enums/DefaultEventImageUrls';
import * as DefaultImage from '../../utils/DefaultImage'

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const Text = styled.div`
  display: flex;
  font-weight: 500;
  font-size: 1.4rem;
  color: ${Colors.Grey1};
  align-items: center;
`;

type SelectEventTypeProps = {};
const SelectEventType: React.FC<SelectEventTypeProps> = () => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  /* Actions */
  const dispatch = useDispatch();
  const setEventType = (eventType: EventTypeEnum) => {
    dispatch(EventActions.setEventType(eventId, eventType));
    // Only update the event poster image automatically if there isn't one or the current one is a default.
    if (!event.posterImageUrl || Object.values(DefaultEventImageUrls).includes(event.posterImageUrl as any)) {
      dispatch(EventActions.setEventPosterImageUrl(eventId,  DefaultImage.getEventImage(eventType)));
    }
    dispatch(EventActions.navigateToNextStep());
  };

  /** Render */
  return (
    <Container>
      <Masonry
        options={{ horizontalOrder: true }}
        enableResizableChildren
      >
        {Object.values(EventTypeEnum).map((type: EventTypeEnum, index: number) => {
          return (
            <TypeCard
              key={type}
              text={type}
              imageUrl={DefaultImage.getEventImage(type)}
              onClick={() => setEventType(type)}
              margin="0 19px 19px 0"
            />
          );
        })}
      </Masonry>
      <Text>
        Need an event type that we don't have?
        &nbsp;<TextButton size={TextButtonSizes.Regular} onClick={() => Intercom.toggle()}>Let us know</TextButton>
      </Text>
    </Container>
  );
};

export default SelectEventType;
