import React, { Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import SelectEventVenue from "../../components/create-event/SelectEventVenue";
import BooleanInput from "../../elements/BooleanInput";
import SelectEventSeatingChart from "../../components/create-event/SelectEventSeatingChart";
import CreateEventSaveButton from "../../components/create-event/CreateEventSaveButton";
import CreateEventAge from "../../components/create-event/CreateEventAge";
import {
  Container,
  Content,
  Title,
  TitleContainer,
  Subtitle,
  Spacer,
} from "../../components/create-flow/CreateFlowStyles";
import { VariantEnum } from "../../models/enums/VariantEnum";

type CreateEventDetailsProps = {};

const CreateEventDetails: React.FC<CreateEventDetailsProps> = () => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, ticketTypeId, eventsCache } = eventState;
  const event = eventsCache[eventId];
  const [hasSeating, setHasSeating] = React.useState(
    Boolean(event.seatingChartKey)
  );

  const dispatch = useDispatch();
  const clearEventSeatingChartFields = () =>
    dispatch(EventActions.clearEventSeatingChartFields(eventId));

  /* Render */
  return (
    <Container>
      <Content>
        <TitleContainer>
          <Title>Venue</Title>
          <Subtitle>
            Set up or select the venue where this event will take place
          </Subtitle>
        </TitleContainer>
        {/* <SelectEventVenue /> */}
        <Spacer />
        <BooleanInput
          active={hasSeating}
          onChange={() => {
            if (hasSeating) clearEventSeatingChartFields();
            setHasSeating(!hasSeating);
          }}
          label="Will you be using a seating chart?"
          tip="What goes heerreeee?"
        />
        <Spacer />
        {hasSeating && (
          <Fragment>
            <SelectEventSeatingChart />
            <Spacer />
          </Fragment>
        )}
        <CreateEventAge type={VariantEnum.Event} />
        <Spacer />
        <CreateEventSaveButton event={event} />
        <Spacer />
      </Content>
    </Container>
  );
};

export default CreateEventDetails;
