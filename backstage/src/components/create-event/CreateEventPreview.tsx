import React from "react";
import styled from "styled-components";
import { Colors, Icon, Icons } from "@sellout/ui";
import Flex from "@sellout/ui/build/components/Flex";
import * as Polished from "polished";
import * as Time from "@sellout/utils/.dist/time";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import { useSelector } from "react-redux";
import { BackstageState } from "../../redux/store";
import IEvent from "@sellout/models/.dist/interfaces/IEvent";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import Progressbar from "../../elements/ProgressBar";
import * as Price from "@sellout/utils/.dist/price";
import FeeUtil from "@sellout/models/.dist/utils/FeeUtil";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import IEventPromotion from "@sellout/models/.dist/interfaces/IEventPromotion";
import IEventCustomField from "@sellout/models/.dist/interfaces/IEventCustomField";
import IFee, { FeeTypeEnum } from "@sellout/models/.dist/interfaces/IFee";
import EventStatus from "../EventStatus";
import "moment-timezone";
import useEvent from "../../hooks/useEvent.hook";

type ContainerProps = {
  image?: string;
};

const Container = styled.div<ContainerProps>`
  position: relative;
  height: 100%;
  width: 100%;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 41.15%, #000000 100%),
    url(${(props) => props.image});
  background-position: center;
  background-size: cover;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const Overlay = styled.div`
  background-color: ${Polished.rgba(Colors.Black, 0.7)};
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
`;

export const Content = styled.div`
  position: relative;
  background-color: ${Polished.rgba(Colors.White, 0.7)};
  overflow: scroll;
  height: calc(100% - 60px);
  width: 100%;
  margin-top: 60px;
  width: 320px;

  ${media.largeDesktop`
    width: 360px;
    height: calc(100% - 100px);
    border-radius: 10px;
  `}

  ${media.giant`
    max-height: 800px;
  `}
`;

type EventImageProps = {
  image?: string;
};

export const EventImage = styled.div<EventImageProps>`
  position: relative;
  width: 100%;
  height: 222px;
  padding: 15px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 41.15%, #000000 100%),
    url(${(props) => props.image});
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

type GreyBoxProps = {
  children?: string;
};

const GreyBox = styled.div<GreyBoxProps>`
  background-color: ${(props) =>
    props.children ? null : Polished.rgba(Colors.White, 0.5)};
  height: ${(props) => (props.children ? "unset !important" : null)};
  width: ${(props) => (props.children ? "unset !important" : null)};
`;

const EventInfo = styled.div`
  position: relative;
`;

const EventName = styled(GreyBox)`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${Colors.White};
  height: 23px;
  width: 210px;
`;

const EventSubtitle = styled(GreyBox)`
  font-size: 1.4rem;
  font-weight: 600;
  color: ${Colors.White};
  height: 18px;
  width: 110px;
  margin-bottom: 5px;
`;

const EventDetail = styled(GreyBox)`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.White};
  height: 14px;
  width: 180px;
  margin-left: 7px;
`;

type CreateEventPreviewProps = {};

const CreateEventPreview: React.FC<CreateEventPreviewProps> = () => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];
  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venuesCache } = venueState;
  const venueId = event?.venueId as string;
  const venued = venuesCache[venueId];
  const timezone =
    venued && venued.address && venued.address.timezone != ""
      ? venued.address.timezone
      : event?.venue?.address?.timezone;
  if (!event) return null;

  const image = event.posterImageUrl;
  const startDate = Time.format(
    event?.schedule?.startsAt,
    "ddd, MMM Do [at] h:mma",
    timezone
  );

  const venue = (event as any)?.venue;
  const address = venue?.address;
  const venueName = venue?.name;
  const city = address?.city;
  const state = address?.state;

  ///////////////// For Multidays ////////////////

  const performance =
    event?.performances?.[0].schedule && event?.performances?.[0].schedule;

  const firstDay =
    performance &&
    Time.format(performance[0].startsAt, "ddd, MMM Do [at] h:mma", timezone);
  const lastDay =
    performance &&
    Time.format(
      performance[performance.length - 1].endsAt,
      "ddd, MMM Do [at] h:mma",
      timezone
    );

  return (
    <Container image={image}>
      <Overlay />
      <Content>
        <EventImage image={image}>
          <EventStatus event={event} />
          <EventInfo>
            <EventName>{event.name}</EventName>
            {event.subtitle && <EventSubtitle>{event.subtitle}</EventSubtitle>}
            {startDate && (
              <Flex align="center" margin="0 0 5px">
                <Icon
                  icon={Icons.CalendarDayLight}
                  color={Colors.White}
                  size="1.2rem"
                />
                <EventDetail>
                  {event?.isMultipleDays
                    ? firstDay + " - " + lastDay
                    : startDate}
                </EventDetail>
              </Flex>
            )}
            {venue && (
              <Flex align="center">
                <Icon
                  icon={Icons.MapPinLight}
                  color={Colors.White}
                  size="1.2rem"
                />
                <EventDetail>{`${venueName}, ${city}, ${state}`}</EventDetail>
              </Flex>
            )}
          </EventInfo>
        </EventImage>
        <DatesAndTimes event={event} timezone={timezone} />
        <TicketTypes event={event} />
        <UpgradeTypes event={event} />
        <PromotionTypes event={event} />
        <Fees event={event} />
        <CustomFields event={event} />
      </Content>
    </Container>
  );
};

