import React from "react";
import styled from "styled-components";
import { Colors } from '@sellout/ui';
import Icon, { Icons } from '@sellout/ui/build/components/Icon';
import TextButton, { TextButtonSizes } from '@sellout/ui/build/components/TextButton';
import useEvent from "../hooks/useEvent.hook";

type ContainerProps = {
  margin?: string;
}

const Container = styled.div<ContainerProps>`
  background-color: ${Colors.Grey6};
  padding: 16px;
  border-radius: 10px;
  display: flex;
`;

const Text = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey1};
  line-height: 2rem;
  margin-left: 8px;
`;

type EventIsNotSyncedProps = {
  navigateToEmbedInstructions?: Function;
};

const EventIsNotSynced: React.FC<EventIsNotSyncedProps> = ({
  navigateToEmbedInstructions
}) => {
  const { event } = useEvent();
  return (
    <Container>
      <Icon icon={Icons.Warning} color={Colors.Yellow} size={14} />
      {!event?.publishable && <Text>
        This event is not being synced to any sites. The Buy Button will need to be embedded in order to sell tickets.
        {navigateToEmbedInstructions && (
          <TextButton
            size={TextButtonSizes.Regular}
            onClick={() => navigateToEmbedInstructions ? navigateToEmbedInstructions() : null}
          >
            Click here to get embed instructions
          </TextButton>
        )}
      </Text>}
      {event?.publishable && <Text>
        This event will be published on Sellout.io between the announcement date and the end date of the event. If you wish to stop this event from displaying on Sellout.io, edit the event and change the setting on the Event Details tab.
      </Text>}
    </Container>
  );
};

export default EventIsNotSynced;