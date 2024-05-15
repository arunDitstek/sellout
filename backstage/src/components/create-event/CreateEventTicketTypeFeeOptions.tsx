import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import Toggle from "../../elements/Toggle";
import { Colors, Icons } from "@sellout/ui";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";

const Container = styled.div`
  padding: 30px 0 0;
`;

const Spacer = styled.div`
  width: 20px;
  height: 20px;
`;

const Text = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey1};
  margin-top: 15px;
`;

type CreateEventTicketTypeProps = {
  ticketType: ITicketType;
};

const CreateEventTicketType: React.FC<CreateEventTicketTypeProps> = ({
  ticketType,
}) => {
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId } = eventState;

  /* Actions */
  const dispatch = useDispatch();

  const setRollFees = (rollFees: boolean) =>
    dispatch(EventActions.setTicketType(eventId, ticketType._id as string, { rollFees }));

  /** Render */
  return (
    <Container>
      <Toggle
        active={ticketType.rollFees}
        onChange={() => setRollFees(!ticketType.rollFees)}
        title="Absorb fees into ticket price"
        tip="Link"
      />
      {ticketType.rollFees && (
        <Text>The customer will pay the base price of the ticket and you will receive the base price minus fees.</Text>
      )}
    </Container>
  );
};

export default CreateEventTicketType;