export default CreateEventPreview;

const CardContainer = styled.div`
  background-color: ${Colors.White};
  margin-bottom: 10px;
`;

type CardProps = {
  title: string;
  icon: any;
  iconSize?: string;
  children: React.ReactNode;
};

const Card = React.memo(({ title, icon, iconSize, children }: CardProps) => {
  return (
    <CardContainer>
      <CardHeader>
        <Icon icon={icon} color={Colors.Grey1} size={iconSize} />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {children}
    </CardContainer>
  );
});

const CardHeader = styled.div`
  position: relative;
  height: 40px;
  padding: 0 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px solid ${Colors.Grey6};
`;

const CardTitle = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${Colors.Grey1};
  margin-left: 7px;
`;

const CardBody = styled.div`
  position: relative;
  padding: 20px;
`;

const CardSection = styled.div`
  position: relative;
  padding: 20px;
  border-bottom: 1px solid ${Colors.Grey6};
`;

type SectionTitleProps = {
  large?: boolean;
  smallMargin?: boolean;
};

const SectionTitle = styled.div<SectionTitleProps>`
  font-size: ${(props) => (props.large ? "1.8rem" : "1.4rem")};
  margin: ${(props) => (props.smallMargin ? "0 0 5px" : "0 0 20px")};
  font-weight: 600;
  color: ${Colors.Grey1};
`;

const Text = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${Colors.Grey2};
`;

type DateTextProps = {
  margin?: boolean;
};

const DateText = styled.div<DateTextProps>`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-bottom: ${(props) => (props.margin ? "20px" : "0px")};
`;

type TypeTextProps = {
  margin?: boolean;
};

const TypeText = styled.div<TypeTextProps>`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-bottom: ${(props) => (props.margin ? "20px" : "5px")};
`;

const EventDays = styled.div``;

type PreviewItemProps = {
  event?: IEvent;
  timezone?: string;
};

const DatesAndTimes = React.memo(({ event, timezone }: PreviewItemProps) => {
  const performance =
    event?.performances?.[0].schedule && event?.performances?.[0].schedule;

  const format = (timestamp) => {
    const local = Time.convertToLocal(timestamp, timezone);
    return Time.formatWithoutTz(local * 1000, "ddd, MMM Do [at] h:mma");
  };

  const ticketsAt = format(event?.schedule?.ticketsAt);
  const announcedAt = format(event?.schedule?.announceAt);

  return (
    <Card title="Dates & Times" icon={Icons.CalendarDaySolid} iconSize="1.2rem">
      <CardBody>
        <SectionTitle smallMargin>Event</SectionTitle>
        {performance &&
          performance.map((a, i) => {
            return (
              <EventDays key={i}>
                <DateText>{format(a.startsAt)}</DateText>
                <DateText margin> Doors at {format(a.doorsAt)}</DateText>{" "}
              </EventDays>
            );
          })}
        <SectionTitle smallMargin>Announcement</SectionTitle>
        <DateText>{announcedAt}</DateText>
        <SectionTitle smallMargin>On Sale</SectionTitle>
        <DateText margin>{ticketsAt}</DateText>
      </CardBody>
    </Card>
  );
});

