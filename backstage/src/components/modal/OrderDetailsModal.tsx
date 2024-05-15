import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import { keyframes } from "styled-components";
import {
  Icons,
  Icon,
  Colors,
  Loader,
  LoaderSizes,
  Flex,
  UserImage,
  UserInfo,
} from "@sellout/ui";
import { BackstageState } from "../../redux/store";
import { ModalContainer, ModalHeader, ModalContent } from "./Modal";
import { useMutation, useLazyQuery } from "@apollo/react-hooks";
import TextButton, {
  TextButtonSizes,
} from "@sellout/ui/build/components/TextButton";
import * as OrderActions from "../../redux/actions/order.actions";
import * as Time from "@sellout/utils/.dist/time";
import GET_ORDER from "@sellout/models/.dist/graphql/queries/order.query";
import EventPreview from "../EventPreview";
import OrderUtil from "@sellout/models/.dist/utils/OrderUtil";
import { IOrderGraphQL } from "@sellout/models/.dist/interfaces/IOrder";
import usePrintOrder, {
  PrintedItemOrientationTypes,
} from "../../hooks/usePrintOrder.hook";
import { ModalTypes } from "../modal/Modal";
import SEND_ORDER_RECEIPT_EMAIL from "@sellout/models/.dist/graphql/mutations/sendOrderReceiptEmail.mutation";
import SEND_SEASON_ORDER_RECEIPT_EMAIL from "@sellout/models/.dist/graphql/mutations/sendSeasonOrderReceiptEmail.mutation";
import * as Price from "@sellout/utils/.dist/price";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import SeasonPreview from "../SeasonPreview";
import { VariantEnum } from "../../models/enums/VariantEnum";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import useEvent from "../../hooks/useEvent.hook";
import { OrderStateEnum } from "@sellout/models/.dist/interfaces/IOrderState";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import { UserInfoSizeEnum } from "@sellout/ui/build/components/UserInfo";
import { media } from "@sellout/ui/build/utils/MediaQuery";

const Container = styled.div`
  display: flex;
`;

const SubContainer = styled.div`
  width: 400px;
  border-radius: 0px 0px 10px 10px;
  overflow: hidden;
  ${media.mobile`
      width: auto;
    `};
`;

const SectionHeader = styled.div`
  text-transform: uppercase;
  font-weight: 500;
  font-size: 1.2rem;
  color: ${Colors.Grey2};
  margin-bottom: 15px;
`;

const SectionContent = styled.div``;

const Border = styled.div`
  width: 100%;
  height: 1px;
  background: ${Colors.Grey6};
`;

const ModalLoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
`;

const ItemText = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey1};
  font-weight: 500;
  display: flex;
  column-gap: 7px;
`;

const ItemTextLight = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey2};
  font-weight: 500;
  margin-right: 10px;
`;

const ItemTextBold = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey1};
  font-weight: 600;
`;
const SeeDetail = styled.div`
  position: absolute;
  top: 17px;
  left: 70px;
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

export const Email = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey2};
`;
const Multiply = styled.span``;
const SeatsListAnimation = keyframes`
  0% {
    opacity: 0;
  }
  75% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;
const SeatsList = styled.ul`
  animation: ${SeatsListAnimation} 0.2s ease-in-out;
  list-style: none;
  padding: 0px;
`;
const Seat = styled.li`
  border: 0px solid #fff;
  padding: 3px 0px;
