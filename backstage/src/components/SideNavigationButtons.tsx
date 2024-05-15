import React from "react";
import styled from "styled-components";
import * as Polished from "polished";
import { useQuery } from "@apollo/react-hooks";
import { useLocation } from "react-router-dom";
import IS_SUPER_USER from "@sellout/models/.dist/graphql/queries/isSuperUser.query";
import { Colors, Icon, Icons } from "@sellout/ui";
import CreateButton from "../elements/CreateButton";
import useHistory from "../hooks/useHistory.hook";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import usePermission from "../hooks/usePermission.hook";
import IEventSchedule from "@sellout/models/.dist/interfaces/IEventSchedule";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../redux/actions/app.actions";
import { BackstageState } from "../redux/store";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";

type SideNavigationButtonProps = {
  active: number;
};

const SideNavigationButton = styled.span<SideNavigationButtonProps>`
  display: flex;
  height: 48px;
  color: ${(props) =>
    props.active ? Colors.White : Polished.rgba(Colors.White, 0.5)};
  text-decoration: none;
  align-items: center;

  &:hover {
    color: ${(props) =>
      props.active ? Colors.White : Polished.rgba(Colors.White, 0.9)};
    cursor: pointer;
  }
`;

type SideNavigationTextProps = {
  visible: boolean;
};

const IconContainer = styled.div`
  display: flex;
  width: 60px;
  justify-content: center;
`;

const Text = styled.div<SideNavigationTextProps>`
  position: absolute;
  left: 65px;
  font-size: 1.8rem;
  font-weight: 600;
  transition: all 0.2s;
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  opacity: ${(props) => (props.visible ? "1" : "0")};
  white-space: nowrap;
`;

const Space = styled.div`
  height: 16px;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const NewEventContainer = styled.div`
  padding: 15px 10px;
