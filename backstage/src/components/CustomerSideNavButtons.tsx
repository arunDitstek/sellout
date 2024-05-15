import React from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Icons } from "@sellout/ui";
import { useSelector } from "react-redux";
import SubSideNavigationButtons from "../elements/SubSideNavigationButtons";
import { BackstageState } from "../redux/store";
import { ModalTypes } from "./modal/Modal";
import { useDispatch } from "react-redux";
import * as AppActions from "../redux/actions/app.actions";

const CustomerSideNavButtons: React.FC = () => {
  /* Hooks */
  const { pathname } = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  /* State */
  const customerState = useSelector((state: BackstageState) => state.customer);
  const { customerId } = customerState;

  const buttons = [
    {
      icon: Icons.EyeLight,
      activeIcon: Icons.EyeSolid,
      text: "Overview",
      onClick: () =>
        history.push(
          `/admin/dashboard/customers/details/overview?customerId=${customerId}`
        ),
      active: () => pathname === "/admin/dashboard/customers/details/overview",
    },
    {
      icon: Icons.ReceiptLight,
      activeIcon: Icons.ReceiptSolid,
      text: "Orders",
      onClick: () =>
        history.push(
          `/admin/dashboard/customers/details/orders?customerId=${customerId}`
        ),
      active: () => pathname === "/admin/dashboard/customers/details/orders",
    },
    {
      icon: Icons.EditLight,
      activeIcon: Icons.EditLight,
      text: "Edit Customer",
      onClick: () => dispatch(AppActions.pushModal(ModalTypes.UpdateCustomer)),
      active: () => pathname === "",
    },
  ];

  return <SubSideNavigationButtons buttons={buttons} />;
};

export default CustomerSideNavButtons;
