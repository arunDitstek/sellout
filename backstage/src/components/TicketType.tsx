import React from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as EventActions from "../redux/actions/event.actions";
import * as AppActions from "../redux/actions/app.actions";
import { Colors, Icon, Icons } from "@sellout/ui";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import * as Price from "@sellout/utils/.dist/price";
import Flex from "@sellout/ui/build/components/Flex";
import ProgressBar from "../elements/ProgressBar";
import { ModalTypes } from "./modal/Modal";
import * as Polished from "polished";
import EventItemControls from "./EventItemControls";
import useEvent from "../hooks/useEvent.hook";
import useSeason from "../hooks/useSeason.hook";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import usePermission from "../hooks/usePermission.hook";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import * as SeasonActions from "../redux/actions/season.actions";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div<{ showPointer: boolean }>`
  position: relative;
  width: 600px;
  border-radius: 10px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid ${Colors.Grey5};
  transition: all 0.2s;
  background: ${Colors.White};  
  ${media.mobile`
    width: 100%;
  `};

  &:hover {
    border: 1px solid ${Polished.darken(0.05, Colors.Grey5)};
    cursor: ${(props) => (props.showPointer ? "pointer" : null)};
  }

  &:active {
    border: 1px solid ${Colors.Grey4};
  }
  ${media.mobile`
    width: 100%;
    box-sizing: border-box;
  `};
`;

const Content = styled.div`
  padding: 20px;
`;

const Spacer = styled.div`
  width: 20px;
  height: 20px;
`;

const Title = styled.div`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  width: 80%;
  height: 100%;
  border-radius: 10px 10px 0px 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0px 15px;
  overflow: hidden;
  > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Text = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
`;

const PriceText = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
`;

type TicketTypeProps = {
  ticketType: ITicketType;
  saveOnChanges?: boolean;
};

const TicketType: React.FC<TicketTypeProps> = ({
  ticketType,
  saveOnChanges = true,
}) => {
  /* Hooks */
  const { event, eventId } = useEvent();
  const { season, seasonId } = useSeason();
  const hasPermission = usePermission();

  /* State */
  const isEvent = window.location.href.includes("eventId");
  const tier = ticketType.tiers[ticketType.tiers.length - 1];

  /* Actions */
  const dispatch = useDispatch();
  const saveEvent = () => {
    if (event) {
      dispatch(EventActions.saveEvent(false, false));
    } else if (season) {
      dispatch(SeasonActions.saveSeason(false, false));
    }
  };

  const editTicketType = () => {
    if (isEvent && event) {
      dispatch(EventActions.setTicketTypeId(ticketType._id as string));
      dispatch(AppActions.pushModal(ModalTypes.TicketType, { saveOnChanges }));
    } else if (season) {
      dispatch(SeasonActions.setTicketTypeId(ticketType._id as string));
      dispatch(
        AppActions.pushModal(ModalTypes.SeasonTicketType, { saveOnChanges })
      );
    }
  };

  const toggleTicketTypeVisibile = () => {
    if (event) {
      dispatch(
        EventActions.setTicketTypeVisible(
          eventId,
          ticketType._id as string,
          !ticketType.visible
        )
      );
    } else if (season) {
      dispatch(
        SeasonActions.setTicketTypeVisible(
          seasonId,
          ticketType._id as string,
          !ticketType.visible
        )
      );
    }

    if (saveOnChanges) {
      saveEvent();
    }
  };

  const moveTicketTypeUp = () => {
    if (event) {
      dispatch(
        EventActions.moveTicketTypeUp(eventId, ticketType._id as string)
      );
    } else if (season) {
      dispatch(
        SeasonActions.moveTicketTypeUp(seasonId, ticketType._id as string)
      );
    }

    if (saveOnChanges) {
      saveEvent();
    }
  };

  const moveTicketTypeDown = () => {
    if (event) {
      dispatch(
        EventActions.moveTicketTypeDown(eventId, ticketType._id as string)
      );
    } else if (season) {
      dispatch(
        SeasonActions.moveTicketTypeDown(seasonId, ticketType._id as string)
      );
    }

    if (saveOnChanges) {
      saveEvent();
    }
  };

  const popModal = () => dispatch(AppActions.popModal());

  const removeTicketType = () => {
    popModal();
    if (event) {
      dispatch(
        EventActions.removeTicketType(eventId, ticketType._id as string)
      );
    } else if (season) {
      dispatch(
        SeasonActions.removeTicketType(seasonId, ticketType._id as string)
      );
    }
    if (saveOnChanges) {
      saveEvent();
    }
  };

  const confirmDeleteTicketType = () => {
    dispatch(
      AppActions.pushModalConfirmAction({
        title: "Are you sure?",
        message: `Are you sure you want to delete ticket ${ticketType.name}? This action cannot be undone.`,
        confirm: removeTicketType,
        cancel: popModal,
      })
    );
  };

  /** Render */
  const used = tier.totalQty - tier.remainingQty;
  const isSeated = event ? EventUtil.isSeated(event as IEventGraphQL) : true;
  const canDelete = used === 0 && !isSeated;

  return (
    <Container showPointer={Boolean(hasPermission(RolesEnum.ADMIN))}>
      {hasPermission(RolesEnum.ADMIN) && (
        <EventItemControls
          active={ticketType.visible}
          toggleActive={toggleTicketTypeVisibile}
          moveUp={moveTicketTypeUp}
          moveDown={moveTicketTypeDown}
          remove={canDelete ? confirmDeleteTicketType : undefined}
          itemCount={
            event
              ? event?.ticketTypes?.length ?? 0
              : season?.ticketTypes?.length ?? 0
          }
        />
      )}
      <Content
        onClick={() =>
          hasPermission(RolesEnum.ADMIN) ? editTicketType() : null
        }
      >
        <Flex justify="space-between" align="center">
          <Title>
            <Flex>
              <Icon
                icon={Icons.TicketSolid}
                color={Colors.Grey1}
                size={12}
                margin="0 7px 0 0"
                top="-2px"
              />
              {ticketType.name}
            </Flex>
          </Title>
        </Flex>
        <Spacer />
        <Flex justify="space-between" margin="0 0 10px">
          <Text>{`${used}/${tier.totalQty} Used`}</Text>
          {hasPermission(RolesEnum.ADMIN) && (
            <PriceText>
              {EventUtil.isRSVP(event as IEventGraphQL)
                ? "RSVP"
                : `$${Price.output(tier.price, true)}`}
            </PriceText>
          )}
        </Flex>
        <Flex>
          <ProgressBar value={used} maxValue={tier.totalQty} />
        </Flex>
      </Content>
    </Container>
  );
};

export default TicketType;
