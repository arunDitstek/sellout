import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import * as SeasonActions from "../../redux/actions/season.actions";
import Toggle from "../../elements/Toggle";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import SelectTicketTypes from "./SelectTicketTypes";
import Label from "@sellout/ui/build/components/Label";

type ContainerProps = {
  hasPadding: boolean;
};

const Container = styled.div<ContainerProps>`
  padding: ${(props) => (props.hasPadding ? "30px 0 0" : null)};
`;

const Spacer = styled.div`
  width: 20px;
  height: 20px;
`;

type CreateEventPromotionTicketOptionsProps = {
  promotion: IEventPromotion;
  showToggle?: boolean;
  label?: string;
  tip?: string;
};

const CreateEventPromotionTicketOptions: React.FC<
  CreateEventPromotionTicketOptionsProps
> = ({ promotion, showToggle = true, label, tip }) => {
  /* State */
  const [limitTickets, setLimitTickets] = React.useState(
    promotion.ticketTypeIds.length > 0
  );
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId } = eventState;

  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId } = seasonState;

  /* Actions */
  const dispatch = useDispatch();

  const addPromotionTicketTypeId = (ticketTypeId: string) =>
    dispatch(
      EventActions.addPromotionTicketTypeId(
        eventId,
        promotion._id as string,
        ticketTypeId
      )
    );

  const removePromotionTicketTypeId = (ticketTypeId: string) =>
    dispatch(
      EventActions.removePromotionTicketTypeId(
        eventId,
        promotion._id as string,
        ticketTypeId
      )
    );

  const clearTicketTypes = () => {
    dispatch(
      EventActions.setPromotion(eventId, promotion._id as string, {
        ticketTypeIds: [],
      })
    );
  };

  const addSeasonPromotionTicketTypeId = (ticketTypeId: string) =>
    dispatch(
      SeasonActions.addPromotionTicketTypeId(
        seasonId,
        promotion._id as string,
        ticketTypeId
      )
    );

  const removeSeasonPromotionTicketTypeId = (ticketTypeId: string) =>
    dispatch(
      SeasonActions.removePromotionTicketTypeId(
        seasonId,
        promotion._id as string,
        ticketTypeId
      )
    );

  const clearSeasonTicketTypes = () => {
    dispatch(
      SeasonActions.setPromotion(seasonId, promotion._id as string, {
        ticketTypeIds: [],
      })
    );
  };

  /** Render */
  return (
    <Container hasPadding={showToggle}>
      {showToggle && (
        <Toggle
          active={limitTickets}
          onChange={() => {
            if (limitTickets) {
              eventId ? clearTicketTypes() : clearSeasonTicketTypes();
            }

            setLimitTickets(!limitTickets);
          }}
          title="Limit to specific tickets"
          tip="Choose which tickets this upgrade can be applied to"
        />
      )}
      {(!showToggle || limitTickets) && (
        <Fragment>
          <Spacer />
          {label && <Label text={label} tip={tip} />}
          <SelectTicketTypes
            selected={promotion.ticketTypeIds}
            add={
              eventId
                ? addPromotionTicketTypeId
                : addSeasonPromotionTicketTypeId
            }
            remove={
              eventId
                ? removePromotionTicketTypeId
                : removeSeasonPromotionTicketTypeId
            }
          />
        </Fragment>
      )}
    </Container>
  );
};

export default CreateEventPromotionTicketOptions;
