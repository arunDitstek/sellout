import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import * as AppActions from "../../redux/actions/app.actions";
import Toggle from "../../elements/Toggle";
import TextButton, {
  TextButtonSizes,
} from "@sellout/ui/build/components/TextButton";
import Input from "@sellout/ui/build/components/Input";
import FormattedInput, { InputFormats } from "@sellout/ui/build/components/FormattedInput";
import DatePicker from "../../elements/DatePicker";
import { Colors, Icon, Icons } from "@sellout/ui";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import ITicketTier from "@sellout/models/.dist/interfaces/ITicketTier";
import * as Time from "@sellout/utils/.dist/time";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import * as Price from '@sellout/utils/.dist/price';
import useEvent from "../../hooks/useEvent.hook";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { TierStatusEnum } from "@sellout/models/.dist/enums/TierStatusEnum";
import TierUtil from "@sellout/models/.dist/utils/TierUtil";

/********************************************************************************
 *  Tiers Table
 *******************************************************************************/

const Table = styled.div`
  position: relative;
  /* display: flex;
  flex-direction: column; */
`;

const Header = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
`;

const Body = styled.div`
  position: relative;
`;

const TableRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 10px;
`;

type CellProps = {
  width: string;
};

const Cell = styled.div<CellProps>`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  width: ${(props) => props.width};
  margin-right: 15px;
`;

const IconContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  width: 65px;
`;

type StatusDotParams = {
  status: TierStatusEnum;
}

const StatusDot = styled.div<StatusDotParams>`
  position: relative;
  height: 6px;
  width: 6px;
  border-radius: 50%;
  background-color: ${props => {
    switch(props.status) {
      case TierStatusEnum.InProgress:
        return Colors.Green;
      case TierStatusEnum.Past:
        return Colors.Orange;
      case TierStatusEnum.NotStarted:
        return Colors.Grey5;
      default: 
        return Colors.Grey5;
    }
  }};
`;



type TiersTableProps = {
  event: IEventGraphQL;
  ticketType: ITicketType;
};

const TiersTable: React.FC<TiersTableProps> = ({ 
  event,
  ticketType
}) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId } = eventState;

  /* Actions */
  const dispatch = useDispatch();

  const setTicketTypeTier = (tierId: string, tier: Partial<ITicketTier>) =>
    dispatch(
      EventActions.setTicketTypeTier(
        eventId,
        ticketType._id as string,
        tierId,
        tier
      )
    );

  const setTicketTypeTierEndsAt = (tierId: string, endsAt: number) =>
    dispatch(
      EventActions.setTicketTypeTierEndsAt(
        eventId,
        ticketType._id as string,
        tierId,
        endsAt,
      )
    );

  const removeTicketTypeTier = (tierId: string) =>
    dispatch(
      EventActions.removeTicketTypeTier(
        eventId,
        ticketType._id as string,
        tierId
      )
    );
  
  /** Render */
  return (
    <Table>
      <Header>
        <Cell width="160px">Tier Name</Cell>
        <Cell width="95px">Price</Cell>
        {/* <Cell width="220px">Start Date/Time</Cell> */}
        <Cell width="220px">Exp. Date/Time</Cell>
        <Cell width="100px">Exp. Qty</Cell>
      </Header>
      <Body>
        {ticketType.tiers.map((tier: ITicketTier, index: number) => {

          const status = event.hasOrders ? TierUtil.tierStatus(ticketType, tier) : TierStatusEnum.NotStarted;
          const isInProgress = status === TierStatusEnum.InProgress;
          const isPast = status == TierStatusEnum.Past;
          const isNotStarted = status === TierStatusEnum.NotStarted;

          const isFirstTier = index === 0;
          const isLastTier = index === ticketType.tiers.length - 1;

          const hasQtyLimit = tier.totalQty !== ticketType.totalQty;


          const nameIsDisabled = event.hasOrders && (isPast || isInProgress); 
          const priceIsDisabled = event.hasOrders && (isPast);
          const endDateIsDisabled = event.hasOrders && (isLastTier || isPast);
          const qtyIsDisabled = event.hasOrders && (isLastTier || isPast);

          return (
            <TableRow key={index}>
              <Cell width="160px">
                <Input
                  disabled={nameIsDisabled}
                  placeholder="Tier name"
                  width="160px"
                  value={tier.name as string}
                  onChange={(e: React.FormEvent<HTMLInputElement>) =>
                    setTicketTypeTier(tier._id as string, {
                      name: e.currentTarget.value,
                    })
                  }
                />
              </Cell>
              <Cell width="95px">
                <FormattedInput
                  disabled={priceIsDisabled}
                  placeholder="0.00"
                  width="95px"
                  value={Price.output(tier.price)}
                  onChange={(e: React.FormEvent<HTMLInputElement>) =>
                    setTicketTypeTier(tier._id as string, {
                      price: Price.input(e.currentTarget.value),
                    })
                  }
                  format={InputFormats.Price}
                />
              </Cell>
              {/* <Cell width="220px">
                <DatePicker
                  disabled={true}
                  width="220px"
                  value={tier.startsAt ? Time.date(tier.startsAt) : null}
                  onChange={(value: any) => {
                    const date = Time.fromDate(value);
                    setTicketTypeTier(tier._id as string, { startsAt: date });
                  }}
                />
              </Cell> */}
              <Cell width="220px">
                <DatePicker
                  disabled={endDateIsDisabled}
                  width="220px"
                  value={tier.endsAt ? Time.date(tier.endsAt) : null}
                  onChange={(value: any) => {
                    const date = Time.fromDate(value);
                    setTicketTypeTierEndsAt(tier._id as string, date);
                  }}
                  onClear={() => {
                    setTicketTypeTier(tier._id as string, { endsAt: null });
                  }}
                />
              </Cell>
              <Cell width="100px">
                <Input
                  disabled={qtyIsDisabled}
                  placeholder="0"
                  width="100px"
                  type={!hasQtyLimit ? "text" : "number"}
                  value={!hasQtyLimit ? "None" : tier.totalQty.toString()}
                  onChange={(e: React.FormEvent<HTMLInputElement>) => {
                    const qty = parseInt(e.currentTarget.value);
                    setTicketTypeTier(tier._id as string, {
                      totalQty: qty,
                      remainingQty: qty,
                    });
                  }}
                  onClear={() => {
                    setTicketTypeTier(tier._id as string, {
                      totalQty: ticketType.totalQty,
                      remainingQty: ticketType.remainingQty,
                    });
                  }}
                />
              </Cell>
              <IconContainer>
                <StatusDot status={status} />
                {!isLastTier && !isFirstTier ? (
                  <Icon
                    icon={Icons.DeleteRegular}
                    color={Colors.Grey4}
                    size={14}
                    hoverColor={Colors.Red}
                    onClick={() => removeTicketTypeTier(tier._id as string)}
                  />
                ) : (
                  <Icon
                    icon={Icons.DeleteRegular}
                    color={Colors.OffWhite}
                    size={14}
                  />
                )}
              </IconContainer>
            </TableRow>
          );
        })}
      </Body>
    </Table>
  );
};

/********************************************************************************
 *  Create Event Ticket Type Tiers
 *******************************************************************************/

const Container = styled.div`
  padding: 30px 0 0;
