import React from 'react';
import styled from "styled-components";
import { Colors, Icon, Icons, Flex } from '@sellout/ui';
import UserEventPreview from "../../components/User/UserEventPreview";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import { BackstageState } from "../../redux/store";
import OrderUtil from '@sellout/models/.dist/utils/OrderUtil';
import * as Price from '@sellout/utils/.dist/price';
import IOrder, { IOrderGraphQL } from '@sellout/models/.dist/interfaces/IOrder';
import moment from 'moment';
import { useQuery } from '@apollo/react-hooks';
import GET_ORDER from '@sellout/models/.dist/graphql/queries/order.query';
import * as Time from '@sellout/utils/.dist/time';
import EventUtil from '@sellout/models/.dist/utils/EventUtil';
import { media } from '@sellout/ui/build/utils/MediaQuery';

const Container = styled.div`
  background: ${Colors.OffWhite};
  width: 100vw;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0px;
  overflow-y: scroll;
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
  &::-webkit-scrollbar {
    width: 0 !important;
    display: none;
  }

  @media screen and (min-width: 768px) {
    width: 400px;
    height: auto;
    max-height: 80vh;
    border-radius: 5px;
    ${media.mobile`
        width: 100%;
    `};
  }
`;

type TicketInfoProps = {
    margin?: any;
};

const TicketInfo = styled.div<TicketInfoProps>`
  font-weight: 500;
  font-size: 1.4rem;
  color: ${Colors.Purple};
  margin: ${props => (props.margin ? '0px 5px 0px 0px' : null)};
`;

const SeatsText = styled.div`
  font-weight: 400;
  font-size: 1.2rem;
  color: ${Colors.Grey3};
  margin-top: 5px;
`;

const OrderTotals = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey2};
`;

const EventDetailsLeft = styled.div`
  font-size: 1.4rem;
  color: ${Colors.Grey2};
  font-weight: 500;
`;

const EventDetailsRight = styled.div`
  font-weight: 600;
  font-size: 1.4rem;
  color: ${Colors.Purple};
`;

const TotalCost = styled.div`
  font-weight: 600;
  font-size: 1.4rem;
  color: ${Colors.Purple};
`;

const PlaceholderText = styled.div`
  font-weight: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-bottom: 15px;
`;

const Section = styled.div`
  background: ${Colors.White};
  margin: 10px;
  padding: 15px;
  border-radius: 5px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.Purple};
  margin-bottom: 15px;
`;

const CloseIcon = styled.div`
  position: absolute;
  z-index: 1;
`;

const Gradient = styled.div`
  position: absolute;
  background: linear-gradient(to top right,rgba(4,4,54,0) 46%, rgba(4,4,54,1) 130%);
  width: 85px;
  height: 60px;
  right: 0px;
`;

const CloseIconContainer = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;

const HorizontalLine = styled.div`
  width: 100%;
  height: 1px;
  background: ${Colors.Grey6};
  margin-bottom: 15px;
`;

const QrCode = styled.img`
  width: 150px;
`;

const QrCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
`;

const DateText = styled.span`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-top: 5px;
  padding-right: 5px;
`;

const DateTextWrapper = styled.div`
    display: flex;
    align-items: center;
`;

const Show = styled.div`
    text-align:right;
`;

// type FlexProps = {
//     margin: any;
//     direction: any;
//     justify: any;
//     align: any;
//     flex: any;
//     padding: any;
//     width: any;
//     height: any;
//     borderRight: any;
//     flexWrap: any;
// };

// const Flex = styled.div<FlexProps>`
//   display: flex;
//   flex-direction: ${props => props.direction};
//   justify-content: ${props => props.justify};
//   align-items: ${props => props.align};
//   width: ${props => props.width};
//   flex: ${props => props.flex};
//   margin: ${props => props.margin};
//   padding: ${props => props.padding};
//   width: ${props => props.width || '100%'};
//   height: ${props => props.height};
//   border-right: ${props => props.borderRight};
//   flex-wrap: ${props => props.flexWrap};
// `;

