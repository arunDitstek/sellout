import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import { useLocation, useHistory } from "react-router-dom";
import SubSideNavigationButtons from "../elements/SubSideNavigationButtons";
import useNavigateToCreateEvent from "../hooks/useNavigateToCreateEvent.hook";
import { Icons } from "@sellout/ui";
import { ModalTypes } from "../components/modal/Modal";
import * as AppActions from "../redux/actions/app.actions";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import useEvent from "../hooks/useEvent.hook";

type EventSideNavButtonProps = {};
const EventSideNavButtons: React.FC<EventSideNavButtonProps> = () => {
  /* Hooks */
  const navigateToCreateEvent = useNavigateToCreateEvent();
  const { pathname } = useLocation();
  const history = useHistory();

  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId } = eventState;
  const { event } = useEvent(eventId, true);

  const dispatch = useDispatch();
  const pushModal = (modalType: ModalTypes) =>
    dispatch(AppActions.pushModal(modalType));

  const buttons = [
    {
      line: true,
      cancel: false,
    },
    {
      icon: Icons.EyeLight,
      activeIcon: Icons.EyeSolid,
      text: "Overview",
      onClick: () =>
        history.push(
          `/admin/dashboard/events/details/overview?eventId=${eventId}`
        ),
      active: () => pathname === "/admin/dashboard/events/details/overview",
      role: RolesEnum.BOX_OFFICE,
      cancel: false,
    },
    {
      icon: Icons.ShareLight,
      activeIcon: Icons.ShareSolid,
      text: "Sharing",
      onClick: () =>
        history.push(
          `/admin/dashboard/events/details/sharing?eventId=${eventId}`
        ),
      active: () => pathname === "/admin/dashboard/events/details/sharing",
      role: RolesEnum.ADMIN,
      cancel: false,
    },
    {
      icon: Icons.MetricsLight,
      activeIcon: Icons.MetricsSolid,
      text: "Metrics",
      onClick: () =>
        history.push(
          `/admin/dashboard/events/details/metrics?eventId=${eventId}`
        ),
      active: () => pathname === "/admin/dashboard/events/details/metrics",
      role: RolesEnum.ADMIN,
      cancel: false,
    },
    {
      icon: Icons.ReceiptLight,
      activeIcon: Icons.ReceiptSolid,
      text: "Orders",
      onClick: () =>
        history.push(
          `/admin/dashboard/events/details/orders?eventId=${eventId}`
        ),
      active: () => pathname === "/admin/dashboard/events/details/orders",
      role: RolesEnum.BOX_OFFICE,
      cancel: false,
    },
    {
      icon: Icons.Clock,
      activeIcon: Icons.Clock,
      text: "Wait List",
      onClick: () =>
        history.push(
          `/admin/dashboard/events/details/waitlist?eventId=${eventId}`
        ),
      active: () => pathname === "/admin/dashboard/events/details/waitlist",
      role: RolesEnum.BOX_OFFICE,
      cancel: false,
    },
    {
      icon: Icons.TicketSolid,
      activeIcon: Icons.TicketSolid,
      text: "Ticket Holds",
      onClick: () =>
        history.push(
          `/admin/dashboard/events/details/holds?eventId=${eventId}`
        ),
      active: () => pathname === "/admin/dashboard/events/details/holds",
      role: RolesEnum.BOX_OFFICE,
      cancel: Boolean(event?.seatingChartKey),
    },
    {
      icon: Icons.ReportLight,
      activeIcon: Icons.ReportSolid,
      text: "Sales Report",
      onClick: () =>
        history.push(
          `/admin/dashboard/events/details/reports?eventId=${eventId}`
        ),
      active: () => pathname === "/admin/dashboard/events/details/reports",
      role: RolesEnum.ADMIN,
      cancel: false,
    },
    {
      line: true,
      role: RolesEnum.ADMIN,
      cancel: event?.cancel,
    },
    {
      icon: Icons.EditLight,
      activeIcon: Icons.Edit,
      text: "Edit Event",
      onClick: () => navigateToCreateEvent(eventId as string),
      active: () => null,
      role: RolesEnum.ADMIN,
      cancel: event?.cancel,
    },
    {
      icon: Icons.SettingsRegular,
      activeIcon: Icons.SettingsRegular,
      text: "Edit Admin Fees",
      onClick: () =>
        history.push(
          `/admin/dashboard/super/events/settings?eventId=${eventId}`
        ),
      active: () => null,
      role: RolesEnum.SUPER_USER,
    },
    {
      icon: Icons.CancelLight,
      activeIcon: Icons.Cancel,
      text: "Cancel Event",
      // TODO: We will impliment cancel ticket when we work on refund process
      onClick: () => pushModal(ModalTypes.CancelEvent),
      active: () => null,
      role: RolesEnum.ADMIN,
      cancel: event?.cancel,
    },
  ];

  return <SubSideNavigationButtons buttons={buttons} />;
};

export default EventSideNavButtons;
