import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import { Colors, Icon, Icons } from "@sellout/ui";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  row-gap: 10px;
`;

type TicketTypeProps = {
  active: boolean;
};

const TicketType = styled.div<TicketTypeProps>`
  position: relative;
  height: 38px;
  margin-right: 10px;
  padding: 0 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid ${(props) => (props.active ? Colors.Orange : Colors.Grey5)};
  border-radius: 10px;
  transition: all 0.2s;
  flex: 1 1 auto;
  &:hover {
    cursor: pointer;
  }
`;

const TicketTypeName = styled.div<TicketTypeProps>`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${(props) => (props.active ? Colors.Orange : Colors.Grey5)};
  margin-left: 10px;
  transition: all 0.2s;
`;

type SelectTicketTypesProps = {
  selected: string[];
  add: (ticketTypeId: string) => void;
  remove: (ticketTypeId: string) => void;
  upgrade?:string

};

const SelectTicketTypes: React.FC<SelectTicketTypesProps> = ({
  selected,
  add,
  remove,
  upgrade
}) => {
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonCache, seasonId } = seasonState;
  const season = seasonCache[seasonId];

  const eventSeasonState = event ? event : season;

  /** Render */
  return (
    <Container>
      {!upgrade &&
      <Container>
        {eventSeasonState?.ticketTypes?.map((ticketType: ITicketType) => {
          const active = selected.includes(ticketType._id as string);

          const onClick = () => {
            if (active) {
              remove(ticketType._id as string);
            } else {
              add(ticketType._id as string);
            }
          };
          return (
            <TicketType key={ticketType._id} onClick={onClick} active={active}>
              <Icon
                icon={Icons.CheckCircle}
                color={active ? Colors.Orange : Colors.Grey5}
                size={14}
              />
              <TicketTypeName active={active}>{ticketType.name}</TicketTypeName>
            </TicketType>
          );
        })}
      </Container>
}
      {upgrade && 
      <Container>
        {eventSeasonState?.upgrades?.map((upgradeType: any) => {
          const active = selected.includes(upgradeType._id as string);
          const onClick = () => {
            if (active) {
              remove(upgradeType._id as string);
            } else {
              add(upgradeType._id as string);
            }
          };

          return (
            <TicketType key={upgradeType._id} onClick={onClick} active={active}>
              <Icon
                icon={Icons.CheckCircle}
                color={active ? Colors.Orange : Colors.Grey5}
                size={14}
              />
              <TicketTypeName active={active}>{upgradeType.name}</TicketTypeName>
            </TicketType>
          );
        })}
      </Container>}
    </Container>
  );
};

export default SelectTicketTypes;
