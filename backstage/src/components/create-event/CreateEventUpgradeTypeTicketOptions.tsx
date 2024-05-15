import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import Toggle from "../../elements/Toggle";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import SelectTicketTypes from "./SelectTicketTypes";

const Container = styled.div`
  padding: 30px 0 0;
`;

const Spacer = styled.div`
  width: 20px;
  height: 20px;
`;

type CreateEventUpgradeTicketOptionsProps = {
  upgradeType: IEventUpgrade;
};

const CreateEventUpgradeTicketOptions: React.FC<CreateEventUpgradeTicketOptionsProps> = ({
  upgradeType,
}) => {
  /* State */
  const [limitTickets, setLimitTickets] = React.useState(false);
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId } = eventState;

  /* Actions */
  const dispatch = useDispatch();

  const addUpgradeTypeTicketTypeId = (ticketTypeId: string) =>
    dispatch(
      EventActions.addUpgradeTypeTicketTypeId(
        eventId,
        upgradeType._id as string,
        ticketTypeId
      )
    );

  const removeUpgradeTypeTicketTypeId = (ticketTypeId: string) =>
    dispatch(
      EventActions.removeUpgradeTypeTicketTypeId(
        eventId,
        upgradeType._id as string,
        ticketTypeId
      )
    );

  /** Render */
  return (
    <Container>
      <Toggle
        active={limitTickets}
        onChange={() => setLimitTickets(!limitTickets)}
        title="Limit to specific tickets"
      />

      {limitTickets && (
        <Fragment>
          <Spacer />
          <SelectTicketTypes
            selected={upgradeType.ticketTypeIds}
            add={addUpgradeTypeTicketTypeId}
            remove={removeUpgradeTypeTicketTypeId}
          />
        </Fragment>
      )}
    </Container>
  );
};

export default CreateEventUpgradeTicketOptions;
