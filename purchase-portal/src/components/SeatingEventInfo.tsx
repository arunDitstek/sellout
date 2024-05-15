import React from "react";
import styled from "styled-components";
import moment from "moment";
import { Colors } from "@sellout/ui/build/Colors";
import * as Time from "@sellout/utils/.dist/time";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import * as Polished from "polished";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import Icon, { Icons } from "@sellout/ui/build/components/Icon";

type ContainerProps = {
  image: string;
};

const Container = styled.div<ContainerProps>`
  position: absolute;
  top: 0px;
  /* z-index: 1000; */
  display: flex;
  align-items: flex-end;
  width: calc(100% - 40px);
  background-image: url(${(props) => props.image});
  background-size: cover;
  background-position: center;
  background-origin: unset;
  padding: 0 20px 0;
  height: 120px;
  z-index: 10000;

  ${media.tablet`
    border-radius: 15px 15px 0 0;
  `};

  /* ${media.largeDesktop`
    padding: 20px 20px 70px;
    height: 195px;
  `}; */
`;

const Info = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: column;
  min-width: 0;
  z-index: 1000;

  > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const Gradient = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4));
  
  /* ${media.largeDesktop`
    background: linear-gradient(180deg, rgba(0, 0, 0, 0) 38.95%, rgba(0, 0, 0, 0.5) 100%);
  `}; */
`;

const Name = styled.div`
  font-size: 1.8rem;
  color: ${Colors.White};
  font-weight: 600;
`;

const Subtitle = styled.div`
  font-size: 1.4rem;
  color: ${Colors.White};
  margin-bottom: 3px;
  font-weight: 600;
`;

const InfoText = styled.div`
  font-size: 1.2rem;
  color: ${Colors.White};
`;

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const IconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  margin-right: 8px;
`;

type EventInfoProps = {
  event: Required<IEventGraphQL>;
};

const EventInfo: React.FC<EventInfoProps> = ({ event }) => {
  /** State **/
  const startsAt = moment(Time.date(event?.schedule?.startsAt)).format(
    "ddd, MMM D [at] h:mmA"
  );
  const {
    venue: { address },
  } = event;
  const location = `${address?.city}, ${address?.state}`;

  /** Render **/
  return (
    <Container image={event.posterImageUrl}>
      <Gradient />
      <Info>
        <Name>{event.name || "Unnamed Event"}</Name>
        {event.subtitle && <Subtitle>{event.subtitle}</Subtitle>}
        <Row>
          <IconContainer>
            <Icon
              icon={Icons.CalendarDayLight}
              color={Colors.White}
              size={12}
            />
          </IconContainer>
          <InfoText>{startsAt}</InfoText>
        </Row>
        <Row>
          <IconContainer>
            <Icon icon={Icons.MapPinLight} color={Colors.White} size={12} />
          </IconContainer>
          <InfoText>
            {event.venue && event.venue.name
              ? event.venue.name
              : "Unknown Venue"}
          </InfoText>
        </Row>
      </Info>
    </Container>
  );
};

export default EventInfo;
