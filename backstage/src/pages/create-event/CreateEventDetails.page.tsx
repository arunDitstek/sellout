import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import { Colors, Flex, Icon, Icons } from "@sellout/ui";
import SelectEventProcessAs from "../../components/create-event/SelectEventProcessAs";
import SelectEventArtists from "../../components/create-event/SelectEventArtists";
import CreateEventName from "../../components/create-event/CreateEventName";
import CreateEventSubtitle from "../../components/create-event/CreateEventSubtitle";
import CreateEventDescription from "../../components/create-event/CreateEventDescription";
import SelectEventPosterImage from "../../components/create-event/SelectEventPosterImage";
import CreateEventAge from "../../components/create-event/CreateEventAge";
import CreateEventAddSeason from "../../components/create-event/CreateEventAddSeason";
import CreateEventTaxDeduction from "../../components/create-event/CreateEventTaxDeduction";
import CreateEventSongLink from "../../components/create-event/CreateEventSongLink";
import CreateEventVideoLink from "../../components/create-event/CreateEventVideoLink";
import CreateEventTegIntegeration from "../../components/create-event/CreateEventTegIntegeration";
import CreateEventSaveButton from "../../components/create-event/CreateEventSaveButton";
import IPerformance from "@sellout/models/.dist/interfaces/IPerformance";
import SelectEventVenue from "../../components/create-event/SelectEventVenue";
import BooleanInput from "../../elements/BooleanInput";
import SelectEventSeatingChart from "../../components/create-event/SelectEventSeatingChart";
import {
  EventTypeEnum,
  EventProcessAsEnum,
} from "@sellout/models/.dist/interfaces/IEvent";
import {
  Container,
  Content,
  Title,
  TitleContainer,
  Subtitle,
  Spacer,
} from "../../components/create-flow/CreateFlowStyles";
import * as AppActions from "../../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import { VariantEnum } from "../../../src/models/enums/VariantEnum";
import { useQuery } from "@apollo/react-hooks";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";
import CreateEventUrlStub from "../../components/create-event/CreateEventUrlStub";

type CreateEventDetailsProps = {
  match: any;
};

