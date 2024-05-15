import React, { Fragment } from "react";
import styled from "styled-components";
import EventOverview from "../pages/EventOverview.page";
import EventMetrics from "../pages/EventMetrics.page";
import EventOrders from "../pages/EventOrders.page";
import EventSharing from "../pages/EventSharing.page";
import EventReports from "../pages/EventReports.page";
import SubSideNavigation from "../components/SubSideNavigation";
import EventSideNavButtons from "../components/EventSideNavButtons";
import EventCard from "../components/EventCard";
import PageLoader from "../components/PageLoader";
import { Colors, Icons, Icon } from "@sellout/ui";
import useEvent from "../hooks/useEvent.hook";
import * as Checkout from "../utils/Checkout";
import { DetailsContainer } from "../components/PageLayout";
import { AuthenticatedRoute } from "../App";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";
import { useSelector } from "react-redux";
import { BackstageState } from "../redux/store";
import { EventQueryEnum } from "../models/enums/EventQueryEnum";
import TicketHolds from "../pages/TicketHolds.page";
import WaitList from "../pages/EventWaitList.Page";

const MainActionsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0px 16px;
`;

type MainActionItemProps = {
  margin?: string;
};

const MainActionItem = styled.div<MainActionItemProps>`
  color: ${Colors.Grey2};
  font-size: 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 7px 0px;
  width: 55px;
  border-radius: 10px;

  &:hover {
    background: ${Colors.Grey6};
  }
`;

type EventDetailsContainerProps = {
  match: any;
};

const EventDetailsContainer: React.FC<EventDetailsContainerProps> = ({
  match,
}) => {
  /* Hooks */
  const { event, eventId } = useEvent();
  React.useLayoutEffect(() => {
    Checkout.preload(eventId, "");
  }, []);

  const { eventQueryHash } = useSelector((state: BackstageState) => state.app);
  const eventDate: any =
    eventQueryHash[EventQueryEnum.MainEventListPast].endDate;
  const isPastEvents: any = ((event?.schedule?.endsAt as any) <
    eventDate) as any;
  /* Render */
  return (
    <Fragment>
      <PageLoader nav={true} fade={Boolean(event)} />
      {event && (
        <DetailsContainer>
          <SubSideNavigation>
            <EventCard event={event} margin="0 0 16px 0" footer={false} />
            {!event.cancel && !isPastEvents && (
              <MainActionsContainer>
                <MainActionItem
                  onClick={() => {
                    Checkout.open(
                      eventId,
                      "",
                      EPurchasePortalModes.BoxOffice,
                      false,
                    );
                  }}
                >
                  <Icon
                    icon={Icons.BoxOfficeLight}
                    color={Colors.Grey2}
                    margin="0px 0px 5px 0px"
                    size={18}
                  />
                  <div>Sell</div>
                </MainActionItem>
                <MainActionItem
                  margin="0px 15px"
                  onClick={() => {
                    Checkout.open(
                      eventId,
                      "",
                      EPurchasePortalModes.BoxOffice,
                      true,
                    );
                  }}
                >
                  <Icon
                    icon={Icons.GiftLight}
                    color={Colors.Grey2}
                    margin="0px 0px 5px 0px"
                    size={18}
                  />
                  <div>Comp</div>
                </MainActionItem>
                <MainActionItem>
                  <Icon
                    icon={Icons.Scan}
                    color={Colors.Grey2}
                    margin="0px 0px 5px 0px"
                    size={18}
                  />
                  <div>Scan</div>
                </MainActionItem>
              </MainActionsContainer>
            )}
            <EventSideNavButtons />
          </SubSideNavigation>
          <>
            <AuthenticatedRoute
              path={`${match.url}/overview`}
              component={EventOverview}
              role={RolesEnum.BOX_OFFICE}
            />
            <AuthenticatedRoute
              path={`${match.url}/sharing`}
              component={EventSharing}
              role={RolesEnum.ADMIN}
            />
            <AuthenticatedRoute
              path={`${match.url}/metrics`}
              component={EventMetrics}
              role={RolesEnum.ADMIN}
            />
            <AuthenticatedRoute
              path={`${match.url}/orders`}
              component={EventOrders}
              role={RolesEnum.BOX_OFFICE}
            />
              <AuthenticatedRoute
              path={`${match.url}/waitlist`}
              component={WaitList}
              role={RolesEnum.BOX_OFFICE}
            />
              <AuthenticatedRoute
              path={`${match.url}/holds`}
              component={TicketHolds}
              role={RolesEnum.BOX_OFFICE}
            />
            <AuthenticatedRoute
              path={`${match.url}/reports`}
              component={EventReports}
              role={RolesEnum.ADMIN}
            />
         </>
        </DetailsContainer>
      )}
    </Fragment>
  );
};

export default EventDetailsContainer;