`;

const Spacer = styled.div`
  width: 20px;
  height: 20px;
`;


type CreateEventTicketTypeTiersProps = {
  ticketType: ITicketType;
};

const CreateEventTicketTypeTiers: React.FC<CreateEventTicketTypeTiersProps> = ({
  ticketType,
}) => {
  /* Hooks */
  const { event, eventId } = useEvent();
  /* State */
  const tiers = ticketType.tiers;
  const eventState = useSelector((state: BackstageState) => state.event);
  const { isUsingPricingTiers } = eventState;

  /* Actions */
  const dispatch = useDispatch();

  const addTicketTypeTier = () =>
    dispatch(EventActions.addTicketTypeTier(eventId, ticketType._id as string));

  const togglePricingTiers = () =>
    dispatch(EventActions.setIsUsingPricingTiers(!isUsingPricingTiers));

  const popModal = () => dispatch(AppActions.popModal());

  const showCannotDisableTiersNotification = () =>
    dispatch(AppActions.showNotification("You cannot disable pricing tiers once tickets have been sold or comped. Please contact support with questions or comments.", AppNotificationTypeEnum.Error));

  const confirmDisablePricingTiers = () => {
    dispatch(
      AppActions.pushModalConfirmAction({
        title: "Disable pricing tiers",
        message: "Are you sure you want to disable pricing tiers?",
        confirm: () => {
          togglePricingTiers();
          popModal();
        },
        cancel: popModal,
      })
    );
  };

  const confirmTogglePricingTiers = () => {
    if (event?.hasOrders) {
      showCannotDisableTiersNotification();
      return;
    }

    if (isUsingPricingTiers) {
      confirmDisablePricingTiers();
    } else {
      togglePricingTiers();
    }
  };

  /** Render */
  return (
    <Container>
      <Toggle
        active={isUsingPricingTiers}
        onChange={() => {
          confirmTogglePricingTiers();
        }}
        title="Pricing Tiers"
      />

      {isUsingPricingTiers && (
        <Fragment>
          <Spacer />
          {event && <TiersTable event={event} ticketType={ticketType} />}
          <Spacer />
          <TextButton
            size={TextButtonSizes.Small}
            onClick={() => addTicketTypeTier()}
            icon={Icons.PlusCircleLight}
          >
            Add another tier
          </TextButton>
        </Fragment>
      )}
    </Container>
  );
};

export default CreateEventTicketTypeTiers;