const CreateEventDetails: React.FC<CreateEventDetailsProps> = ({ match }) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];
  const [hasSeating, setHasSeating] = React.useState(
    Boolean(event?.seatingChartKey)
  );
  const { data } = useQuery(GET_PROFILE);
  const performance: IPerformance = event?.performances?.[0] as IPerformance;

  /* Actions */
  const dispatch = useDispatch();

  const clearEventSeatingChartFields = () =>
    dispatch(EventActions.clearEventSeatingChartFields(eventId));

  const addHeadliningArtist = (artistId: string) => {
    dispatch(
      EventActions.addPerformanceHeadliningArtist(
        eventId,
        performance._id as string,
        artistId
      )
    );
  };

  const removeHeadliningArtist = (artistId: string) => {
    dispatch(
      EventActions.removePerformanceHeadliningArtist(
        eventId,
        performance._id as string,
        artistId
      )
    );
  };

  const addOpeningArtist = (artistId: string) => {
    dispatch(
      EventActions.addPerformanceOpeningArtist(
        eventId,
        performance._id as string,
        artistId
      )
    );
  };

  const removeOpeningArtist = (artistId: string) => {
    dispatch(
      EventActions.removePerformanceOpeningArtist(
        eventId,
        performance._id as string,
        artistId
      )
    );
  };

  const setEventPublishable = (publishOnSelloutIO) => {
    dispatch(
      EventActions.setEventPublishable(eventId, publishOnSelloutIO as boolean)
    );
  };

  const showNotification = (message: string) =>
    dispatch(
      AppActions.showNotification(message, AppNotificationTypeEnum.Error)
    );

  const onEventSeated = () => {
    if (event?.hasOrders) {
      showNotification(
        "This field cannot be changed once orders have been created. Please contact support with questions or comments."
      );
      return;
    } else if (hasSeating) {
      clearEventSeatingChartFields();
    }
    if (!event?.isMultipleDays) {
      setHasSeating(!hasSeating);
    } else {
      showNotification("Sellout does not yet support seated multi-day events.");
    }
  };

  useEffect(() => {
    if (!event?.publishable) {
      dispatch(EventActions.setEventStubLink(eventId, ""));
    }
  }, [event?.publishable]);

  return (
    <Container>
      <Content>
        <TitleContainer>
          <Flex align="center">
            <Title>Basic info</Title>
            <Icon
              icon={Icons.HelpSolid}
              size={18}
              top="3px"
              color={Colors.Grey5}
              margin="0 0 0 8px"
              onClick={() =>
                window.open(
                  "https://help.sellout.io/en/articles/4434081-entering-basic-info",
                  "_blank"
                )
              }
            />
          </Flex>
          <Subtitle>
            Let's get started! Give us the basic heads up information about this
            event.
          </Subtitle>
        </TitleContainer>
        {/* <CreateEventSwitchType />
        <Spacer /> */}
        <SelectEventProcessAs />
        <Spacer />
        <CreateEventName type={VariantEnum.Event} />
        <Spacer />
        <CreateEventSubtitle type={VariantEnum.Event} />
        <Spacer />
        <CreateEventAddSeason />
        <Spacer />
        <SelectEventVenue type={VariantEnum.Event} />
        <Spacer />
        {event?.venueId && !event?.seasonId && (
          <>
            <BooleanInput
              active={hasSeating}
              onChange={() => onEventSeated()}
              label="Is this event seated?"
            />
            <Spacer />
          </>
        )}

        {event?.venueId && event?.seasonId && (
          <>
            <Subtitle>
              This event is seated and will use the seating chart of the
              selected season.
            </Subtitle>
            <Spacer />
          </>
        )}

        {hasSeating && (
          <React.Fragment>
            <SelectEventSeatingChart />
            <Spacer />
          </React.Fragment>
        )}
        {event?.type === EventTypeEnum.Concert && (
          <>
            <SelectEventArtists
              artistIds={performance?.headliningArtistIds || []}
              addArtist={addHeadliningArtist}
              removeArtist={removeHeadliningArtist}
              isHeadlining={true}
              label="Headlining artists"
              eventId={eventId}
            />
            <Spacer />
            <SelectEventArtists
              artistIds={performance?.openingArtistIds || []}
              addArtist={addOpeningArtist}
              removeArtist={removeOpeningArtist}
              isHeadlining={false}
              label="Opening artists"
              subLabel="(optional)"
              eventId={eventId}
            />
            <Spacer />
          </>
        )}
        <SelectEventPosterImage type={VariantEnum.Event} />
        <Spacer />
        {event?.processAs === EventProcessAsEnum.Paid && (
          <>
            {" "}
            <CreateEventTaxDeduction />
            <Spacer />{" "}
          </>
        )}
        <CreateEventDescription type={VariantEnum.Event} />
        <Spacer />
        <CreateEventAge type={VariantEnum.Event} />
        {data?.organization?.isTegIntegration && (
          <>
            <Spacer />
            <CreateEventTegIntegeration type={VariantEnum.Event} />
          </>
        )}
        <Spacer />
        <CreateEventVideoLink type={VariantEnum.Event} />
        <Spacer />
        <CreateEventSongLink type={VariantEnum.Event} />
        <Spacer />
        <BooleanInput
          active={event?.publishable as boolean}
          labelOn={"ON"}
          labelOff={"OFF"}
          onChange={() => setEventPublishable(!event?.publishable)}
          label="Publish on Sellout.io website?"
        />
        <Spacer />
        {event?.publishable && <CreateEventUrlStub />}
        <Spacer />
        <CreateEventSaveButton event={event} />
        <Spacer />
      </Content>
    </Container>
  );
};

export default CreateEventDetails;
