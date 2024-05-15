import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../redux/store";
import { useLocation, useHistory } from "react-router-dom";
import SubSideNavigationButtons from "../elements/SubSideNavigationButtons";
import useNavigateToCreateSeason from "../hooks/useNavigateToCreateSeason.hook";
import { Icons } from "@sellout/ui";
import { ModalTypes } from "./modal/Modal";
import * as AppActions from "../redux/actions/app.actions";
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";

type SeasonSideNavButtonProps = {};
const SeasonSideNavButtons: React.FC<SeasonSideNavButtonProps> = () => {
  /* Hooks */
  const navigateToCreateSeason = useNavigateToCreateSeason();
  const { pathname } = useLocation();
  const history = useHistory();

  /* State */
  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId } = seasonState;
  

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
          `/admin/dashboard/seasons/details/overview?seasonId=${seasonId}`
        ),
      active: () => pathname === "/admin/dashboard/seasons/details/overview",
      role: RolesEnum.BOX_OFFICE,
      cancel: false,
    },
    {
      icon: Icons.ShareLight,
      activeIcon: Icons.ShareSolid,
      text: "Sharing",
      onClick: () =>
        history.push(
          `/admin/dashboard/seasons/details/sharing?seasonId=${seasonId}`
        ),
      active: () => pathname === "/admin/dashboard/seasons/details/sharing",
      role: RolesEnum.ADMIN,
      cancel: false,
    },
    {
      icon: Icons.MetricsLight,
      activeIcon: Icons.MetricsSolid,
      text: "Metrics",
      onClick: () =>
        history.push(
          `/admin/dashboard/seasons/details/metrics?seasonId=${seasonId}`
        ),
      active: () => pathname === "/admin/dashboard/seasons/details/metrics",
      role: RolesEnum.ADMIN,
      cancel: false,
    },
    {
      icon: Icons.ReceiptLight,
      activeIcon: Icons.ReceiptSolid,
      text: "Orders",
      onClick: () =>
        history.push(
          `/admin/dashboard/seasons/details/orders?seasonId=${seasonId}`
        ),
      active: () => pathname === "/admin/dashboard/seasons/details/orders",
      role: RolesEnum.BOX_OFFICE,
      cancel: false,
    },
    {
      icon: Icons.ReportLight,
      activeIcon: Icons.ReportSolid,
      text: "Sales Report",
      onClick: () =>
        history.push(
          `/admin/dashboard/seasons/details/reports?seasonId=${seasonId}`
        ),
      active: () => pathname === "/admin/dashboard/seasons/details/reports",
      role: RolesEnum.ADMIN,
      cancel: false,
    },
    {
      line: true,
      role: RolesEnum.ADMIN,
      cancel: seasonState?.seasonCache[seasonId]?.cancel,
    },
    {
      icon: Icons.EditLight,
      activeIcon: Icons.Edit,
      text: "Edit Season",
      onClick: () => navigateToCreateSeason(seasonId as string),
      active: () => null,
      role: RolesEnum.ADMIN,
      cancel: seasonState?.seasonCache[seasonId]?.cancel,
    },
    {
      icon: Icons.SettingsRegular,
      activeIcon: Icons.SettingsRegular,
      text: 'Edit Admin Fees',
      onClick: () => history.push(`/admin/dashboard/super/seasons/settings?seasonId=${seasonId}`),
      active: () => null,
      role: RolesEnum.ADMIN,
    },
    // {
    //   icon: Icons.CancelLight,
    //   activeIcon: Icons.Cancel,
    //   text: "Cancel Season",
    //   // TODO: We will impliment cancel ticket when we work on refund process
    //   onClick: () => {},
    //   active: () => null,
    //   role: RolesEnum.ADMIN,
    //   cancel: seasonState?.seasonCache[seasonId]?.cancel,
    // },
  ];

  return <SubSideNavigationButtons buttons={buttons} />;
};

export default SeasonSideNavButtons;