`;

type SideNavigationButtonsProps = {
  open: boolean;
  setOpen?: Function;
  setVisible?: Function;
};

const SideNavigationButtons: React.FC<SideNavigationButtonsProps> = ({
  open,
  setVisible,
  setOpen,
}) => {
  const { data } = useQuery(IS_SUPER_USER);

  const { data: organizationData } = useQuery(GET_PROFILE);
  const hasPermission = usePermission();
  const history = useHistory();
  let { pathname } = useLocation();
  if (pathname.slice(pathname.length - 1) === "/") {
    pathname = pathname.slice(0, -1);
  }

  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  const dispatch = useDispatch();

  let validation = false as boolean;
  const dateAndTimeTab =
    window.location.pathname.split("/")[1] === "create-event";

  const eventDateValidate = () => {
    const validationMessage = EventUtil.validateEventDates(event as any);
    if (validationMessage.length > 0) {
      dispatch(
        AppActions.showNotification(
          validationMessage,
          AppNotificationTypeEnum.Warning
        )
      );
      validation = true;
    } else {
      validation = false;
    }
    if (event?.isMultipleDays && validationMessage.length === 0) {
      event?.ticketTypes?.some(
        (a: ITicketType) =>
          a.dayIds?.length === 0 &&
          (dispatch(
            AppActions.showNotification(
              "Please select any days in " + a.name,
              AppNotificationTypeEnum.Warning
            )
          ),
          (validation = true))
      );
    }
  };

  type SideNavButtons = {
    text?: string;
    icon?: any;
    activeIcon?: any;
    space?: boolean;
    active?: string[];
    link?: string;
    role?: RolesEnum;
  };

  const isUserUrl = window.location.pathname.split("/")[1] === "user";

  const buttons: SideNavButtons[] = [
    {
      space: true,
      active: [],
    },
    {
      text: "Dashboard",
      link: "/admin/dashboard",
      icon: Icons.HomeLight,
      activeIcon: Icons.HomeSolid,
      role: RolesEnum.ADMIN,
      active: ["/admin/dashboard"],
    },
    {
      text: "Events",
      link: "/admin/dashboard/events",
      icon: Icons.CalendarStarLight,
      activeIcon: Icons.CalendarStarSolid,
      role: RolesEnum.SCANNER,
      active: [
        "/admin/dashboard/events",
        "/admin/dashboard/events/create",
        "/admin/dashboard/events/details",
        "/admin/dashboard/events/orders",
        "/admin/dashboard/events/audience",
        "/admin/dashboard/events/reports",
      ],
    },

    {
      text: "Orders",
      link: "/admin/dashboard/orders",
      icon: Icons.ReceiptLight,
      activeIcon: Icons.ReceiptSolid,
      role: RolesEnum.BOX_OFFICE,
      active: ["/admin/dashboard/orders", "/admin/dashboard/orders/details"],
    },
    {
      text: "Analytics",
      link: "/admin/dashboard/analytics",
      icon: Icons.AnalyticsLight,
      activeIcon: Icons.AnalyticsSolid,
      role: RolesEnum.ADMIN,
      active: ["/admin/dashboard/analytics"],
    },
    // {
    //   space: true,
    //   active: [],
    // },
    {
      text: "Customers",
      link: "/admin/dashboard/customers",
      icon: Icons.UsersLight,
      activeIcon: Icons.UsersSolid,
      role: RolesEnum.ADMIN,
      active: [
        "/admin/dashboard/customers",
        "/admin/dashboard/customers/activity",
        "/admin/dashboard/customers/orders",
        "/admin/dashboard/customers/transfers",
        "/admin/dashboard/customers/exchanges",
        "/admin/dashboard/customers/waitlists",
      ],
    },
    {
      text: "Venues",
      link: "/admin/dashboard/venues",
      icon: Icons.VenueLight,
      activeIcon: Icons.VenueSolid,
      role: RolesEnum.ADMIN,
      active: [
        "/admin/dashboard/venues",
        "/admin/dashboard/venues/create",
        "/admin/dashboard/venues/details",
        "/admin/dashboard/venues/seating",
        "/admin/dashboard/venues/seating/create",
        "/admin/dashboard/venues/settings",
      ],
    },
    // {
    //   text: "Performers",
    //   link: "/admin/dashboard/performers",
    //   icon: Icons.MicrophoneLight,
    //   activeIcon: Icons.MicrophoneSolid,
    //   role: RolesEnum.ADMIN,
    //   active: [
    //     "/admin/dashboard/performers",
    //     "/admin/dashboard/performers/create",
    //     "/admin/dashboard/performers/details"
    //   ],
    // },
    // {
    //   space: true,
    //   active: [],
    // },
    // {
    //   text: "Find",
    //   icon: Icons.SearchLight,
    //   activeIcon: Icons.SearchSolid,
    //   role: RolesEnum.ADMIN,
    //   active: [],
    // },

    {
      text: "My Tickets",
      link: "/my-tickets",
      icon: Icons.TicketRegular,
      activeIcon: Icons.TicketSolid,
      role: RolesEnum.USER,
      active: ["/my-tickets"],
    },
    // {
    //   space: true,
    //   active: [],
    // },
  ];

  const superUser = {
    text: "Super Admin",
    link: "/admin/dashboard/super/organizations",
    icon: Icons.CrownRegular,
    activeIcon: Icons.CrownSolid,
    active: [
      "/admin/dashboard/super/organizations",
      "/admin/dashboard/super/organizations/details",
      "/admin/dashboard/super/sites",
      "/admin/dashboard/super/settings",
    ],
  };

  const seasonTicket = {
    text: "Seasons",
    link: "/admin/dashboard/seasons",
    icon: Icons.CalendarDayLight,
    activeIcon: Icons.CalendarDaySolid,
    role: RolesEnum.SCANNER,
    active: [
      "/admin/dashboard/seasons",
      "/admin/dashboard/seasons/create",
      "/admin/dashboard/seasons/details",
      "/admin/dashboard/seasons/orders",
      "/admin/dashboard/seasons/audience",
      "/admin/dashboard/seasons/reports",
    ],
  };
  if (organizationData && organizationData?.organization?.isSeasonTickets) {
    buttons.splice(2, 0, seasonTicket);
  }

  if (data && data?.isSuperUser) {
    buttons.push(superUser);
  }

  return (
    <ButtonContainer>
      {hasPermission(RolesEnum.ADMIN) && (
        <NewEventContainer>
          <CreateButton open={open} />
        </NewEventContainer>
      )}
      {buttons.map((b, i) => {
        if (b.space) {
          return <Space key={i} />;
        }
        const aa = b?.role && hasPermission(b.role);

        if (b?.role && hasPermission && !hasPermission(b.role)) {
          return <div key={i} />;
        }

        const active = b?.active?.includes(pathname);
        const performance = event?.performances?.[0];
        return (
          <SideNavigationButton
            key={i}
            active={active ? 1 : 0}
            onClick={() => {
              if (event) {
                const updatedScheduledDays = performance?.schedule?.map(
                  (item) => item.startsAt
                );

                const updatedTicketTypes = event?.ticketTypes?.map((item) => {
                  const updatedDayIds = item?.dayIds?.filter((item) =>
                    updatedScheduledDays?.includes(Number(item))
                  );
                  item.dayIds = updatedDayIds;
                  return item;
                });
                event.ticketTypes = updatedTicketTypes;
              }
              if (dateAndTimeTab) {
                eventDateValidate();
              }
              if (!validation) {
                if (setVisible) setVisible(false);
                if (setOpen) setOpen(false);
                history.push(b.link);
              }
            }}
          >
            <IconContainer>
              <Icon
                icon={active ? b.activeIcon : b.icon}
                color={active ? Colors.White : "inherit"}
                size={18}
              />
            </IconContainer>
            <Text visible={open}>{b.text}</Text>
          </SideNavigationButton>
        );
      })}
    </ButtonContainer>
  );
};

export default SideNavigationButtons;
