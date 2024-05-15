import React, { Fragment, useEffect } from "react";
import styled from "styled-components";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import Masonry from "react-masonry-component";
import EventCard from "../components/EventCard";
import PageLoader from "../components/PageLoader";
import useNavigateToEventDetails from "../hooks/useNavigateToEventDetails.hook";
import useListEventsHook from "../hooks/useListEvents.hook";
import NoPageContent, { NoPageContentTypes } from "../components/NoPageContent";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import usePermission from "../hooks/usePermission.hook";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import * as AppActions from "../redux/actions/app.actions";
import { PaddedPage } from "../components/PageLayout";
import { Colors } from "@sellout/ui";
import useNavigateToCreateEvent from "../hooks/useNavigateToCreateEvent.hook";
import { EventQueryEnum } from "../models/enums/EventQueryEnum";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import { useLocation } from "react-router";

const SubNavContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
`;

type SubNavItemProps = {
  active: boolean;
};
const SubNavItem = styled.div<SubNavItemProps>`
  transition: all 0.2s;
  color: ${(props) => (props.active ? `${Colors.Grey1}` : `${Colors.Grey4}`)};
  font-weight: 600;
  font-size: 1.8rem;
  cursor: pointer;
  margin-right: 24px;
`;

type EventListProps = {
  match: any;
};

const EventList: React.FC<EventListProps> = () => {
  /* Hooks */
  const location = useLocation();
  const dispatch = useDispatch();
  const hasPermission = usePermission();
  const navigateToEventDetails = useNavigateToEventDetails();
  const navigateToCreateEvent = useNavigateToCreateEvent();
  const params: any = new URLSearchParams(location.search);
  const [queryKey, setQueryKey] = React.useState(
    EventQueryEnum.MainEventListUpComing
  );
  const { eventQueryHash } = useSelector((state: BackstageState) => state.app);
  const query = eventQueryHash[queryKey];
  const isPastEvents = queryKey === EventQueryEnum.MainEventListPast;
  const { events, loading } = useListEventsHook({
    variables: {
      query,
    },
  });

  /** State */
  const showScannerNotification = () =>
    dispatch(
      AppActions.showNotification(
        "Web scanning coming soon. Please download the 'Sellout Access Control' app in the ios store or google play store from your phone in order to scan tickets.",
        AppNotificationTypeEnum.Warning
      )
    );
  const isScanner = hasPermission && !hasPermission(RolesEnum.BOX_OFFICE);

  // when we do filtering we should add an ordering (asc or desc) params to the query to take care of this
  const sortEvents = (events: IEventGraphQL[]) => {
    return isPastEvents
      ? events.sort(
          (a, b) =>
            (b?.schedule?.startsAt as number) -
            (a?.schedule?.startsAt as number)
        )
      : events.sort(
          (a, b) =>
            (a?.schedule?.startsAt as number) -
            (b?.schedule?.startsAt as number)
        );
  };

  useEffect(() => {
    if (EventQueryEnum[params.get("type")]) {
      setQueryKey(params.get("type"));
    }
  }, [params.get("type")]);

  /* Render */
  return (
    <Fragment>
      <PageLoader nav={true} fade={Boolean(!loading)} />
      <PaddedPage>
        <SubNavContainer>
          <SubNavItem
            onClick={() => setQueryKey(EventQueryEnum.MainEventListUpComing)}
            active={EventQueryEnum.MainEventListUpComing === queryKey}
          >
            Upcoming
          </SubNavItem>
          <SubNavItem
            onClick={() => setQueryKey(EventQueryEnum.MainEventListPast)}
            active={EventQueryEnum.MainEventListPast === queryKey}
          >
            Past
          </SubNavItem>
          <SubNavItem
            onClick={() => setQueryKey(EventQueryEnum.MainEventListCancelled)}
            active={EventQueryEnum.MainEventListCancelled === queryKey}
          >
            Cancelled
          </SubNavItem>
        </SubNavContainer>
        {events && events.length > 0 && !loading ? (
          <Masonry options={{ horizontalOrder: true }} enableResizableChildren>
            {sortEvents(events)?.map((event: IEventGraphQL) => {
              return (
                <Fragment key={event._id}>
                  {!event.cancel &&
                    EventQueryEnum.MainEventListUpComing === queryKey && (
                      <EventCard
                        key={event._id}
                        event={event}
                        margin="0 24px 24px 0"
                        onClick={() => {
                          if (isScanner) {
                            showScannerNotification();
                          } else if (event?.published) {
                            navigateToEventDetails(event._id);
                          } else {
                            navigateToCreateEvent(event._id);
                          }
                        }}
                      />
                    )}
                  {!event.cancel &&
                    EventQueryEnum.MainEventListPast === queryKey && (
                      <EventCard
                        key={event._id}
                        event={event}
                        margin="0 24px 24px 0"
                        onClick={() => {
                          if (isScanner) {
                            showScannerNotification();
                          } else if (event?.published) {
                            navigateToEventDetails(event._id);
                          } else {
                            navigateToCreateEvent(event._id);
                          }
                        }}
                      />
                    )}
                  {event.cancel &&
                    EventQueryEnum.MainEventListCancelled === queryKey && (
                      <EventCard
                        key={event._id}
                        event={event}
                        margin="0 24px 24px 0"
                        onClick={() => {
                          if (isScanner) {
                            showScannerNotification();
                          } else if (event?.published) {
                            navigateToEventDetails(event._id);
                          } else {
                            navigateToCreateEvent(event._id);
                          }
                        }}
                      />
                    )}
                </Fragment>
              );
            })}
          </Masonry>
        ) : (
          <>{!loading && <NoPageContent type={NoPageContentTypes.Event} />}</>
        )}
      </PaddedPage>
    </Fragment>
  );
};

export default EventList;
