import React from "react";
import styled, { css } from "styled-components";
import { Colors, Icon, Icons } from "@sellout/ui";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import ProgressBar from "../elements/ProgressBar";
import * as Price from "@sellout/utils/.dist/price";
import { useMobileMedia } from "@sellout/ui/build/utils/MediaQuery";
import usePermission from "../hooks/usePermission.hook";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import EventStatus from "./EventStatus";
import AnalyticsUtil from "@sellout/models/.dist/utils/AnalyticsUtil";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";

export enum EventCardTypes {
  Modal = "Modal",
  Standard = "Standard",
}

type ImgProps = {
  src: string;
  footer: boolean;
};

export const ImgDiv = styled.div<ImgProps>`
  background-size: cover;
  background-position: center;
  background-origin: unset;
  background-image: url(${(props) => props.src});
  width: 100%;
  height: 100%;
  transition: all 0.2s;

  ${media.desktop`
    border-radius: ${(props: ImgProps) =>
      props.footer ? "10px 10px 0px 0px" : "10px"};
  `};

  ${media.mobile`
    border-radius: 0px;
  `};
`;

export const InfoContainer = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border-radius: 10px 10px 0px 0px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 10px 15px;
  position: absolute;

  > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const Name = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.White};
`;

export const Flexy = styled.div`
  display: flex;
  align-items: center;
  box-sizing: border-box;
`;

export const Type = styled.div`
  font-weight: 500;
  font-size: 1.2rem;
  color: ${Colors.White};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Subtitle = styled.div`
  font-weight: 600;
  font-size: 1.4rem;
  color: ${Colors.White};
`;

type GradientProps = {
  footer: boolean;
};
export const Gradient = styled.div<GradientProps>`
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0) 49.48%,
    rgba(0, 0, 0, 0.5) 100%
  );
  height: 100%;
  width: 100%;
  border-radius: ${(props) => (props.footer ? "10px 10px 0px 0px" : "10px")};
  position: absolute;
  display: flex;
`;

export const BottomContainer = styled.div`
  height: 60px;
  background: ${Colors.Grey7};
  padding: 15px;
  box-sizing: border-box;
  border: 1px solid ${Colors.Grey5};
  padding: 16px;
  width: 274px;

  ${media.desktop`
    border-radius: 0px 0px 10px 10px;
  `};

  ${media.mobile`
    border-radius: 0;
  `};
`;

export const BottomText = styled.div`
  font-weight: 600;
  font-size: 1.2rem;
  color: ${Colors.Grey2};
`;

export const BottomTextContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

type ContainerProps = {
  margin?: string;
  onClick?: Function;
  footer?: boolean;
  width?: string;
  height?: string;
};

export const ContainerCss = css<ContainerProps>`
  margin: ${(props) => props.margin};
  cursor: ${(props) => (props.onClick ? "pointer" : null)};
  box-sizing: border-box;

  ${media.desktop`
    width: ${(props: ContainerProps) => props.width};
    height: ${(props: ContainerProps) => props.height};
    border-radius: 10px;
    border: ${(props: ContainerProps) =>
      props.footer ? `1px solid ${Colors.Grey5}` : null};
  `};

  ${media.mobile`
    height: ${(props: ContainerProps) => (props.footer ? "280px" : "220px")};
    // width: 100%;
    border-radius: 0px;
    border: 0;
  `};
`;

export const AnimatedContainer = styled.div`
  ${ContainerCss};
  &:hover ${ImgDiv} {
    transform: scale(1.05);
  }
`;

export const UnanimatedContainer = styled.div`
  ${ContainerCss};
`;

type InnerContainerProps = {
  footer: boolean;
  width?: string;
  height?: string;
};

export const InnerContainer = styled.div<InnerContainerProps>`
  height: ${(props) => props.height};
  width: ${(props) => props.width};
  overflow: hidden;
  position: relative;
  display: flex;
  border-radius: ${(props) => (props.footer ? "10px 10px 0px 0px" : "10px")};
`;

