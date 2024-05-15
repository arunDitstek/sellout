import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import { Colors, Icon, Icons } from "@sellout/ui";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import * as Time from '@sellout/utils/.dist/time';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 10px;
`;

type TicketTypeProps = {
    active: boolean;
}

const TicketType = styled.div<TicketTypeProps>`
  position: relative;
  height: 38px;
  margin-right: 10px;
  padding: 0 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid ${props => props.active ? Colors.Orange : Colors.Grey5};
  border-radius: 10px;
  transition: all 0.2s;
  flex:1 1 auto;
  &:hover {
    cursor: pointer;
  }
`;

const TicketTypeName = styled.div<TicketTypeProps>`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${props => props.active ? Colors.Orange : Colors.Grey5};
  margin-left: 10px;
  transition: all 0.2s;
`;

type SelectEventDaysProps = {
    selected: string[];
    add: (eventDay: string) => void;
    remove: (ticketTypeId: string) => void;
};

const SelectEventDays: React.FC<SelectEventDaysProps> = ({
    selected,
    add,
    remove
}) => {
    const eventState = useSelector((state: BackstageState) => state.event);
    const { eventId, eventsCache } = eventState;
    const event = eventsCache[eventId];

    const performance = event?.performances?.[0].schedule;
    const venueState = useSelector((state: BackstageState) => state.venue);
    const { venuesCache } = venueState;
    const venueId = event?.venueId as string;
    const venue = venuesCache[venueId];
    const timezone = venue && venue.address && venue.address.timezone != '' ? venue.address.timezone : event?.venue?.address?.timezone
    /** Render */
    return (
        <Container>
            <Container>
                {performance && performance.length > 1 && performance?.map((a: any, i) => {
                    const active = selected.includes(
                        (a.startsAt).toString() as string
                    );

                    const onClick = () => {
                        if (active) {
                            remove((a.startsAt).toString() as string);
                        } else {
                            add((a.startsAt).toString() as string);
                        }
                    };

                    return (
                        <TicketType key={i} onClick={onClick} active={active}>
                            <Icon
                                icon={Icons.CheckCircle}
                                color={active ? Colors.Orange : Colors.Grey5}
                                size={14}
                            />
                            <TicketTypeName active={active}>{
                                Time.format(
                                    a.startsAt,
                                    "ddd, MMM Do [at] h:mma",
                                    timezone
                                )
                            }</TicketTypeName>
                        </TicketType>
                    );
                })}
            </Container>
        </Container>
    );
};

export default SelectEventDays;
