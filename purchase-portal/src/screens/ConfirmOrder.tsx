import React, { Fragment, useEffect, useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import {
  EventSaleTaxEnum,
  IEventGraphQL,
} from "@sellout/models/.dist/interfaces/IEvent";
import { Colors } from "@sellout/ui/build/Colors";
import ScreenHeader from "../components/ScreenHeader";
import { ErrorKeyEnum } from "../redux/reducers/app.reducer";
import Flex from "@sellout/ui/build/components/Flex";
import Icon, { Icons } from "@sellout/ui/build/components/Icon";
import {
  ICreateOrderTicketParams,
  ICreateOrderUpgradeParams,
} from "@sellout/models/.dist/interfaces/ICreateOrderParams";
import * as Price from "@sellout/utils/.dist/price";
import StripeElements from "./../containers/StripeElements";
import UserInfo, {
  UserInfoSizeEnum,
} from "@sellout/ui/build/components/UserInfo";
import IStripePaymentMethod from "@sellout/models/.dist/interfaces/IStripePaymentMethod";
import PaymentUtil from "@sellout/models/.dist/utils/PaymentUtil";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import { PaymentMethodTypeEnum } from "@sellout/models/.dist/enums/PaymentMethodTypeEnum";
import AnimateHeight from "react-animate-height";
import * as Polished from "polished";
import IStripeCardDetails from "../models/interfaces/IStripeCardDetails";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import { OrderTypeEnum } from "@sellout/models/.dist/interfaces/IOrderType";
import * as Time from "@sellout/utils/.dist/time";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import { UserImage } from "@sellout/ui";
import DiscountCodeInput from "../components/DiscountCodeInput";
import * as OrderActions from "../redux/actions/order.actions";

export const Container = styled.div`
  display: flex;
`;

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const Name = styled.div`
  font-size: 1.4rem;
  color: ${Colors.Grey1};
  font-weight: 600;
`;

const SubContainer = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  padding-bottom: 72px;
`;

const Content = styled.div`
  margin: 24px 0 0;
  padding: 0 24px;
`;

const Label = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey1};
  /* margin-bottom: 1px; */
  font-weight: 600;
`;

const ValueLabel = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey1};
  margin-bottom: 16px;
  font-weight: 600;
  text-align: right;
`;

const Heading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Row = styled.div`
  margin-bottom: 10px;
`;

const TitleBold = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  margin-left: 7px;
`;

const Title = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey1};
  margin-left: 7px;
`;

const SubTitle = styled.div`
  font-size: 1.2rem;
  font-weight: 400;
  color: ${Colors.Grey2};
  margin-left: 20px;
  margin-top: 5px;
`;

const PriceText = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey1};
`;

const PriceTextBold = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.Grey1};
`;

const Border = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${Colors.Grey6};
  margin: 11px 0;
`;

const Description = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 160%;
  color: ${Colors.Grey2};
  margin-top: 10px;
`;

const ErrorMessage = styled.p`
  color: red;
`;

type EllipsisProps = {
  active: boolean;
};

const Ellipsis = styled.div<EllipsisProps>`
  display: -webkit-box;
  -webkit-line-clamp: ${(props) => (props.active ? 3 : null)};
  -webkit-box-orient: ${(props) => (props.active ? "vertical" : null)};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ShowMore = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 160%;
  color: ${Colors.Orange};
  transition: all 0.2s;
`;

const ShowMoreInner = styled.span`
  &:hover {
    cursor: pointer;
    color: ${Polished.lighten(0.025, Colors.Orange)};
  }

  &:active {
    color: ${Polished.darken(0.025, Colors.Orange)};
  }
`;

const DateText = styled.span`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-top: 5px;
  padding-right: 5px;
