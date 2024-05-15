import React from "react";
import styled from "styled-components";
import SelectEventType from '../../components/create-event/SelectEventType';
import { Flex, Colors, Icon, Icons } from '@sellout/ui';
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import {
  Title,
  TitleContainer,
} from '../../components/create-flow/CreateFlowStyles';

// this one is different from the normal createFlowStyles exported one
const Container = styled.div`
  padding: 32px;
  height: calc(100% - 190px);
  overflow: scroll;
  padding-bottom: 100px;
  display: flex;
`;

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

type CreateEventTypeProps = {
  match: any;
};

const CreateEventType: React.FC<CreateEventTypeProps> = ({ match }) => {
  const history = useHistory();
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  // If the event has orders, users cannot change the event type so we redirect them to basic info.
  React.useLayoutEffect(() => {
    if (event?.hasOrders) {
      history.push(`/create-event/details?eventId=${eventId}`)
    }
  }, [event, eventId, history]);

  return (
    <Container>
      <Content>
        <TitleContainer>
          <Flex align="center">
            <Title>Choose an event type</Title>
            <Icon
              icon={Icons.HelpSolid}
              size={18}
              top="3px"
              color={Colors.Grey5}
              margin="0 0 0 8px"
              onClick={() => window.open('https://help.sellout.io/en/articles/4413337-choosing-an-event-type', '_blank')}
            />
          </Flex>
        </TitleContainer>
        <SelectEventType />
      </Content>
    </Container>
  );
};

export default CreateEventType;