type UserOrderTicketModalProps = {};
const UserOrderTicketModal: React.FC<UserOrderTicketModalProps> = () => {

    const dispatch = useDispatch();

    const onCloseModal = () => {
        dispatch(AppActions.popModal());
    }

    const orderState = useSelector((state: BackstageState) => state.order);
    const { orderId } = orderState;

    const { data, loading, error } = useQuery(GET_ORDER, {
        variables: {
            orderId
        }
    });

    const order = data?.order
    const address = order?.event?.venue?.address
    const event = order?.event
    const timezone = address?.timezone

    const ticketCounts = data && OrderUtil.ticketCountsByTicketTypeId(order);
    const upgradeCounts = data && OrderUtil.upgradeCountsByUpgradeId(order);
    const orderSubtotal = data && `$${Price.output(order.payments && order.payments.amount ? (order.payments.amount + order.payments.tax) : OrderUtil.orderSubtotal(order), true)}`;
    const orderFees = data && `$${Price.output(order.processingFee && order.processingFee.amount ? order.processingFee.amount : OrderUtil.orderFee(order, order.fees), true)}`;
    //const orderTotal = data && `$${Price.output(order.payments && order.payments.amount ? order.payments.amount : OrderUtil.orderTotal(order, order.fees), true)}`;
    const qrCodeAt = data && Time.format(EventUtil.qrCodeEmailAt(event), 'dddd, MMMM Do [at] h:mma', timezone);

    const totalTicketsAmount = data && order.tickets.reduce((acc, item) => {
        return acc + item.price
    }, 0)

    const totalUpgradesAmount = data && order.upgrades.reduce((acc, item) => {
        return acc + item.price
    }, 0)

    const eventDetailsDate = data && Time.format(event.performances[0].schedule.startsAt, 'dddd, MMMM DD, YYYY', timezone);
    const eventDetailsDoors = data && Time.format(event.performances[0].schedule.doorsAt, 'h:mma', timezone);
    const singleDayEventDate = data && Time.format(event.performances[0].schedule[0].startsAt, "ddd, MMM DD, YYYY [at] h:mma", timezone);

    const eventDetailsVenue = data && event?.venue.name;
    const eventDetailsAddress1 = data && `${address.address1 || ''} ${address.address2 || ''}`;
    const eventDetailsAddress2 = data && `${address.city || ''}, ${address.state || ''} ${address.zip || ''}`;
    const isSalesTax = data && order.tax > 0

    //const tax = isSalesTax && order?.fees.filter((a: any) => a.name === EventSaleTaxEnum.SalesTax)[0].value
    let total = data && order.payments && order.payments.amount ? (order.payments.amount + order.payments.tax) : data && order ? OrderUtil.orderSubtotal(order) : 0
    let salesTaxAmount = data && `${Price.output(data && (parseFloat(total) / 100) * order?.tax, true)}`

    let refundedTickets = data && order.tickets.filter(a => a.refund.refunded).length

    let refundedTicketsAmount = 0 as number;
    refundedTicketsAmount = data && order.tickets.reduce((acc, item) => {
        return item.refund.refunded ? acc + item.price : acc
    }, 0)

    if (isSalesTax) {
        const totalSalesTax = refundedTicketsAmount / 100 * order?.tax
        refundedTicketsAmount = refundedTicketsAmount + totalSalesTax
    }

    if (data && order.state === "Refunded") {
        refundedTicketsAmount = order.refundedAmount;
    }

    const fees = orderFees && orderFees.substring(1);
    const totalAmount = Price.output(totalTicketsAmount + totalUpgradesAmount, true)
    const orderTotal = data && parseFloat(totalAmount.replaceAll(",", "")) + parseFloat(fees.replaceAll(",", "")) + parseFloat(salesTaxAmount.replaceAll(",", ""))

    const eventdays = [] as any;
    const aa = data && data?.order?.tickets.map(a => a.dayIds.map((b: any) => !eventdays.includes(b) && eventdays.push(b)))

    const isMultipleDays = order?.event?.isMultipleDays
    return (
        <>
            {!loading && <Container>
                <CloseIconContainer>
                    <CloseIcon>
                        <Gradient />
                        <Icon
                            icon={Icons.CancelCircle}
                            color={Colors.Grey5}
                            size={14}
                            hoverColor={Colors.Red}
                            margin="5px 5px"
                            onClick={onCloseModal}
                        />
                    </CloseIcon>
                </CloseIconContainer>
                <UserEventPreview
                    event={order.event}
                    radius="0px"
                    width="100%"
                    isModal
                />
                <Section>
                    <SectionHeader>
                        Your Tickets
                    </SectionHeader>
                    {order.qrCodeUrl
                        ? (
                            <QrCodeContainer>
                                <QrCode src={order.qrCodeUrl} />
                                <PlaceholderText>
                                    This QR code contains all of your tickets
                                </PlaceholderText>
                            </QrCodeContainer>
                        )
                        : (
                            <PlaceholderText>
                                {order.tickets.length > 1
                                    ? `Your tickets will be revealed on ${qrCodeAt}`
                                    : `Your ticket will be revealed on ${qrCodeAt}`}
                            </PlaceholderText>
                        )
                    }

                </Section>
                <Section>
                    <SectionHeader>
                        Order {order._id}
                    </SectionHeader>
                    {Object.entries(ticketCounts).map(([ticketTypeId, count]) => {
                        const ticketcount: any = count
                        const ticket = order.tickets.find(ticket => ticket.ticketTypeId === ticketTypeId);
                        const ticketTotal = OrderUtil.ticketTypeTotal(order, ticketTypeId);
                        let ticketTypeSeats = OrderUtil.ticketTypeSeats(order, ticketTypeId);
                        ticketTypeSeats = ticketTypeSeats.map(seat => seat.replace('Section', ''));

                        return (
                            <Flex key={ticketTypeId} margin="0px 0px 15px 0px" direction="column">
                                <Flex justify="space-between">
                                    <Flex>
                                        <TicketInfo margin>
                                            {ticketcount}
                                        </TicketInfo>
                                        <TicketInfo margin>
                                            {"x"}
                                        </TicketInfo>
                                        <TicketInfo>
                                            {ticket.name}
                                            <DateTextWrapper>
                                                {isMultipleDays && ticket.dayIds?.map((day: any, i) => {
                                                    return (
                                                        <DateText key={i}>{Time.format(
                                                            day,
                                                            "MMM Do",
                                                            timezone
                                                        )}{ticket?.dayIds && ticket?.dayIds.length !== i + 1 && ","}</DateText>
                                                    )
                                                })}
                                            </DateTextWrapper>
                                        </TicketInfo>
                                    </Flex>
                                    <TicketInfo>
                                        ${Price.output(ticketTotal, true)}
                                    </TicketInfo>

                                </Flex>
                                {Boolean(ticketTypeSeats.length) && <SeatsText >Seats {ticketTypeSeats.join(', ')}</SeatsText>}
                            </Flex>
                        );
                    })}
                    {Object.entries(upgradeCounts).map(([upgradeId, count]) => {
                        const upgradeCount: any = count
                        const upgrade = order.upgrades.find(upgrade => upgrade.upgradeId === upgradeId);
                        const upgradeTotal = OrderUtil.upgradeTypeTotal(order, upgradeId);
                        return (
                            <Flex key={upgradeId} justify="space-between">
                                <Flex margin="0px 0px 15px 0px">
                                    <TicketInfo margin>
                                        {upgradeCount}
                                    </TicketInfo>
                                    <TicketInfo margin>
                                        {"x"}
                                    </TicketInfo>
                                    <TicketInfo>
                                        {upgrade.name}
                                    </TicketInfo>
                                </Flex>
                                <TicketInfo>
                                    ${Price.output(upgradeTotal, true)}
                                </TicketInfo>
                            </Flex>
                        );
                    })}
                    <HorizontalLine />
                    <Flex justify="space-between" margin="0px 0px 10px 0px">
                        <OrderTotals>Order Subtotal</OrderTotals>
                        <OrderTotals>{orderSubtotal}</OrderTotals>
                    </Flex>
                    {isSalesTax && <Flex justify="space-between" margin="0px 0px 10px 0px">
                        <OrderTotals>Sales Tax</OrderTotals>
                        <OrderTotals>${salesTaxAmount}</OrderTotals>
                    </Flex>}
                    <Flex justify="space-between" margin="0px 0px 10px 0px">
                        <OrderTotals>Order Fees</OrderTotals>
                        <OrderTotals>{orderFees}</OrderTotals>
                    </Flex>
                    <Flex justify="space-between">
                        <TotalCost>Total</TotalCost>
                        <TotalCost>{orderTotal.toFixed(2)}</TotalCost>
                    </Flex>
                </Section>
                {/* {refundedTickets > 0 && <Section>
                    <SectionHeader>
                        Refunded Tickets
                    </SectionHeader>

                    <PlaceholderText>
                        {refundedTickets > 1
                            ? `${refundedTickets} tickets are refunded from your order `
                            : `${refundedTickets} ticket is refunded from your order `}
                        with ${Price.output(refundedTicketsAmount, true)} amount with all fees and taxes.
                    </PlaceholderText>

                </Section>} */}
                <Section>
                    <SectionHeader>
                        Event Details
                    </SectionHeader>
                    <Flex justify="space-between" margin="0px 0px 20px 0px">
                        <EventDetailsLeft>Date</EventDetailsLeft>
                        <EventDetailsRight>{eventDetailsDate}</EventDetailsRight>
                    </Flex>
                    <Flex justify="space-between" margin="0px 0px 20px 0px">
                        <EventDetailsLeft>Show</EventDetailsLeft>
                        {isMultipleDays ? <Show>
                            {eventdays?.map((day: any, i) => {
                                return (
                                    <EventDetailsRight key={i}>{Time.format(
                                        day,
                                        "ddd, MMM DD, YYYY [at] h:mma",
                                        timezone
                                    )}</EventDetailsRight>
                                )
                            })}
                        </Show> : <EventDetailsRight>
                            {singleDayEventDate}
                        </EventDetailsRight>}
                        {/* {eventDetailsShow} / {eventDetailsDoors} */}
                    </Flex>
                    <Flex justify="space-between" margin="0px 0px 20px 0px">
                        <EventDetailsLeft>Venue</EventDetailsLeft>
                        <EventDetailsRight>{eventDetailsVenue}</EventDetailsRight>
                    </Flex>
                    <Flex justify="space-between" margin="0px 0px 20px 0px">
                        <EventDetailsLeft>Address</EventDetailsLeft>
                        <Flex direction="column" align="flex-end">
                            <EventDetailsRight>{eventDetailsAddress1}</EventDetailsRight>
                            <EventDetailsRight>{eventDetailsAddress2}</EventDetailsRight>
                        </Flex>
                    </Flex>
                </Section>
            </Container>}
        </>
    );

}
export default UserOrderTicketModal;