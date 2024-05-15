import React from "react";
import moment from "moment";
import styled from "styled-components";
import IEvent from "@sellout/models/.dist/interfaces/IEvent";
import IOrder, {
  IEventGraphQL,
  ISeasonGraphQL,
} from "@sellout/models/.dist/interfaces/IOrder";
import useNavigateToEventDetails from "../hooks/useNavigateToEventDetails.hook";
import { Colors, Icons, Icon } from "@sellout/ui";
import ProgressCircle from "./ProgressCircle";
import EventStatus from "./EventStatus";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import OrderStatus from "./OrderStatus";

type ImgDivProps = {
  src: string | undefined;
};

type ContentDivProps = {
  showProgressCircle: boolean | false;
};

const ImgDiv = styled.div<ImgDivProps>`
  background-size: cover;
  background-position: center;
  background-origin: unset;
  background-image: url(${(props) => props.src});
  width: 120px;
  min-width: 120px;
  height: 80px;
  border-radius: 10px;
  transition: all 0.2s;
`;

const ImgContainer = styled.div`
  width: 120px;
  min-width: 120px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
`;

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;

  &:hover ${ImgDiv} {
    transform: scale(1.05);
  }
`;

const Content = styled.div<ContentDivProps>`
  display: flex;
  align-items: center;
  position: relative;
  width: 85%;
  min-width: ${(props) => (props.showProgressCircle ? "80%" : "100%")};
`;

const InfoContainer = styled.div`
  width: 100%;
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

const Name = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.Grey1};
`;

// const Flexy = styled.div`
//   display: flex;
//   align-items: center;
//   box-sizing: border-box;

//   > div {
//     white-space: nowrap;
//     overflow: hidden;
//     text-overflow: ellipsis;
//   }
// `;

const Type = styled.div`
  font-weight: 500;
  font-size: 1.2rem;
  color: ${Colors.Grey2};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Subtitle = styled.div`
  font-weight: 600;
  font-size: 1.4rem;
  color: ${Colors.Grey1};
`;

const EventStatusContainer = styled.div`
  position: absolute;
  top: 6px;
  left: 6px;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  line-height: 2rem;

  * {
    line-height: 2rem;
  }
`;

type EventPreviewProps = {
  event?: any;
  showProgressCircle?: boolean;
  onClick?: Function | null;
  order?: IOrder;
  showOrderStatus?: boolean | false;
};

const EventPreview: React.FC<EventPreviewProps> = ({
  event,
  showProgressCircle,
  onClick,
  order,
  showOrderStatus,
}) => {
  /* Hooks */
  const navigateToEventDetails = useNavigateToEventDetails();

  /* Render */
  let percentSold = 0;
  if (showProgressCircle) {
    const totalTicketQty = Object.values(
      event?.ticketTypes as ITicketType[]
    ).reduce((prev, ticket) => {
      return prev + Number(ticket.totalQty);
    }, 0);
    const remainingTicketQty = Object.values(
      event?.ticketTypes as ITicketType[]
    ).reduce((prev, ticket) => {
      return prev + Number(ticket.remainingQty);
    }, 0);
    const soldTicketQty = totalTicketQty - remainingTicketQty;
    percentSold = Math.floor((soldTicketQty / totalTicketQty) * 100) || 0;
  }

  const startsAt = moment((event?.schedule?.startsAt as number) * 1000).format(
    "ddd, MMM DD, YYYY"
  );

  ///////////////// For Multidays ////////////////
  const firstDay = moment((event?.schedule?.startsAt as number) * 1000).format(
    "ddd, MMM DD, YYYY"
  );
  const lastDay = moment((event?.schedule?.endsAt as number) * 1000).format(
    "ddd, MMM DD, YYYY"
  );

  const address = event?.venue?.address;
  const venueLocation = `${event?.venue?.name || ""}${
    address ? `, ${address.city}, ${address.state}` : ""
  }`;

  return (
    <Container
      onClick={() => (onClick ? onClick() : navigateToEventDetails(event?._id))}
    >
      <Content showProgressCircle={showProgressCircle ? true : false}>
        <ImgContainer>
          <ImgDiv src={event?.posterImageUrl} />
        </ImgContainer>
        <EventStatusContainer>
          {showOrderStatus ? (
            <OrderStatus order={order} margin="-2px 0 0 0" orderDetailModal />
          ) : (
            <EventStatus event={event as any} />
          )}
        </EventStatusContainer>
        <InfoContainer>
          <Name>{event?.name}</Name>
          {event?.subtitle && <Subtitle>{event?.subtitle}</Subtitle>}
          <Row>
            <IconContainer>
              <Icon
                icon={Icons.CalendarDayLight}
                size={12}
                margin="0px 5px 0px 0px"
                color={Colors.Grey2}
              />
            </IconContainer>
            <Type>
              {event?.isMultipleDays ? firstDay + " - " + lastDay : startsAt}
            </Type>
          </Row>
          {venueLocation && (
            <Row>
              <IconContainer>
                <Icon
                  icon={Icons.MapPinLight}
                  size={12}
                  margin="0px 5px 0px 0px"
                  color={Colors.Grey2}
                />
              </IconContainer>
              {<Type>{venueLocation}</Type>}
            </Row>
          )}
        </InfoContainer>
      </Content>
      {showProgressCircle && <ProgressCircle percentage={percentSold} />}
    </Container>
  );
};

export default EventPreview;
