import React from 'react';
import styled from 'styled-components';
import moment from 'moment';
import { Colors, Icon, Icons, Flex } from '@sellout/ui';

const InfoContainer = styled.div`
  position: absolute;
  padding: 10px;
  align-self: flex-end;
  width: inherit;
  > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
type EventImageProps = {
  radius: string;
};
const EventImage = styled.img<EventImageProps>`
  width: 100%;
  border-radius: ${props => props.radius || '5px'};
  transition: all .5s;
  height: 100%;
`;
type EventImageDivProps = {
  src: any;
  radius: string;
};
const EventImageDiv = styled.div<EventImageDivProps>`
  background-image: ${props => `url(${props.src})`};
  background-size: cover;
  background-position: center;
  background-origin: unset;
  height: 320px;
  width: 100%;
  border-radius: ${props => props.radius || '5px'};
`;

const EventTitle = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.White};
  line-height: 21px;
`;

const EventSubtitle = styled.div`
  font-size: 1.4rem;
  color: ${Colors.White};
  line-height: 16px;
`;

const EventDate = styled.div`
  font-size: 1rem;
  color: ${Colors.White};
  margin-right: 10px;
`;

const EventVenue = styled.div`
  font-size: 1rem;
  color: ${Colors.White};
`;

const GradientLayer = styled.div`
  background: linear-gradient(rgba(0,0,0,0), rgba(4,4,54,1) 130%);
  height: 100%;
  width: 100%;
  position: absolute;
  display: flex;
`;
type ContainerProps = {
  width: any;
  radius: string;
  isModal: any;
  animation: any;
};
const Container = styled.div<ContainerProps>`
  position: relative;
  width: 100%;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: ${props => props.radius || '5px'};
  overflow: hidden;
  display: flex;

  @media screen and (min-width: 768px) {
    width: ${props => (props.isModal ? props.width : '320px')};
  }

  &:hover ${EventImage} {
    cursor: pointer;
    transform: ${props => (props.animation ? 'scale(1.05)' : null)};
  }
`;

type PropTypes = {
  event: any, animation?: any, radius?: any, width?: any, isModal?: any,
};
const UserEventPreview: React.FC<PropTypes> = ({
  event, animation, radius, width, isModal,
}) => {
  const { venue, performances } = event;
  const timezone = event?.venue?.address?.timezone
  const startsAt = moment(event?.schedule?.startsAt as number * 1000).format('ddd, MMM DD, YYYY');
  ///////////////// For Multidays ////////////////
  const firstDay = moment(event?.schedule?.startsAt as number * 1000).format('ddd, MMM DD, YYYY');
  const lastDay = moment(event?.schedule?.endsAt as number * 1000).format('ddd, MMM DD, YYYY');

  return (
    <Container radius={radius} width={width} isModal={isModal} animation={animation}>
      {isModal
        ? <EventImageDiv src={event.posterImageUrl} radius={radius} />
        : <EventImage src={event.posterImageUrl} radius={radius} />}
      <GradientLayer>
        <InfoContainer>
          <EventTitle>{event.name || 'No Event Name'}</EventTitle>
          {event.subtitle && <EventSubtitle>{event.subtitle}</EventSubtitle>}
          <Flex align="flex-end">
            <Icon
              icon={Icons.CalendarDayLight}
              color={Colors.White}
              size={12}
              margin="0 3px 0 0"
              top="2px"
            />
            {/* <EventDate>{eventDate || 'No Event Date'} at {eventTime || 'No Event Time'}</EventDate> */}
            <EventDate>{event?.isMultipleDays ? (firstDay + " - " + lastDay) : startsAt}</EventDate>
            <Icon
              icon={Icons.MapPinLight}
              color={Colors.White}
              size={12}
              margin="0 3px 0 0"
              top="2px"
            />
            <EventVenue>{venue.name || 'No Venue'}</EventVenue>
          </Flex>
        </InfoContainer>
      </GradientLayer>
    </Container>
  );
};

export default UserEventPreview;
