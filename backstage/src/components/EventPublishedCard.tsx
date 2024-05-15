import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Colors, Icons } from "@sellout/ui";
import DetailsCard, { Title } from "../elements/DetailsCard";
import IEvent from "@sellout/models/.dist/interfaces/IEvent";
import Button, { ButtonTypes, ButtonIconPosition } from "@sellout/ui/build/components/Button";
import * as EventActions from "../redux/actions/event.actions";
import * as AppActions from "../redux/actions/app.actions";

const Text = styled.div`
  color: ${Colors.Grey1};
  font-weight: 500;
  font-size: 1.4rem;
  margin-bottom: 16px;
`;

type StatusColorProps = {
  color: Colors;
}

const StatusColor = styled.span<StatusColorProps>`
  color: ${props => props.color};
`;

type EventSalesToggleCardProps = {
  event: IEvent;
};
const EventSalesToggleCard: React.FC<EventSalesToggleCardProps> = ({ event }) => {
  /* State */
  const published = event?.published;

  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());
  const publishEvent = (published: boolean) => dispatch(EventActions.publishEventRequest([], [], published));

  const confirmToggleEventSales = () => {
    dispatch(AppActions.pushModalConfirmAction({
      title: published ? 'Disable sales' : 'Enable sales',
      message: published 
        ? 'Are you sure you want to re-enable sales for this event? This event will immediately be available for purchase.' 
        : `Are you sure you want to pause sales for this event? Your customers will not be able to purchase tickets until sales are re-enabled.`,
      confirmText: published ? 'DISABLE SALES' : 'ENABLE SALES',
      confirm: () => {
        publishEvent(published ? false : true);
        popModal();
      },
      cancel: popModal,
    }));
  }

  /* Render */
  return (
    <DetailsCard
      title={<Title>Online sales are&nbsp;<StatusColor color={published ? Colors.Green : Colors.Red}>{published ? 'active' : 'disabled'}</StatusColor></Title>}
      headerIcon={Icons.CartLight}
      width="600px"
      padding="20px 20px"
    >
      <Text>{published ? 'Anyone can currently purchase tickets to this event.' : 'Sales are paused. Your customers will not be able to purchase tickets until sales are re-enabled.'}</Text>
      <Button
        type={ButtonTypes.Regular}
        text={published ? "PAUSE SALES" : "RE-ENABLE SALES"}
        icon={Icons.Warning}
        iconPosition={ButtonIconPosition.Left}
        onClick={() => confirmToggleEventSales()}
      />

    </DetailsCard>
  );
};

export default EventSalesToggleCard;