const EventStatusContainer = styled.div`
  margin: 16px;
  position: absolute;
`;

export const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
`;

type PropTypes = {
  event: IEventGraphQL;
  onClick?: Function;
  margin?: string;
  footer?: boolean;
  type?: EventCardTypes;
};

const getConfig = (
  type: EventCardTypes | undefined,
  footer: boolean,
  mobile: boolean
) => {
  switch (type) {
    case EventCardTypes.Modal:
      return { height: "210px", width: "100%", innerHeight: "210px" };
    case EventCardTypes.Standard:
      return {
        height: footer ? "250px" : "192px",
        width: "274px",
        innerHeight: "192px",
      };
    default:
      return {
        height: footer ? "250px" : "192px",
        width: "274px",
        innerHeight: "192px",
      };
  }
};

const EventCard: React.FC<PropTypes> = ({
  event,
  onClick,
  margin,
  footer = true,
  type,
}) => {
  /** Hooks */
  const isMobile = useMobileMedia();
  const hasPermission = usePermission();

  /** State */
  const { venue, ticketTypes, analytics } = event;
  const address = venue?.address;
  const venueLocation = `${venue?.name || ""}${
    address ? `, ${address.city}, ${address.state}` : ""
  }`;
  const totalTicketQty = Object.values(ticketTypes as ITicketType[]).reduce(
    (prev, ticket) => {
      return prev + Number(ticket.totalQty);
    },
    0
  );
  const remainingTicketQty = Object.values(ticketTypes as ITicketType[]).reduce(
    (prev, ticket) => {
      return prev + Number(ticket.remainingQty);
    },
    0
  );

  const soldTicketQty = totalTicketQty - remainingTicketQty;
  const percentSold = Math.floor((soldTicketQty / totalTicketQty) * 100) || 0;
  const totalSalesSegment = (analytics as any)?.segments?.[1] ?? false;

  let totalSales: null | number = null;
  if (totalSalesSegment) {
    totalSales = AnalyticsUtil.getTotalValue(totalSalesSegment.coordinates);
  }

  /** Render */
  const Container: any = onClick ? AnimatedContainer : UnanimatedContainer;
  const { width, height, innerHeight } = getConfig(type, footer, isMobile);

  const isRSVP = EventUtil.isRSVP(event);

  return (
    <Container
      margin={margin}
      footer={footer}
      width={width}
      height={height}
      onClick={onClick ? () => onClick() : undefined}
    >
      <InnerContainer footer={footer} width={width} height={innerHeight}>
        <ImgDiv
          footer={footer}
          src={event?.posterImageUrl ? event.posterImageUrl : ""}
        />
        <EventStatusContainer>
          <EventStatus event={event} />
        </EventStatusContainer>
        <Gradient footer={footer}>
          <InfoContainer>
            <Name>{event.name || "Untitled Event"}</Name>
            {event.subtitle && <Subtitle>{event.subtitle}</Subtitle>}
            {venueLocation && (
              <Flexy>
                <IconContainer>
                  <Icon
                    icon={Icons.MapPinLight}
                    size={12}
                    margin="0px 5px 0px 0px"
                    color={Colors.White}
                  />
                </IconContainer>
                <Type>{venueLocation}</Type>
              </Flexy>
            )}
          </InfoContainer>
        </Gradient>
      </InnerContainer>
      {footer && (
        <BottomContainer>
          <BottomTextContainer>
            <BottomText>{`${percentSold}% ${
              isRSVP ? "Claimed" : "Sold"
            }`}</BottomText>
            {hasPermission(RolesEnum.ADMIN) && (
              <BottomText>${Price.output(totalSales, true)}</BottomText>
            )}
          </BottomTextContainer>
          <ProgressBar value={soldTicketQty} maxValue={totalTicketQty} />
        </BottomContainer>
      )}
    </Container>
  );
};

export default EventCard;
