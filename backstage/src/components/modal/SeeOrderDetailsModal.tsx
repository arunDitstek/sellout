import React, { useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import {
    ModalContainer,
    ModalHeader,
    ModalContent,
    ModalFooter,
} from "./Modal";
import { useLazyQuery } from "@apollo/react-hooks";
import { BackstageState } from "../../redux/store";
import GET_ORDER from '@sellout/models/.dist/graphql/queries/order.query';
import { Icons, Icon, Colors, Loader, LoaderSizes } from '@sellout/ui';
import Flex from '@sellout/ui/build/components/Flex';
import OrderUtil from '@sellout/models/.dist/utils/OrderUtil';
import * as Price from '@sellout/utils/.dist/price';
import PaymentUtil from "@sellout/models/.dist/utils/PaymentUtil";
import { OrderStateEnum } from '@sellout/models/.dist/interfaces/IOrderState';
import { EventSaleTaxEnum } from '@sellout/models/.dist/interfaces/IEvent';

const Container = styled.div`
  width: 400px;
  border-radius: 0px 0px 10px 10px;
  overflow: hidden;
`;
const SubContainer = styled.div`
    padding: 20px;
`;

const ModalLoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
`;
const Row = styled.div`
  margin-bottom: 10px;
`;
const Text = styled.div`
  font-size: 1.3rem;
  font-weight: 500;
  color: ${Colors.Grey1};
  width:25%;
  &:first-child {
      width:50%;
      display: flex;
      gap:5px
  }
  &:last-child {
      text-align:right;
  }
`;
const TopHeading = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  width:25%;
  &:first-child {
      width:50%;
  }
  &:last-child {
      text-align:right;
  }
`;
const HeadingText = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
`;

const Spacer = styled.div`
  height: 25px;
`;

type SeeOrderDetailsModalProps = {};
const SeeOrderDetailsModal: React.FC<SeeOrderDetailsModalProps> = () => {
    const dispatch = useDispatch();
    const orderState = useSelector((state: BackstageState) => state.order);
    const { orderId } = orderState;

    // HANDLE ERROR
    const [getOrder, { data, loading, error }] = useLazyQuery(GET_ORDER, {
        fetchPolicy: "network-only"
    });

    useEffect(() => {
        if (orderId) {
            getOrder({
                variables: {
                    orderId
                }
            })
        }
    }, [orderId])
    const popModal = () => dispatch(AppActions.popModal());


    const order = data?.order
    const tax: number = data && order?.tax ? order?.tax : 0
    ////////////////////  Without Refunded ////////////////////
    const tickets = data && order.tickets
        .reduce((cur, next) => {
            if (cur.hasOwnProperty(next.ticketTypeId)) {
                (cur as any)[next.ticketTypeId].count++;
                if (next.scan.scanned) (cur as any)[next.ticketTypeId].scannedCount++;
            } else {
                (cur as any)[next.ticketTypeId] = {
                    typeId: next.ticketTypeId,
                    name: next.name,
                    price: OrderUtil.ticketTypeTotal(order, next.ticketTypeId),
                    count: 1,
                    scannedCount: next.scan.scanned ? 1 : 0,
                    seats: OrderUtil.ticketTypeSeats(order, next.ticketTypeId),
                };
            }
            return cur;
        }, {});

    const upgrades = data && order.upgrades
        .reduce((cur, next) => {
            if (cur.hasOwnProperty(next.upgradeId)) {
                (cur as any)[next.upgradeId].count++;
                if (next.scan.scanned) (cur as any)[next.upgradeId].scannedCount++;
            } else {
                (cur as any)[next.upgradeId] = {
                    typeId: next.upgradeId,
                    name: next.name,
                    price: OrderUtil.upgradeTypeTotal(order, next.upgradeId),
                    count: 1,
                    scannedCount: next.scan.scanned ? 1 : 0,
                };
            }
            return cur;
        }, {});

    const ticketsPrice = data && order.tickets.reduce((acc, item) => {
        return acc + item.price + (item.price * tax / 100)
    }, 0)

    const upgradesPrice = data && order.upgrades.reduce((acc, item) => {
        return acc + item.price + (item.price * tax / 100)
    }, 0)

    ////////////////////////  With Refunded /////////////////////

    const refundedTickets = data && order.tickets
        .reduce((cur, next) => {
            if (cur.hasOwnProperty(next.ticketTypeId)) {
                if (next.refund.refunded) (cur as any)[next.ticketTypeId].count++;
                if (next.scan.scanned) (cur as any)[next.ticketTypeId].scannedCount++;
            } else
                if (next.refund.refunded) {
                    (cur as any)[next.ticketTypeId] = {
                        typeId: next.ticketTypeId,
                        name: next.name,
                        price: data && order.tickets.filter((x) => x.refund.refunded).reduce((acc, item) => {
                            return acc + item.price
                        }, 0),
                        count: 1,
                        scannedCount: next.scan.scanned ? 1 : 0,
                        seats: OrderUtil.ticketTypeSeats(order, next.ticketTypeId),
                    };
                }
            return cur;
        }, {});


    const refundedUpgrades = data && order.upgrades
        .reduce((cur, next) => {
            if (cur.hasOwnProperty(next.upgradeId)) {
                if (next.refund.refunded) (cur as any)[next.upgradeId].count++;
                if (next.scan.scanned) (cur as any)[next.upgradeId].scannedCount++;
            } else if (next.refund.refunded) {
                (cur as any)[next.upgradeId] = {
                    typeId: next.upgradeId,
                    name: next.name,
                    price: data && order.upgrades.filter((x) => x.refund.refunded).reduce((acc, item) => {
                        return acc + item.price
                    }, 0),
                    count: 1,
                    scannedCount: next.scan.scanned ? 1 : 0,
                };
            }
            return cur;
        }, {});

    const refundedTicketsPrice = data && order.tickets.filter((x) => x.refund.refunded).reduce((acc, item) => {
        return acc + item.price
    }, 0)

    const refundedUpgradesPrice = data && order.upgrades.filter((x) => x.refund.refunded).reduce((acc, item) => {
        return acc + item.price
    }, 0)

    const refundedTicketsPriceTax = data && order.tickets.filter((x) => x.refund.refunded).reduce((acc, item) => {
        return acc + item.price + (item.price * tax / 100)
    }, 0)

    const refundedUpgradesPriceTax = data && order.upgrades.filter((x) => x.refund.refunded).reduce((acc, item) => {
        return acc + item.price + (item.price * tax / 100)
    }, 0)

    const ticketsPriceWithoutTax = data && order.tickets.reduce((acc, item) => {
        return acc + item.price
    }, 0)

    const upgradesPriceWithoutTax = data && order.upgrades.reduce((acc, item) => {
        return acc + item.price
    }, 0)

    const paymentMethodType = data && order.payments[0].paymentMethodType

    const fees = data && data?.order.fees.filter(a => a.appliedBy !== "Organization")

    const additionalFees = data && data?.order.fees.filter(a => a.appliedBy === "Organization" && a.name !== EventSaleTaxEnum.SalesTax)

    const totalParams = {
        tickets: data && order.tickets,
        upgrades: data && order.upgrades,
        fees: fees,
        paymentMethodType
    };

    ////////////////////// Additional Fees //////////////////
    additionalFees?.map(a => { a.amount = a.type === "Flat" ? Price.output(a.value, true) : ((ticketsPriceWithoutTax + upgradesPriceWithoutTax) * parseFloat(Price.output(a.value, true)) / 100).toFixed(2) })
    const additionalFeeAmount = additionalFees?.reduce((acc, item) => {
        return acc + parseFloat(item.amount.replace(/,/g, ''))
    }, 0)
    ////////////////////// Processing Fees //////////////////
    const prcessingFee = data && data?.order.processingFee.amount - (additionalFeeAmount * 100)

    const totalCharge = data && (prcessingFee + ticketsPrice + upgradesPrice + (additionalFeeAmount * 100));

     ////////////////////// Sales Tax //////////////////
    const salesTax = (Price.output(ticketsPriceWithoutTax + upgradesPriceWithoutTax, true));
    const salesTaxAmount = parseFloat(salesTax.replace(/,/g, '')) * tax / 100
    
    const refundType = data && order.state
    const netRevenue = (ticketsPrice + upgradesPrice) - refundedTicketsPriceTax - refundedUpgradesPriceTax + (additionalFeeAmount * 100);
    const salesTaxRefunded = (Price.output(refundedTicketsPrice + refundedUpgradesPrice, true));
    const salesTaxRefundedAmount = parseFloat(salesTaxRefunded.replace(/,/g, '')) * tax / 100
    const netRevenueCount = data && order.tickets.filter((x) => !x.refund.refunded).length + order.upgrades.filter((x) => !x.refund.refunded).length

    const totalRefundedFees = prcessingFee && parseFloat(Price.output(prcessingFee, true).replace(/,/g, '')) + additionalFeeAmount
    return (
        <ModalContainer>
            <ModalHeader title="Order Detail" close={() => popModal()} />

            <Container>
                {(loading || !data?.order) ? (
                    <ModalLoadingContainer>
                        <Loader size={LoaderSizes.Large} color={Colors.Orange} />
                    </ModalLoadingContainer>
                ) : (
                    <SubContainer>
                        <Row>
                            <Flex justify="space-between">
                                <TopHeading>ORDER</TopHeading>
                                <TopHeading>#</TopHeading>
                                <TopHeading>$</TopHeading>
                            </Flex>
                        </Row>
                        {Object.values(tickets).map((ticket: any, index) => {
                            return (
                                <Row key={index}>
                                    <Flex justify="space-between">
                                        <Text><Icon
                                            icon={Icons.TicketRegular}
                                            color={Colors.Grey1}
                                            size={12}
                                        />{ticket.name}</Text>
                                        <Text>{ticket.count}</Text>
                                        <Text> ${Price.output(ticket.price, true)}</Text>
                                    </Flex>
                                </Row>
                            );
                        })}

                        {Object.values(upgrades).map((upgrade: any, index) => {
                            return (
                                <Row key={index}>
                                    <Flex justify="space-between">
                                        <Text><Icon
                                            icon={Icons.UpgradeRegular}
                                            color={Colors.Grey1}
                                            size={12}
                                        />{upgrade.name}</Text>
                                        <Text>{upgrade.count}</Text>
                                        <Text> ${Price.output(upgrade.price, true)}</Text>
                                    </Flex>
                                </Row>
                            );
                        })}

                        <Spacer />
                        <Row>
                            <Flex justify="space-between">
                                <HeadingText>FEES</HeadingText>
                            </Flex>
                        </Row>

                        <Row>
                            <Flex justify="space-between">
                                <Text>{"Processing"}</Text>
                                <Text>${Price.output(prcessingFee, true)}</Text>
                            </Flex>
                            {additionalFees.map((fees, index) => {
                                return (<Flex key={index} justify="space-between">
                                    <Text>{fees.name}</Text>
                                    <Text>${fees.amount}</Text>
                                </Flex>)
                            })}
                        </Row>

                        {tax > 0 && <> <Spacer />
                            <Row>
                                <Flex justify="space-between">
                                    <HeadingText>Sales Tax</HeadingText>
                                </Flex>
                            </Row>
                            <Row>
                                <Flex justify="space-between">
                                    <Text>{"Sales Tax"}</Text>
                                    <Text>${salesTaxAmount.toFixed(2)}</Text>
                                </Flex>
                            </Row></>}

                        <Spacer />
                        <Row>
                            <Flex justify="space-between">
                                <Text>TOTAL CHARGE</Text>
                                <Text>${(Price.output(totalCharge, true))}</Text>
                            </Flex>
                        </Row>
                        <Row>
                            <Flex justify="space-between">
                                <Text>TOTAL REVENUE</Text>
                                <Text>${(Price.output(ticketsPrice + upgradesPrice + (additionalFeeAmount * 100), true))}</Text>
                            </Flex>
                        </Row>

                        {(refundType === OrderStateEnum.Refunded || refundType === OrderStateEnum.PartiallyRefunded) && <> <Spacer />
                            <Row>
                                <Flex justify="space-between">
                                    <HeadingText>REFUNDS</HeadingText>
                                </Flex>
                            </Row>
                            {Object.values(refundedTickets).map((ticket: any, index) => {
                                return (
                                    <Row key={index}>
                                        <Flex justify="space-between">
                                            <Text><Icon
                                                icon={Icons.TicketRegular}
                                                color={Colors.Grey1}
                                                size={12}
                                            />{ticket.name}</Text>
                                            <Text>{ticket.count}</Text>
                                            <Text> ${Price.output(ticket.price, true)}</Text>
                                        </Flex>
                                    </Row>
                                );
                            })}

                            {Object.values(refundedUpgrades).map((upgrade: any, index) => {
                                return (
                                    <Row key={index}>
                                        <Flex justify="space-between">
                                            <Text><Icon
                                                icon={Icons.UpgradeRegular}
                                                color={Colors.Grey1}
                                                size={12}
                                            />{upgrade.name}</Text>
                                            <Text>{upgrade.count}</Text>
                                            <Text> ${Price.output(upgrade.price, true)}</Text>
                                        </Flex>
                                    </Row>
                                );
                            })}
                            {refundType === OrderStateEnum.Refunded && <Flex justify="space-between">
                                <Text>{"Fees"}</Text>
                                <Text>${totalRefundedFees.toFixed(2)}</Text>
                            </Flex>}

                            {tax > 0 && <Flex justify="space-between">
                                <Text>{"Sales Tax"}</Text>
                                <Text>${salesTaxRefundedAmount.toFixed(2)}</Text>
                            </Flex>}

                            <Spacer />
                            <Row>
                                <Flex justify="space-between">
                                    <Text>NET REVENUE</Text>
                                    <Text>{netRevenueCount}</Text>
                                    {(refundType === OrderStateEnum.Refunded) ? <Text>${(Price.output(ticketsPrice + upgradesPrice + (additionalFeeAmount * 100) - totalCharge, true))}</Text> : <Text>${(Price.output(netRevenue, true))}</Text>}
                                </Flex>
                            </Row></>}

                    </SubContainer>)}
            </Container>
        </ModalContainer>
    );
};

export default SeeOrderDetailsModal;

