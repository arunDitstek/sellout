import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { Colors, Icon, Icons } from "@sellout/ui";
import { IEventGraphQL, EventProcessAsEnum, EventSaleTaxEnum } from "@sellout/models/.dist/interfaces/IEvent";
import { BackstageState } from "../../redux/store";
import * as AppActions from "../../redux/actions/app.actions";
import * as EventActions from "../../redux/actions/event.actions";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import Label from "@sellout/ui/build/components/Label";
import { TaxEnum } from "./CreateEventTaxDeduction";
import * as FeeActions from "../../redux/actions/fee.actions";

const Container = styled.div`
  position: relative;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

type CardProps = {
  active: boolean;
};

const Card = styled.div<CardProps>`
  width: 130px;
  padding: 20px;
  margin-right: 10px;
  background-color: ${Colors.White};
  border: 1px solid ${(props) => (props.active ? Colors.Orange : Colors.Grey5)};
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.1s;

  &:hover {
    cursor: pointer;
    border: 1px solid
      ${(props) => (props.active ? Colors.Orange : Colors.Grey4)};
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

type TitleProps = {
  active: boolean;
};

const Title = styled.div<TitleProps>`
  color: ${(props) => (props.active ? Colors.Orange : Colors.Grey1)};
  font-size: 14px;
  font-weight: 600;
  margin-right: 7px;
`;

const Text = styled.div`
  color: ${Colors.Grey1};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
`;

const EventProcessAsDescriptions = {
  [EventProcessAsEnum.Paid]:
    "Customers are charged and will receive tickets after purchase.",
  [EventProcessAsEnum.RSVP]:
    "Limited available tickets, which are reserved with no charge.",
  // [EventProcessAsEnum.Free]:
  //   "Free listing, and reminder for attendees when begins.",
};

type SelectEventProcessAsProps = {};

const SelectEventProcessAs: React.FC<SelectEventProcessAsProps> = () => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  /* Actions */
  const dispatch = useDispatch();
  const showNotification = (message: string) =>
    dispatch(AppActions.showNotification(message, AppNotificationTypeEnum.Error));
  const setEventProcessAs = (processAs: EventProcessAsEnum) => {
    if (event.hasOrders) {
      showNotification('This field cannot be changed once orders have been created. Please contact support with questions or comments.');
      return;
    }

    // if (event.seatingChartKey) {
    //   showNotification('Seated events must be paid. Please contact support with questions or comments.');
    //   return;
    // }
    dispatch(EventActions.setEventProcessAs(eventId, processAs));

    if (processAs === EventProcessAsEnum.RSVP && event?.taxDeduction) {
      dispatch(EventActions.setEventTaxDeduction(eventId, TaxEnum.False));
      deleteSaletax();
    }
  }

  const deleteSaletax = () => {
    const taxx: any = (event?.fees.filter((a) => a.name === EventSaleTaxEnum.SalesTax))
    if (taxx.length > 0) {
      dispatch(FeeActions.deleteFee(taxx[taxx.length - 1]._id as string, eventId));
    }
  }

  /** Render */
  return (
    <Container>
      <Label
        text="What kind of event is this?"
      // tip={event.hasOrders ? "This field cannot be changed once orders have been created" : "Select the event type"}
      />
      <CardContainer>
        {Object.values(EventProcessAsEnum).map((value) => {
          const active = event.processAs === value;
          return (
            <Card
              key={value}
              onClick={() => setEventProcessAs(value)}
              active={active}
            >
              <Row>
                <Title active={active}>{value}</Title>
                {active && (
                  <Icon
                    icon={Icons.CheckCircle}
                    size={12}
                    color={Colors.Orange}
                    top="-1px"
                  />
                )}
              </Row>
              <Text>{EventProcessAsDescriptions[value]}</Text>
            </Card>
          );
        })}
      </CardContainer>
    </Container>
  );
};

export default SelectEventProcessAs;