`;

type OrderModalSectionProps = {
  order: IOrderGraphQL;
};

type SectionProps = {
  title: string;
  noBottomBorder?: boolean;
  children: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({
  title,
  noBottomBorder = false,
  children,
}) => (
  <>
    <ModalContent>
      <SectionHeader>{title}</SectionHeader>
      <SectionContent>{children}</SectionContent>
    </ModalContent>
    <Border />
  </>
);
const CustomerSection: React.FC<OrderModalSectionProps> = ({ order }) => (
  <Section title="CUSTOMER">
    {order.user ? (
      <UserInfo user={order?.user} size={UserInfoSizeEnum.Large} />
    ) : (
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
          <Email>{order?.email}</Email>
        </Details>
      </Container>
    )}
  </Section>
);

const EventSection: React.FC<OrderModalSectionProps> = ({ order }) => (
  <Section title="EVENT">
    {order.eventId ? (
      <EventPreview event={order?.event} order={order} showOrderStatus />
    ) : (
      <SeasonPreview season={order?.season} order={order} showOrderStatus />
    )}
  </Section>
);

const OrderSection: React.FC<OrderModalSectionProps> = ({ order }) => {
  const [showSeats, setShowSeats] = useState(false);
  const [showIndex, setShowIndex] = useState(0);
  // should probably move this order sumary stuff into common
  const tickets = order.tickets.reduce((cur, next) => {
    if (cur.hasOwnProperty(next.ticketTypeId)) {
      if (!next.refund.refunded) (cur as any)[next.ticketTypeId].count++;
      if (next.scan && next.scan[0].scanned)
        (cur as any)[next.ticketTypeId].scannedCount++;
    } else if (!next.refund.refunded) {
      (cur as any)[next.ticketTypeId] = {
        typeId: next.ticketTypeId,
        name: next.name,
        price: OrderUtil.ticketTypeTotal(order, next.ticketTypeId),
        count: 1,
        scannedCount: next.scan && next.scan[0].scanned ? 1 : 0,
        seats: OrderUtil.ticketTypeSeats(order, next.ticketTypeId),
      };
    }
    return cur;
  }, {});

  const upgrades = order.upgrades.reduce((cur, next) => {
    if (cur.hasOwnProperty(next.upgradeId)) {
      if (!next.refund.refunded) (cur as any)[next.upgradeId].count++;
      if (next.scan[0]?.scanned) (cur as any)[next.upgradeId].scannedCount++;
    } else if (!next.refund.refunded) {
      (cur as any)[next.upgradeId] = {
        typeId: next.upgradeId,
        name: next.name,
        price: OrderUtil.upgradeTypeTotal(order, next.upgradeId),
        count: 1,
        scannedCount: next.scan[0]?.scanned ? 1 : 0,
      };
    }
    return cur;
  }, {});
  const tax: number = order?.tax ? order?.tax : 0;
  const ticketsPrice = order.tickets
    .filter((x) => !x.refund.refunded)
    .reduce((acc, item) => {
      return acc + item.price + (item.price * tax) / 100;
    }, 0);

  const upgradesPrice = order.upgrades
    .filter((x) => !x.refund.refunded)
    .reduce((acc, item) => {
      return acc + item.price + (item.price * tax) / 100;
    }, 0);
  const dispatch = useDispatch();
  const openModal = () => {
    dispatch(AppActions.pushModal(ModalTypes.SeeOrderDetailsModal));
  };

  const { event } = useEvent();
  const isSeated = event ? EventUtil.isSeated(event as IEventGraphQL) : true;
  const nonRefundedSeats = order.tickets.map((data) => {
    if (data?.refund?.refunded === false) return data.seat;
  });
  return (
    <>
      <Section title="ORDER">
        {Boolean(order.tickets.length) && (
          <>
            {Object.values(tickets).map((ticket: any, index) => {
              const seats = ticket.seats.filter((seat) =>
                nonRefundedSeats.includes(seat)
              );
              return isSeated && order?.state !== "Canceled" ? (
                <div key={index}>
                  <Flex justify="space-between">
                    <Flex align="center" margin="0px 0px 10px 0px" key={index}>
                      <Icon
                        icon={Icons.TicketRegular}
                        color={Colors.Grey1}
                        size={12}
                        margin="0px 10px 0px 0px"
                      />
                      <ItemText>
                        {`${ticket.count}`}
                        <Multiply>{`${"x"}`}</Multiply>
                        {`${ticket.name}`}
                      </ItemText>
                      <Icon
                        icon={Icons.CheckCircle}
                        color={Colors.Grey5}
                        size={12}
                        margin="0px 0px 0px 10px"
                      />
                    </Flex>
                    {seats.length > 0 && (
                      <TextButton
                        size={TextButtonSizes.Regular}
                        children={
                          showSeats && index === showIndex
                            ? ticket.count > 1
                              ? "Hide Seats"
                              : "Hide Seat"
                            : ticket.count > 1
                              ? "Show Seats"
                              : "Show Seat"
                        }
                        onClick={() => {
                          setShowIndex(index);
                          setShowSeats(!showSeats);
                        }}
                      />
                    )}
                  </Flex>
                  {showSeats && index === showIndex ? (
                    <SeatsList>
                      {seats.map((seat: any) => (
                        <>
                          <Flex>
                            <Icon
                              icon={Icons.SeatingLight}
                              color={Colors.Grey1}
                              size={12}
                              margin="0px 10px 0px 0px"
                            />
                            <Seat>{seat}</Seat>
                          </Flex>
                        </>
                      ))}
                    </SeatsList>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                <div key={index}>
                  <Flex align="center" margin="0px 0px 15px 0px" key={index}>
                    <Icon
                      icon={Icons.TicketRegular}
                      color={Colors.Grey1}
                      size={12}
                      margin="0px 10px 0px 0px"
                    />
                    <ItemText>
                      {`${ticket.count}`}
                      <Multiply>{`${"x"}`}</Multiply>
                      {`${ticket.name}`}
                    </ItemText>
                    <Icon
                      icon={Icons.CheckCircle}
                      color={Colors.Grey5}
                      size={12}
                      margin="0px 0px 0px 10px"
                    />
                  </Flex>
                </div>
              );
            })}
          </>
        )}
        {Boolean(order.upgrades.length) && (
          <>
            {Object.values(upgrades).map((upgrade: any, index) => {
              return (
                <Flex align="center" margin="0px 0px 15px 0px" key={index}>
                  <Icon
                    icon={Icons.UpgradeRegular}
                    color={Colors.Grey1}
                    size={12}
                    margin="0px 10px 0px 0px"
                  />
                  <ItemText>
                    {`${upgrade.count}`}
                    <Multiply>{`${"x"}`}</Multiply>
                    {`${upgrade.name}`}
                  </ItemText>
                  <Icon
                    icon={Icons.CheckCircle}
                    color={Colors.Grey5}
                    size={12}
                    margin="0px 0px 0px 10px"
                  />
                </Flex>
              );
            })}
          </>
        )}
        {/* <SeeDetail>
      <TextButton
        size={TextButtonSizes.Regular}
        children={"see details"}
        onClick={() => openModal()}
      />
      </SeeDetail> */}
        <Flex>
          <ItemTextLight>
            Total Revenue: ${Price.output(ticketsPrice + upgradesPrice, true)}
          </ItemTextLight>
          <ItemTextBold></ItemTextBold>
        </Flex>
      </Section>
    </>
  );
};

const AdditionalInfoSection: React.FC<OrderModalSectionProps> = ({ order }) => {
  const dispatch = useDispatch();
  const checkInModal = () => {
    dispatch(AppActions.pushModal(ModalTypes.AdjustCheckIn));
  };

  const checkIn = order?.tickets.find((ticket) => {
    return (
      ticket?.scan &&
      ticket?.scan.find((scan) => {
        return scan.scanned;
      })
    );
  });

  return (
    <>
      {checkIn && (RolesEnum.ADMIN || RolesEnum.SUPER_USER) && (
        <div style={{ paddingLeft: "20px" }}>
          <TextButton
            size={TextButtonSizes.Regular}
            children="Adjust check-in"
            margin="15px 0px 0px"
            onClick={() => checkInModal()}
          />
        </div>
      )}
      <Section title="ADDITIONAL INFO">
        <Flex margin="0px 0px 15px">
          <ItemTextLight>Order date/time</ItemTextLight>
          <ItemTextBold>
            {Time.format(
              order?.createdAt,
              "ddd, MMM DD, YYYY [at] h:mma",
              order?.event?.venue?.address?.timezone
                ? order?.event?.venue?.address?.timezone
                : undefined
            )}
          </ItemTextBold>
        </Flex>
        <Flex>
          <ItemTextLight>Channel</ItemTextLight>
          <ItemTextBold>Online</ItemTextBold>
        </Flex>
        {order.promotionCode && (
          <Flex margin="15px 0px 0px">
            <ItemTextLight>Promotional Code</ItemTextLight>
            <ItemTextBold>{order.promotionCode}</ItemTextBold>
          </Flex>
        )}
         {order.discountCode && (
          <Flex margin="15px 0px 0px">
            <ItemTextLight>Discount Code</ItemTextLight>
            <ItemTextBold>{order.discountCode}</ItemTextBold>
          </Flex>
        )}
        {/* TODO: Custom Fields */}
      </Section>
    </>
  );
};

const HistorySection: React.FC<OrderModalSectionProps> = ({ order }) => (
  <Section title="HISTORY">
    <div />
  </Section>
);

const ManageOrderSection: React.FC<OrderModalSectionProps> = ({ order }) => {
  const dispatch = useDispatch();

  const orderType = order.event ? VariantEnum.Event : VariantEnum.Season;
  const { printOrder, loading } = usePrintOrder(
    order._id as string,
    (order?.user?.lastName as string) || "Guest",
    orderType,
    PrintedItemOrientationTypes.HorizontalNormal
  );

  const refund = () => {
    dispatch(AppActions.pushModal(ModalTypes.Refund));
  };

  const cancelOrder = () => {
    dispatch(AppActions.pushModal(ModalTypes.CancelOrder));
  };

  const [sendOrderReceiptEmail, { loading: sendOrderReceiptEmailLoading }] =
    useMutation(SEND_ORDER_RECEIPT_EMAIL, {
      variables: {
        orderId: order?._id,
      },
      onError(error) {
        console.error(error);
      },
      onCompleted(data) {
        dispatch(
          AppActions.showNotification(
            "Order confirmation email has been resent successfully.",
            AppNotificationTypeEnum.Success
          )
        );
      },
    });

  const [
    sendSeasonOrderReceiptEmail,
    { loading: sendSeasonOrderReceiptEmailLoading },
  ] = useMutation(SEND_SEASON_ORDER_RECEIPT_EMAIL, {
    variables: {
      orderId: order?._id,
    },
    onError(error) {
      console.error(error);
    },
    onCompleted(data) {
      dispatch(
        AppActions.showNotification(
          "Order confirmation email has been resent successfully.",
          AppNotificationTypeEnum.Success
        )
      );
    },
  });

  return (
    <Section title="MANAGE ORDER" noBottomBorder>
      {
        <Flex margin="15px 0px 0px 0px" align="center">
          <TextButton
            size={TextButtonSizes.Regular}
            children="Print tickets"
            margin="0px 10px 0px 0px"
            onClick={() => {
              if (!loading) {
                printOrder();
              }
            }}
          />
          {loading && (
            <Loader size={LoaderSizes.FuckingTiny} color={Colors.Orange} />
          )}
        </Flex>
      }
      {/* <TextButton
        size={TextButtonSizes.Regular}
        children="Add more items"
        margin="15px 0px 0px"
        onClick={() => console.log('TODO')}
      /> */}
      {order?.user && (
        <Flex margin="15px 0px 0px 0px" align="center">
          <TextButton
            size={TextButtonSizes.Regular}
            children="Resend confirmation/receipt"
            margin="0px 10px 0px 0px"
            onClick={() => {
              if (!sendOrderReceiptEmailLoading && !order?.seasonId) {
                sendOrderReceiptEmail();
              } else {
                sendSeasonOrderReceiptEmail();
              }
            }}
          />
          {sendOrderReceiptEmailLoading && (
            <Loader size={LoaderSizes.FuckingTiny} color={Colors.Orange} />
          )}
        </Flex>
      )}
      {!order?.hidden && !order?.seasonId && (
        <TextButton
          size={TextButtonSizes.Regular}
          children="Refund order"
          margin="15px 0px 0px"
          onClick={() => refund()}
        />
      )}
      {!order?.hidden &&
        !order?.seasonId &&
        order?.state !== OrderStateEnum.Canceled &&
        order?.state !== OrderStateEnum.Refunded && (
          <TextButton
            size={TextButtonSizes.Regular}
            children="Cancel order"
            margin="15px 0px 0px"
            onClick={() => cancelOrder()}
          />
        )}
    </Section>
  );
};

type OrderDetailsModalProps = {};
const OrderDetailsModal: React.FC<OrderDetailsModalProps> = () => {
  const dispatch = useDispatch();

  const orderState = useSelector((state: BackstageState) => state.order);
  const { orderId } = orderState;

  // HANDLE ERROR
  const [getOrder, { data, loading, error }] = useLazyQuery(GET_ORDER, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (orderId) {
      getOrder({
        variables: {
          orderId,
        },
      });
    }
  }, [orderId]);

  const popModal = () => {
    dispatch(OrderActions.setOrderId(""));
    dispatch(AppActions.popModal());
  };

  return (
    <ModalContainer>
      <ModalHeader title="Order" close={() => popModal()} />
      <SubContainer>
        {loading || !data?.order ? (
          <ModalLoadingContainer>
            <Loader size={LoaderSizes.Large} color={Colors.Orange} />
          </ModalLoadingContainer>
        ) : (
          <>
            <CustomerSection order={data?.order} />
            <EventSection order={data?.order} />
            <OrderSection order={data?.order} />
            <AdditionalInfoSection order={data?.order} />
            {/* <HistorySection order={data?.order} /> */}
            <ManageOrderSection order={data?.order} />
          </>
        )}
      </SubContainer>
    </ModalContainer>
  );
};

export default OrderDetailsModal;
