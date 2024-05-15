
import React, { useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import * as OrderActions from "../../redux/actions/order.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import { Icons, Colors, Flex, Icon } from '@sellout/ui';
import TextArea from "../../elements/TextArea";
import REFUND_ORDER from '@sellout/models/.dist/graphql/mutations/refundOrder.mutation';
import { useQuery, useMutation } from '@apollo/react-hooks';
import * as Price from '@sellout/utils/.dist/price';
import { ModalContainer, ModalHeader, ModalFooter, ModalContent } from "./Modal";
import { BackstageState } from "../../redux/store";
import GET_ORDER from '@sellout/models/.dist/graphql/queries/order.query';
import AccordionMenu from "../AccordionMenu";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import IRefundModal from "@sellout/models/.dist/interfaces/IRefundModal";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import { getErrorMessage } from '@sellout/ui/build/utils/ErrorUtil';
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import OrderUtil from "@sellout/models/.dist/utils/OrderUtil";

type AccordionMenu = {
    data?: any;
    taxPercent?: number;
}
type SubTabProps = {
    className?: string;
    disabled?: boolean;
}
type FormGroupType = {
    disabled?: boolean;
}
type CheckBox = {
    checked?: boolean;
    disabled?: boolean;
}
const Container = styled.div`
  width: 375px;
  padding:20px;
  ${media.mobile`
      width: auto;
    `};
`;

const Subtext = styled.div`
  font-size: 1.2rem;
  margin: 10px 0;
`;

const TabContainer = styled.div`
    padding: 20px;
`;
const SubTab = styled.div<SubTabProps>`
    font-size: 13px;
    color: #999;
    padding: 0 10px 0 0;
    font-weight: 600;
    cursor: pointer;
    &.active {
        color:#000;
    }
`;
const TabHeader = styled.div`
    display:flex;
`;

const Required = styled.span`
    color: ${Colors.Red};
`;
const TabBody = styled.div`
    font-size: 1rem;
`;
const TabContent = styled.div<SubTabProps>`
    font-size: 1rem;
    display :${props => props.className === "show" ? 'block' : 'none'};
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-flow: wrap;
  gap: 10px;
`;
const FormGroup = styled.div<FormGroupType>`
    display: inline-block;
    margin: 8px 0;
    opacity:  ${props => props.disabled ? '0.5' : '1'};
`;
const ProcessingFee = styled.div<FormGroupType>`
    display: block;
    margin: 8px 0;
    opacity:  ${props => props.disabled ? '0.5' : '1'};
`;
const Checkbox = styled.input`
    padding: 0;
    height: initial;
    width: initial;
    margin-bottom: 0;
    display: none;
    cursor: pointer;
`;
const Label = styled.label<CheckBox>`
    position: relative;
    cursor: pointer;
    &:before {
        content:'';
        -webkit-appearance: none;
        background-color: transparent;
        border: 2px solid #FF700F;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), inset 0px -15px 10px -12px rgba(0, 0, 0, 0.05);
        padding: 6px;
        display: inline-block;
        position: relative;
        vertical-align: middle;
        cursor: pointer;
        margin-right: 5px;
        border-radius: 3px;
    }
    &:after {
        content: '';
        display:  ${props => props.checked ? 'block' : 'none'};
        position: absolute;
        top: 2px;
        left: 5.5px;
        width: 2px;
        height: 6px;
        border: solid #FF700F;
        border-width: 0 3px 3px 0;
        transform: rotate(45deg);
    }
`;
const SectionHeader = styled.div`
  text-transform: uppercase;
  display: inline-block;
  font-weight: 500;
  font-size: 1.2rem;
  color: ${Colors.Grey1};
  padding:10px 0;
  &:first-child {
      padding:0;
  }
  gap: 5px;
`;

const Border = styled.div`
  width: 100%;
  height: 1px;
  background: ${Colors.Grey6};
`;
const FooterButtons = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
`;

const orderStatus = Object.freeze({ active: "Active", refunded: "Refunded", partial: "Partial Refund", canceled: "Canceled" })

const RefundModal: React.FC = () => {
    /* State */
    const [refundReason, setRefundReason] = React.useState("" as string);
    const [ticketIds, setTicketIds] = React.useState([] as any);
    const [upgradeIds, setUpgradeIds] = React.useState([] as any);
    const [processingFee, setProcessingFee] = React.useState(false);
    const [processingFeeAble, setProcessingFeeAble] = React.useState(true);
    const [promoterFee, setPromoterFee] = React.useState(false);
    const [promoterFeeAble, setPromoterFeeAble] = React.useState(true);
    const [ticketPrice, seTicketPrice] = React.useState(0 as number);
    const [upgradePrice, setUpgradePrice] = React.useState(0 as number);
    const [promoterFeePrice, sePromoterFeePrice] = React.useState(0 as number);
    const [processingFeePrice, setProcessingFeePrice] = React.useState(0 as number);
    const [ticketsRefundFalse, setTicketsRefundFalse] = React.useState([] as any);
    const [upgradesRefundFalse, setUpgradesRefundFalse] = React.useState([] as any);
    const [activeTab, setActiveTab] = React.useState("NONREFUNDED" as string);
    const [status, setStatus] = React.useState("" as string);
    const [refundedItems, setRefundedItems] = React.useState([] as any);


    // Confirm
    const [showConfirm, setShowConfirm] = React.useState(false as boolean)

    /* Actions */
    const dispatch = useDispatch();
    const popModal = () => dispatch(AppActions.popModal());
    const orderState = useSelector((state: BackstageState) => state.order);
    const { data: orgData } = useQuery(GET_PROFILE);
    const { organization } = orgData;
    const { orderId } = orderState;
    let title = "Refund Order";
    let confirmText = 'Refund Order';
    let cancelText = 'Cancel';

    const { data, loading } = useQuery(GET_ORDER, {
        variables: {
            orderId
        },
    });
    let discountCode = data.order?.discountCode;
    let promotionsCode = data.order?.event.promotions.filter((promo) => promo?.code?.toLowerCase() === discountCode?.toLowerCase());
    let promotionCodePerOrder = promotionsCode?.length !== 0 && promotionsCode[0]?.appliesTo === "Per Order";
    let subtotal = OrderUtil.orderSubtotal(data?.order);

    const onTicket = (ticket) => {
        let perTicketDiscount = (data.order.discountAmount / subtotal) * ticket.price;
        let ticketPriceWithDiscount = ticket.price - perTicketDiscount;
        if (ticketIds.includes(ticket._id)) {
            const filtered = ticketIds.filter((id) => id !== ticket._id)
            setTicketIds(filtered);
            if (promotionCodePerOrder) {
                seTicketPrice(prevState => prevState - ticketPriceWithDiscount);
            } else {
                seTicketPrice(prevState => prevState - ticket.price)
            }
            setProcessingFeePrice(0 as number);
            sePromoterFeePrice(0 as number);
        } else {
            setTicketIds(ticketIds.concat(ticket._id));
            if (promotionCodePerOrder) {
                seTicketPrice((prevState) => prevState + ticketPriceWithDiscount);
            }
            else {
                seTicketPrice(prevState => prevState + ticket.price)
            }
        }
    }
    const onUpgrade = (upgrade) => {
        let perUpgradeDiscount = (data.order.discountAmount / subtotal) * upgrade.price;
        let ticketUpgradeWithDiscount = upgrade.price - perUpgradeDiscount;
        if (upgradeIds.includes(upgrade._id)) {
            const filtered = upgradeIds.filter((id) => id !== upgrade._id)
            setUpgradeIds(filtered);
            if (promotionCodePerOrder) {
                setUpgradePrice(prevState => prevState - ticketUpgradeWithDiscount);
            } else {
                setUpgradePrice(prevState => prevState - upgrade.price);
            }
            setProcessingFeePrice(0 as number);
            sePromoterFeePrice(0 as number);
        } else {
            setUpgradeIds(upgradeIds.concat(upgrade._id));
            if (promotionCodePerOrder) {
                setUpgradePrice((prevState) => prevState + ticketUpgradeWithDiscount);
            }
            else {
                setUpgradePrice(prevState => prevState + upgrade.price);
            }
        }
    }
    const onPromoterFees = () => {
        if (!promoterFee) {
            sePromoterFeePrice(data?.order?.promoterFee.amount)
        } else {
            sePromoterFeePrice(0 as number)
        }
        setPromoterFee(!promoterFee)
    }
    const onProcessFees = () => {
        if (!processingFee) {
            setProcessingFeePrice(data?.order.processingFee.amount)
        } else {
            setProcessingFeePrice(0 as number)
        }
        setProcessingFee(!processingFee)
    }

    const [refundOrder, { loading: refundOrderLoading }] = useMutation(REFUND_ORDER, {
        onError(error) {
            dispatch(AppActions.showNotification(getErrorMessage(error), AppNotificationTypeEnum.Error));
        },
        onCompleted(dataRefund) {
            dispatch(AppActions.showNotification("Your order has been refunded successfully.", AppNotificationTypeEnum.Success));
            dispatch(OrderActions.setOrderRefunded(true));
            orderState.ordersCache[orderId] = dataRefund.refundOrder;
            popModal();
            setRefundReason("");
            setTicketIds([]);
            setUpgradeIds([]);
            seTicketPrice(0);
            setUpgradePrice(0);
            setProcessingFeePrice(0);
            sePromoterFeePrice(0);
        },
    });


    const refundedPaymentType = data?.order?.payments?.map((item) => { return item.paymentMethodType })
    let taxPercent = data?.order.tax;
    const timezone = data?.order?.event?.venue?.address?.timezone;
    const promoterAmount = data?.order?.promoterFee.amount > 0;
    const processingAmount = data?.order?.processingFee.amount > 0;
    const selectAllTickets = () => {
        const totalPrice = data?.order.tickets.reduce((acc, item) => {
            if (promotionCodePerOrder) {
                let perTicketDiscount = (data.order.discountAmount / subtotal) * item.price;
                let ticketWithDiscount = item.price - perTicketDiscount;
                return !item.refund.refunded ? acc + ticketWithDiscount : acc
            }
            else {
                return !item.refund.refunded ? acc + item.price : acc
            }
        }, 0)
        if (ticketIds.length !== ticketsRefundFalse.length) {
            setTicketIds(ticketsRefundFalse);
            seTicketPrice(totalPrice);
        }
        else {
            setTicketIds([]);
            seTicketPrice(0 as number);
            setProcessingFeePrice(0 as number);
            sePromoterFeePrice(0);
        }
    }
    const selectAllUpgrades = () => {
        const totalPrice = data?.order.upgrades.reduce((acc, item) => {
            if (promotionCodePerOrder) {
                let perUpgradeDiscount = (data.order.discountAmount / subtotal) * item.price;
                let upgradeWithDiscount = item.price - perUpgradeDiscount;
                return !item.refund.refunded ? acc + upgradeWithDiscount : acc
            }
            else {
                return !item.refund.refunded ? acc + item.price : acc
            }
        }, 0)
        if (upgradeIds.length !== upgradesRefundFalse.length) {
            setUpgradeIds(upgradesRefundFalse);
            setUpgradePrice(totalPrice);
        }
        else {
            setUpgradeIds([]);
            setUpgradePrice(0 as number);
            setProcessingFeePrice(0 as number);
            sePromoterFeePrice(0 as number);
        }
    }

    let ticketsValue = [] as any;


    useEffect(() => {
        const refundedTrueItems = [] as any;
        const NonRefundedTickets = [] as any;
        const NonRefundedUpgrades = [] as any;
        data?.order.upgrades.map(upgrade => { upgrade.itemType = "upgrade"; upgrade.refund.refunded === false ? NonRefundedUpgrades.push(upgrade._id as string) : refundedTrueItems.push(upgrade) })
        setUpgradesRefundFalse(NonRefundedUpgrades)

        data?.order.tickets.map(ticket => { ticket.itemType = "ticket"; ticket.refund.refunded === false ? NonRefundedTickets.push(ticket._id as string) : refundedTrueItems.push(ticket) })
        if (data?.order?.processingFee?.refund?.refunded === true) {
            data.order.processingFee.itemType = "processingFee"
            refundedTrueItems.push(data.order.processingFee);
        }
        if (data?.order?.promoterFee?.refund?.refunded === true) {
            data.order.promoterFee.itemType = "promoterFee"
            refundedTrueItems.push(data.order.promoterFee);
        }
        setTicketsRefundFalse(NonRefundedTickets)
        setStatus(data?.order.state)

        let items = [] as any;
        refundedTrueItems.map((item) => {
            let oldIndex = items.findIndex(x => x.index === item.refund.refundedAt)
            if (oldIndex === -1) {
                items.push({
                    index: item.refund.refundedAt,
                    timezone: timezone,
                    items: [item],
                    reason: item.refund.refundReason,
                })
            } else {
                items[oldIndex]['items'] = [...items[oldIndex]['items'], item]
            }
        })
        const sortedData = items.sort(function (a, b) { return b.index - a.index });
        setRefundedItems(sortedData);
        setActiveTab(data?.order.state === orderStatus.refunded ? "REFUNDED" : "NONREFUNDED");

    }, [data?.order]);

    const changeProcessingFee = () => {
        setProcessingFeeAble(true);
        !processingAmount && processingFeePrice === 0 ? setProcessingFee(true) : setProcessingFee(false);
        setPromoterFeeAble(true);
        !promoterAmount && promoterFeePrice === 0 ? setPromoterFee(true) : setPromoterFee(false);
    }
    const processingFeeUnabler = () => {
        let refundedTickets = data?.order.tickets.filter((ticket) => !ticket.refund.refunded).length;
        let refundUpgradeId = data?.order.upgrades.filter((upgrade) => !upgrade.refund.refunded).length;
        if (ticketIds.length === refundedTickets && upgradeIds.length === refundUpgradeId) {
            setProcessingFeeAble(!processingFeeAble);
            setPromoterFeeAble(!promoterFeeAble);
        } else {
            changeProcessingFee();
        }
    }

    useEffect(() => {
        processingFeeUnabler();
    }, [ticketIds, upgradeIds]);
    if (loading) {
        return null
    }

    const refundOrderValidate = () => {
        const noItemSelected = ticketIds.length !== 0 || upgradeIds.length !== 0 || processingFee !== false || promoterFee !== false;
        const validate = EventUtil.validateRefundModal({ refundReason, ticketIds, upgradeIds, processingFee, promoterFee } as IRefundModal);
        const validationErrors = validate?.error?.details?.map((detail: any) => detail.message) ?? [];

        if (!noItemSelected) {
            dispatch(AppActions.showNotification("Please Select atleast one checkbox.", AppNotificationTypeEnum.Error));
            return;
        } else if (validationErrors.length > 0) {
            dispatch(AppActions.showNotification(validationErrors[0], AppNotificationTypeEnum.Error));
            return;
        }
        setShowConfirm(true)
    }

    const percentage = (price: any) => {
        const amount = price;
        const totalAmount = parseFloat(amount);
        return Price.output(totalAmount.toFixed(2), true);
    }
    const pricePerTicketOrder = (ticket) => {
        if (promotionCodePerOrder) {
            let perTicketDiscount = (data.order.discountAmount / subtotal) * ticket.price;
            let ticketWithDiscount = ticket.price - perTicketDiscount;
            return ticketWithDiscount
        }
    }
    const pricePerUpgradeOrder = (upgrade) => {
        if (promotionCodePerOrder) {
            let perUpgradeDiscount = (data.order.discountAmount / subtotal) * upgrade.price;
            let upgradeWithDiscount = upgrade.price - perUpgradeDiscount;
            return upgradeWithDiscount
        }
    }
    const refundAmount = ticketPrice + upgradePrice + processingFeePrice + promoterFeePrice
    const saleTaxAmount = Price.output(refundAmount.toFixed(2), true);

    /* Render */
    return (<>
        <ModalContainer display={showConfirm ? "none" : "block"}>
            <ModalHeader title={title} close={popModal} />
            <TabContainer>
                <TabHeader>
                    <SubTab className={activeTab === "NONREFUNDED" ? 'active' : ''} onClick={() => status === orderStatus.refunded ? null : setActiveTab("NONREFUNDED")}>
                        Non-Refunded
                    </SubTab>
                    <SubTab className={activeTab === "REFUNDED" ? 'active' : ''} onClick={() => status === orderStatus.active ? null : setActiveTab("REFUNDED")}>
                        Refunded
                    </SubTab>
                </TabHeader>

                <TabBody>
                    <TabContent className={activeTab === "NONREFUNDED" ? 'show' : ''}>
                        <Container>
                            {data?.order.tickets.filter((x) => !x.refund.refunded).length > 0 && <> <FormGroup onClick={() => selectAllTickets()}>
                                <Checkbox type="checkbox" />
                                <Label checked={ticketIds.length === ticketsRefundFalse.length} >
                                    <SectionHeader>Tickets
                                        <Icon
                                            icon={Icons.TicketRegular}
                                            color={Colors.Grey1}
                                            size={12}
                                            margin="0px 10px 0px 0px"
                                            position="absolute"
                                            top="0px"
                                            left="72px"
                                        />
                                    </SectionHeader>
                                </Label>
                            </FormGroup>
                                {data?.order?.tickets.map((ticket, index) => {
                                    if (ticket.refund.refunded) return false;
                                    let totalPriceWithDiscount = pricePerTicketOrder(ticket)
                                    const finalValue = totalPriceWithDiscount ? totalPriceWithDiscount : ticket.price
                                    return (
                                        <Flex key={index}>
                                            <FormGroup disabled={ticket.refund.refunded} onClick={() => ticket.refund.refunded ? null : onTicket(ticket)}>
                                                <Checkbox type="checkbox" />
                                                <Label checked={!ticket.refund.refunded ? ticketIds.includes(ticket._id) : true} >

                                                    {ticket.name}{ticket.seat ? ` (${ticket.seat}) ` : null} (${`${percentage(finalValue)}`})</Label>
                                            </FormGroup>
                                        </Flex>
                                    );
                                })}
                                <Border /> </>}
                            {data?.order.upgrades.filter((x) => !x.refund.refunded).length > 0 &&
                                <>
                                    <FormGroup onClick={() => selectAllUpgrades()}>
                                        <Checkbox type="checkbox" />
                                        <Label checked={upgradeIds.length === upgradesRefundFalse.length} >
                                            <SectionHeader>Upgrades
                                                <Icon
                                                    icon={Icons.UpgradeRegular}
                                                    color={Colors.Grey1}
                                                    size={12}
                                                    margin="0px 10px 0px 0px"
                                                    position="absolute"
                                                    top="0px"
                                                    left="88px"
                                                />
                                            </SectionHeader>
                                        </Label>
                                    </FormGroup>
                                    {data?.order.upgrades.map((upgrade, index) => {
                                        if (upgrade.refund.refunded) return false;
                                        let totalUpgradeWithDiscount = pricePerUpgradeOrder(upgrade)
                                        const finalValue = totalUpgradeWithDiscount ? totalUpgradeWithDiscount : upgrade.price
                                        return (
                                            <Flex key={index}>
                                                <FormGroup disabled={upgrade.refund.refunded} onClick={() => upgrade.refund.refunded ? null : onUpgrade(upgrade)}>
                                                    <Checkbox type="checkbox" />
                                                    <Label checked={!upgrade.refund.refunded ? upgradeIds.includes(upgrade._id) : true} >{upgrade.name} (${`${percentage(finalValue)}`})</Label>
                                                </FormGroup>
                                            </Flex>
                                        );
                                    })}

                                    <Border />
                                </>}
                            {!data?.order?.promoterFee?.refund?.refunded && promoterAmount &&
                                <>
                                    <SectionHeader>Promoter Fee {data?.order.tax > 0 && "/ Sales Tax"}</SectionHeader>
                                    <ProcessingFee disabled={promoterFeeAble} >
                                        <Checkbox type="checkbox" />
                                        <Label checked={promoterFee} onClick={() => promoterFeeAble ? null : onPromoterFees()}>Amount (${`${Price.output(data?.order.promoterFee?.amount || 0, true)}`})</Label>
                                    </ProcessingFee>
                                    <Border />
                                </>}
                            {!data?.order?.processingFee?.refund?.refunded && processingAmount &&
                                <>
                                    <SectionHeader>Processing Fee</SectionHeader>
                                    <ProcessingFee disabled={processingFeeAble} >
                                        <Checkbox type="checkbox" />
                                        <Label checked={processingFee} onClick={() => processingFeeAble ? null : onProcessFees()}>Amount (${`${Price.output(data?.order?.processingFee?.amount || 0, true)}`})</Label>
                                    </ProcessingFee>
                                </>}
                            {status !== orderStatus.refunded &&
                                <>
                                    <Border />
                                    <SectionHeader>Reason  <Required>*</Required> </SectionHeader>
                                    <TextArea
                                        placeholder="Enter a reason for cancellation"
                                        width="100%"
                                        value={refundReason}
                                        onChange={(e: React.FormEvent<HTMLInputElement>) =>
                                            setRefundReason(e.currentTarget.value)
                                        }
                                        maxLength={100}
                                    />
                                </>}
                        </Container>
                    </TabContent>
                    <TabContent className={activeTab === "REFUNDED" ? 'show' : ''}>
                        <Container>
                            <AccordionMenu refundData={refundedItems} taxPercent={taxPercent as number} subtotal={subtotal} discountAmount={data.order.discountAmount}promotionCodePerOrder={promotionCodePerOrder}/>
                        </Container>
                    </TabContent>
                </TabBody>
            </TabContainer>

            <ModalFooter>
                <ButtonContainer>
                    {activeTab === "NONREFUNDED" &&
                        <>
                            <SectionHeader style={{ display: 'grid' }}>
                                <span>
                                    payment method: {refundedPaymentType}
                                </span>
                                <span>
                                    Refund Amount : ${saleTaxAmount}
                                </span>
                            </SectionHeader>
                            <FooterButtons>
                                <Button
                                    type={ButtonTypes.Thin}
                                    text={cancelText}
                                    state={ButtonStates.Warning}
                                    margin="0px 10px 0px 0px"
                                    onClick={() => popModal()}
                                />
                                <Button
                                    type={ButtonTypes.Thin}
                                    text={confirmText}
                                    state={ButtonStates.Active}
                                    onClick={() => refundOrderValidate()}
                                    loading={refundOrderLoading}
                                />
                            </FooterButtons> </>}
                    {activeTab === "REFUNDED" && <SectionHeader style={{ display: "grid" }} >
                        <span>
                            payment method: {refundedPaymentType}
                        </span>

                        Total Refunded Amount : ${`${Price.output(data?.order.refundedAmount, true)}`}

                    </SectionHeader>}
                </ButtonContainer>
            </ModalFooter>
        </ModalContainer>
        {
            showConfirm &&
            <ConfirmActionModal
                title="Refund Confirmation"
                message="Are you sure you want to refund the order?"
                cancel={() => setShowConfirm(false)}
                loading={refundOrderLoading || false}
                organization={organization}
                processingFee={processingFee}
                processingAmount={data?.order?.processingFee?.amount}
                confirm={
                    () => refundOrder({
                        variables: {
                            orderId: orderId,
                            ticketIds: ticketIds,
                            upgradeIds: upgradeIds,
                            refundAmount: 0,
                            refundReason: refundReason,
                            processingFee: processingFee,
                            promoterFee: promoterFee
                        },
                    })
                }
            />
        }

    </>
    );
};
const ConfirmActionModal = ({
    title = 'Are you sure?',
    message,
    confirm,
    confirmText = 'CONFIRM',
    cancel,
    cancelText = 'CANCEL',
    loading = false,
    organization,
    processingFee,
    processingAmount
}) => {

    return (
        <ModalContainer display="block">
            <ModalHeader title={title} close={cancel} />
            <Container>
                <ModalContent padding="5px">{message}
                    {processingFee && processingAmount > 0 && <Subtext >{organization?.orgName} will cover ${Price.output(processingAmount || 0, true)} in transaction fees.</Subtext>}
                </ModalContent>
            </Container>
            <ModalFooter>
                <div />
                <Flex>
                    {cancel && (
                        <Button
                            type={ButtonTypes.Thin}
                            state={ButtonStates.Warning}
                            text={cancelText}
                            margin="0 10px 0 0"
                            onClick={() => {
                                if (cancel) cancel();
                            }}
                        />
                    )}
                    <Button
                        type={ButtonTypes.Thin}
                        text={confirmText}
                        onClick={() => {
                            if (confirm) confirm();
                        }}
                        loading={loading}
                    />
                </Flex>
            </ModalFooter>
        </ModalContainer>
    );
};


export default RefundModal;