`;

type Info = {
  name: string;
  count: number;
  price: number;
  seats?: string[];
  description?: string;
  ticketTypeId?: any;
  dayIds?: string[];
};

type OrderInfoRowProps = {
  info: Info;
  icon: any;
  isComplimentary: boolean;
  isRSVP: boolean;
  event?: any;
  season?: any;
};

type PaymentInfoRowProps = {
  info?: IStripePaymentMethod;
  event?: any;
  season?: any;
  stripeCardDetail?: IStripeCardDetails;
};

type TotalInfoRowProps = {
  total?: Number;
  promoterFee?: Number;
  discountCode?: string;
  subTotal?: Number;
  processingFee?: Number;
  event?: any;
  season?: any;
  totalParams?: any;
  discountAmount?: Number;
};

const CardIconMap: Record<string, React.ReactNode> = {
  visa: (
    <Icon icon={Icons.Visa} size={14} margin="0 7px 0 0" color={Colors.Grey1} />
  ),
  mastercard: (
    <Icon
      icon={Icons.Mastercard}
      size={14}
      margin="0 7px 0 0"
      color={Colors.Grey1}
    />
  ),
  discover: (
    <Icon
      icon={Icons.Discover}
      size={14}
      margin="0 7px 0 0"
      color={Colors.Grey1}
    />
  ),
  amex: (
    <Icon icon={Icons.Amex} size={14} margin="0 7px 0 0" color={Colors.Grey1} />
  ),
};

const OrderInfoRow: React.FC<OrderInfoRowProps> = ({
  info,
  icon,
  isComplimentary,
  isRSVP,
  event,
}) => {
  const [showMore, setShowMore] = useState(false);
  const [showEllipsis, setShowEllipsis] = useState(true);

  const ticketValue = event.ticketTypes.filter(
    (a: any) => a._id === info.ticketTypeId
  );
  const toggle = () => {
    setShowEllipsis(!showEllipsis);
    setShowMore(!showMore);
  };
  const timeZone = event?.venue?.address?.timezone
    ? event?.venue?.address?.timezone
    : "America/Denver";

  const value =
    ticketValue.length > 0 &&
    (parseFloat(ticketValue[0].values) * info.count).toFixed(2);

  return (
    <>
      <Row>
        <Flex justify="space-between">
          <Flex direction="row">
            <Icon icon={icon} color={Colors.Grey1} size={12} />
            <Title>
              {info.count}&nbsp;&nbsp;{"x"}&nbsp;&nbsp;{info.name}
            </Title>
          </Flex>
          {!isComplimentary && (
            <>
              {!isRSVP && (
                <PriceText>${Price.output(info.price, true)}</PriceText>
              )}
              {isRSVP && (
                <PriceText>
                  {ticketValue.length > 0 && "$"}
                  {Price.output(Number(value), true)}
                </PriceText>
              )}
            </>
          )}
        </Flex>

        <Flex direction="row">
          {" "}
          {event.isMultipleDays &&
            info.dayIds?.map((day: any, i) => {
              return (
                <DateText key={i}>
                  {Time.format(day, "MMM Do", timeZone)}
                  {info?.dayIds && info?.dayIds.length !== i + 1 && ","}
                </DateText>
              );
            })}
        </Flex>

        {(() => {
          if (!info.description) return;

          return (
            <Fragment>
              <AnimateHeight height="auto">
                <Ellipsis active={showEllipsis}>
                  <Description>{info.description}</Description>
                </Ellipsis>
              </AnimateHeight>
              <ShowMore>
                <ShowMoreInner onClick={() => toggle()}>
                  {showMore ? "Show Less" : "Show More"}
                </ShowMoreInner>
              </ShowMore>
            </Fragment>
          );
        })()}
        {Boolean(info.seats?.length) && (
          <Flex>
            <SubTitle>{info?.seats?.join(", ")}</SubTitle>
          </Flex>
        )}
      </Row>
    </>
  );
};

const PaymentInfoRow: React.FC<PaymentInfoRowProps> = ({
  info,
  stripeCardDetail,
}) => {
  const { app, order } = useSelector((state: PurchasePortalState) => state);
  const errorMsg: any = app.errors[ErrorKeyEnum.ConFirmOrderError];
  const { createOrderParams } = order;
  const { isComplimentary, mode } = app;
  let paymentType = "" as any;
  switch (createOrderParams.paymentMethodType) {
    case PaymentMethodTypeEnum.None:
      return (paymentType =
        (createOrderParams.type === OrderTypeEnum.RSVP || isComplimentary) &&
        !errorMsg
          ? "No payment required."
          : (" " as any));
    case PaymentMethodTypeEnum.Cash:
      return (paymentType =
        !isComplimentary && !errorMsg ? "CASH" : ("" as any));

    case PaymentMethodTypeEnum.Check:
      return (paymentType =
        !isComplimentary && !errorMsg ? "CHECK" : ("" as any));
  }

  return (
    <Row>
      <Flex justify="space-between">
        {mode === EPurchasePortalModes.BoxOffice && (
          <Flex direction="row">
            {stripeCardDetail ? (
              <>
                {CardIconMap[stripeCardDetail.brand]}
                {`**** **** **** ${stripeCardDetail.last4} | Exp. ${stripeCardDetail.expMonth}/${stripeCardDetail.expYear}`}
              </>
            ) : (
              paymentType
            )}
          </Flex>
        )}

        {mode === EPurchasePortalModes.Checkout && (
          <Flex direction="row">
            {info ? (
              <>
                {CardIconMap[info.brand]}
                {`**** **** **** ${info.last4} | Exp. ${info.expMonth}/${info.expYear}`}
              </>
            ) : (
              paymentType
            )}
          </Flex>
        )}
      </Flex>
    </Row>
  );
};

const TotalInfoRow: React.FC<TotalInfoRowProps> = ({
  total,
  promoterFee,
  discountCode,
  subTotal,
  processingFee,
  event,
  totalParams,
  discountAmount,
}) => {
  const salesTax: any = Price.output(
    PaymentUtil.calculatePaymentTotal(totalParams)?.salesTax,
    true
  );
  return (
    <>
      {!EventUtil.isRSVP(event) && (
        <>
          {promoterFee !== 0 && (
            <Row>
              <Flex justify="space-between">
                <Flex direction="row">
                  <Title>Promoter Fees</Title>
                </Flex>
                <PriceText>${Price.output(promoterFee, true)}</PriceText>
              </Flex>
            </Row>
          )}
          <Border />
          {discountCode && (
            <Row>
              <Flex justify="space-between">
                <Flex direction="row">
                  <Title>Discount</Title>
                </Flex>
                <PriceText>${Price.output(discountAmount, true)}</PriceText>
              </Flex>
            </Row>
          )}
          <Row>
            <Flex justify="space-between">
              <Flex direction="row">
                <Title>Subtotal</Title>
              </Flex>
              <PriceText>${Price.output(subTotal, true)}</PriceText>

              {/* <PriceText>${Price.output(subTotal, true)}</PriceText> */}
            </Flex>
          </Row>
          {event?.taxDeduction && (
            <Row>
              <Flex justify="space-between">
                <Flex direction="row">
                  <Title>Sales Tax</Title>
                </Flex>
                <PriceText>${salesTax}</PriceText>
              </Flex>
            </Row>
          )}
          {processingFee !== 0 && (
            <Row>
              <Flex justify="space-between">
                <Flex direction="row">
                  <Title>Processing Fees</Title>
                </Flex>
                <PriceText>${Price.output(processingFee, true)}</PriceText>
              </Flex>
            </Row>
          )}
        </>
      )}
      <Row>
        <Flex justify="space-between">
          <Flex direction="row">
            <TitleBold>Total</TitleBold>
          </Flex>
          <PriceTextBold>${Price.output(total, true)}</PriceTextBold>
          {/* <PriceTextBold>${Price.output(total, true)}</PriceTextBold> */}
        </Flex>
      </Row>{" "}
    </>
  );
};

type ConfirmOrderProps = {
  event?: IEventGraphQL;
  season?: ISeasonGraphQL;
};

const ConfirmOrder: React.FC<ConfirmOrderProps> = ({ event, season }) => {
  /** State **/
  const dispatch = useDispatch();
  const {
    app,
    order,
    user,
    app: { errors },
  } = useSelector((state: PurchasePortalState) => state);
  const { userProfile, stripeCardDetail } = user;
  const {
    cashTendered,
    guestCheckout,
    appliedDiscount,
    createOrderParams: {
      tickets,
      upgrades,
      paymentMethodType,
      discountCode,
      discountAmount,
    },
  } = order;

  /** Actions **/
  const ticketInfo = tickets.reduce((cur, ticket: ICreateOrderTicketParams) => {
    if (cur.hasOwnProperty(ticket.ticketTypeId)) {
      cur[ticket.ticketTypeId].price += ticket.price;
      cur[ticket.ticketTypeId].count++;
      if (ticket.seat) cur[ticket?.ticketTypeId]?.seats?.push(ticket.seat);
    } else {
      cur[ticket.ticketTypeId] = {
        name: ticket.name,
        price: ticket.price,
        count: 1,
        ticketTypeId: ticket.ticketTypeId,
        description: ticket.description,
        dayIds: ticket.dayIds,
        // Fixed issue SELLOUT-18
        seats: ticket.seat ? [ticket.seat] : [],
      };
    }
    return cur;
  }, {} as Record<string, Info>);

  const upgradeInfo = upgrades.reduce(
    (cur, upgrade: ICreateOrderUpgradeParams) => {
      if (cur.hasOwnProperty(upgrade.upgradeId)) {
        cur[upgrade.upgradeId].price += upgrade.price;
        cur[upgrade.upgradeId].count++;
      } else {
        cur[upgrade.upgradeId] = {
          name: upgrade.name,
          price: upgrade.price,
          count: 1,
          description: upgrade.description,
        };
      }
      return cur;
    },
    {} as Record<string, Info>
  );

  const paymentInfo = userProfile?.stripeCustomer?.paymentMethods.find(
    (paymentMethod: IStripePaymentMethod) =>
      paymentMethod.paymentMethodId === order.paymentMethodId
  );
  const { isComplimentary } = app;
  const totalParams: any = {
    tickets,
    upgrades,
    fees: event ? event?.fees : season?.fees,
    paymentMethodType,
    // promotions: event ? event.promotions : season?.promotions,
    promotions: appliedDiscount as any,
  };

  const ticketTotal = tickets?.reduce(
    (cur, ticket) => cur + parseFloat(ticket.values as string),
    0
  );

  const discountAmount1 =
    EventUtil.isRSVP(event as IEventGraphQL) || isComplimentary
      ? 0
      : PaymentUtil.calculatePaymentTotal(totalParams).discountAmount;

  const promoterFee =
    EventUtil.isRSVP(event as IEventGraphQL) || isComplimentary
      ? 0
      : PaymentUtil.calculatePaymentTotal(totalParams).promoterFees;

  const subTotal =
    EventUtil.isRSVP(event as IEventGraphQL) || isComplimentary
      ? 0
      : PaymentUtil.calculatePaymentTotal(totalParams).subTotal + promoterFee;
  const processingFee =
    EventUtil.isRSVP(event as IEventGraphQL) || isComplimentary
      ? 0
      : PaymentUtil.calculatePaymentTotal(totalParams).selloutFees +
        PaymentUtil.calculatePaymentTotal(totalParams).stripeFees;
  const total =
    EventUtil.isRSVP(event as IEventGraphQL) || isComplimentary
      ? ticketTotal
      : PaymentUtil.calculatePaymentTotal(totalParams).total;

  const changeAmount = (cashTendered as number) - total;
  const errorMsg: any = app.errors[ErrorKeyEnum.ConFirmOrderError];

  const discountCodeFilter = event?.promotions?.find((item) => {
    return item.type.includes("Discount");
  });

  useEffect(() => {
    if (discountAmount1) {
      dispatch(
        OrderActions.setCreateOrderParams({
          discountAmount: discountAmount1,
        })
      );
    }
  }, [discountAmount1]);

  /** Render **/
  return (
    <SubContainer>
      <ScreenHeader title="Order confirmation" />
      <Content>
        {guestCheckout ? (
          <Container>
            <UserImage
              height="50px"
              size="1rem"
              imageUrl={""}
              firstName={""}
              lastName={""}
            />
            <Details>
              <Name>{"Guest"}</Name>
            </Details>
          </Container>
        ) : (
          <UserInfo user={userProfile?.user} size={UserInfoSizeEnum.Large} />
        )}
        <Border />
        <Heading>
          <Label>Order</Label>
          {event && EventUtil.isRSVP(event) && <ValueLabel>Value</ValueLabel>}
        </Heading>

        {Object.values(ticketInfo).map((ticketInfo, index) => (
          <OrderInfoRow
            event={event ? event : season}
            key={index}
            info={ticketInfo}
            icon={Icons.TicketRegular}
            isComplimentary={isComplimentary}
            isRSVP={EventUtil.isRSVP(event as IEventGraphQL) as boolean}
          />
        ))}
        {Object.values(upgradeInfo).map((upgradeInfo, index) => (
          <OrderInfoRow
            event={event ? event : season}
            key={index}
            info={upgradeInfo}
            icon={Icons.UpgradeRegular}
            isComplimentary={isComplimentary}
            isRSVP={EventUtil.isRSVP(event as IEventGraphQL) as boolean}
          />
        ))}
        {discountCodeFilter && !isComplimentary && <DiscountCodeInput />}

        {errors && <ErrorMessage>{errors.Global}</ErrorMessage>}
        {!isComplimentary && (
          <>
            {event && EventUtil.isRSVP(event) && <Border />}
            <TotalInfoRow
              total={total}
              discountCode={discountCode}
              discountAmount={discountAmount1}
              subTotal={subTotal}
              promoterFee={promoterFee}
              processingFee={processingFee}
              event={event ? event : season}
              totalParams={totalParams}
            />
            <Border />
          </>
        )}
        <Label>{errorMsg ? "Info" : "Payment Info"}</Label>

        <PaymentInfoRow
          info={paymentInfo}
          stripeCardDetail={stripeCardDetail}
          event={event ? event : season}
        />

        {paymentMethodType === PaymentMethodTypeEnum.Cash && !errorMsg && (
          <PriceText>
            ${Price.output(cashTendered, true)} tendered. $
            {Price.output(changeAmount, true)} change.
          </PriceText>
        )}
        <ErrorMessage>{errorMsg}</ErrorMessage>
      </Content>
    </SubContainer>
  );
};

const WrappedConfirmOrder = (props: ConfirmOrderProps) => (
  <StripeElements useConnectedAccount={true}>
    <ConfirmOrder {...props} />
  </StripeElements>
);

export default WrappedConfirmOrder;