const TicketTypes = React.memo(({ event }: PreviewItemProps) => {
  const ticketTypes = event?.ticketTypes;
  if (!ticketTypes || !ticketTypes.length) return null;
  return (
    <Card title="Tickets" icon={Icons.TicketSolid} iconSize="1.2rem">
      {ticketTypes?.map((ticketType: ITicketType) => {
        const sold = ticketType.totalQty - ticketType.remainingQty;
        return (
          <CardSection key={ticketType._id}>
            <SectionTitle large>{ticketType.name}</SectionTitle>
            <Flex align="center" justify="space-between" margin="0 0 10px">
              <Text>
                {sold}/{ticketType.totalQty}&nbsp;sold
              </Text>
              <Text>${Price.output(ticketType.tiers[0].price, true)}</Text>
            </Flex>
            <Progressbar value={sold} maxValue={ticketType.totalQty} />
          </CardSection>
        );
      })}
    </Card>
  );
});

const UpgradeTypes = React.memo(({ event }: PreviewItemProps) => {
  const upgrades = event?.upgrades;
  if (!upgrades || !upgrades.length) return null;
  return (
    <Card title="Upgrades" icon={Icons.UpgradeSolid} iconSize="1.2rem">
      {upgrades?.map((upgradeType: IEventUpgrade) => {
        const sold = upgradeType.totalQty - upgradeType.remainingQty;
        return (
          <CardSection key={upgradeType._id}>
            <SectionTitle large>{upgradeType.name}</SectionTitle>
            <Flex align="center" justify="space-between" margin="0 0 10px">
              <Text>
                {sold}/{upgradeType.totalQty}&nbsp;used
              </Text>
              <Text>${Price.output(upgradeType.price, true)}</Text>
            </Flex>
            <Progressbar value={sold} maxValue={upgradeType.totalQty} />
          </CardSection>
        );
      })}
    </Card>
  );
});

const PromotionTypes = React.memo(({ event }: PreviewItemProps) => {
  const promotions = event?.promotions;
  if (!promotions || !promotions.length) return null;
  return (
    <Card title="Secret Codes" icon={Icons.KeySolid} iconSize="1.2rem">
      {promotions?.map((promotionType: IEventPromotion) => {
        const sold = promotionType.totalQty - promotionType.remainingQty;
        return (
          <CardSection key={promotionType._id}>
            <SectionTitle large smallMargin>
              {promotionType.code}
            </SectionTitle>
            <TypeText margin>{promotionType.type}&nbsp;code</TypeText>
            <Flex align="center" justify="space-between" margin="0 0 10px">
              <Text>
                {sold}/{promotionType.totalQty}&nbsp;used
              </Text>
            </Flex>
            <Progressbar value={sold} maxValue={promotionType.totalQty} />
          </CardSection>
        );
      })}
    </Card>
  );
});

const Fees = React.memo(({  }: PreviewItemProps) => {
  const { event } = useEvent();
  const fees = FeeUtil.promoterFees((event as any).fees);
  if (!fees || !fees.length) return null;
  return (
    <Card title="Fees" icon={Icons.FeeSolid} iconSize="1.2rem">
      {fees?.map((eventFee: IFee) => {
        return (
          <CardSection key={eventFee._id}>
            <SectionTitle large smallMargin>
              {eventFee.name}
            </SectionTitle>
            <TypeText>
              {eventFee.type === FeeTypeEnum.Flat
                ? `$${Price.output(eventFee.value, true)}`
                : `${eventFee.value.toFixed(2)}%`}
              /ticket
            </TypeText>
          </CardSection>
        );
      })}
    </Card>
  );
});

const CustomFields = React.memo(({ event }: PreviewItemProps) => {
  const customFields = event?.customFields;
  if (!customFields || !customFields.length) return null;
  return (
    <Card title="Survey Questions" icon={Icons.KeySolid} iconSize="1.2rem">
      {customFields?.map((customField: IEventCustomField) => {
        return (
          <CardSection key={customField._id}>
            <SectionTitle large smallMargin>
              {customField.label}
            </SectionTitle>
            <TypeText>{customField.type}&nbsp;question</TypeText>
          </CardSection>
        );
      })}
    </Card>
  );
});
