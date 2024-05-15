import { useSelector } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { ScreenEnum, ErrorKeyEnum } from "../redux/reducers/app.reducer";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import PaymentUtil from "@sellout/models/.dist/utils/PaymentUtil";
import { EPurchasePortalModes } from "@sellout/models/.dist/enums/EPurchasePortalModes";

type UseShowNextHook = (event: any) => boolean;

const useShowNextHook: UseShowNextHook = (event) => {
  /* State */
  const { app, order, user } = useSelector(
    (state: PurchasePortalState) => state
  );

  const {
    paymentMethodId,
    cashTendered,
    upgradesOnly,
    createOrderParams: { customFields, tickets, upgrades, paymentMethodType },
  } = order;

  const {
    createUserParams: { email, firstName, lastName, phoneNumber },
    userProfile,
    userExists,
  } = user;

  const { screen, errors, loading, mode,waitList } = app;
  const visibleUpgrades = event.upgrades.filter(
    (upgrade: any) => upgrade.visible
  );
  const isBoxOffice = mode === EPurchasePortalModes.BoxOffice;

  const allTicketsVisible: any = event?.ticketTypes?.filter(
    (ticket: any) => ticket.remainingQty > 0
  );
  const allUpgradeVisible: any = event?.upgrades?.filter(
    (upgrade: any) => upgrade.remainingQty > 0
  );
  const upgradesOnly1 =
  allUpgradeVisible.length > 0 &&
    tickets.length === 0 &&
    screen === ScreenEnum.Tickets &&
    mode === EPurchasePortalModes.BoxOffice &&
    visibleUpgrades.length > 0;
  const showButton =
  isBoxOffice && allTicketsVisible.length == 0 && allUpgradeVisible.length == 0;
  // let guestFees = PaymentUtil.calculateGuestFee(
  //   tickets as any,
  //   (event as any)
  // );

  const totalParams = {
    tickets,
    upgrades,
    fees: event.fees,
    paymentMethodType,
  };
  const isGuestMember = tickets.filter((x) => x.teiMemberId);

  const total = PaymentUtil.calculatePaymentTotal(totalParams).total;

  // Never show the button when loading
  if (loading) return false;

  const fullNameError = errors[ErrorKeyEnum.UserFullName];
  const phoneNumberError = errors[ErrorKeyEnum.UserPhoneNumber];
  switch (screen) {
    case ScreenEnum.Tickets:
      if (showButton ||waitList) {
        return false;
      } else {
        if (!upgradesOnly1) {
          if (
            tickets.length ||
            (errors?.Tickets && errors?.Tickets?.length > 0)
          )
            return true;
        } else {
          return true;
        }
      }
      break;

    case ScreenEnum.GuestMembers:
      if (isGuestMember.length > 0) return true;
      break;
    case ScreenEnum.Upgrades:
      if (upgrades.length && upgradesOnly) return true;
      if (upgrades.length && !upgradesOnly) return true;
      else if (tickets.length) return true;
      break;

    case ScreenEnum.CustomFields:
      return event?.events
        ? SeasonUtil.customFieldsAreValid(event.customFields, customFields)
        : EventUtil.customFieldsAreValid(event.customFields, customFields);

    case ScreenEnum.LiabilityWaiver:
      return true;

    case ScreenEnum.UserEmail:
      if (Boolean(email)) {
        return true;
      } else {
        return false;
      }

    case ScreenEnum.UserInfo:
      if (
        firstName &&
        lastName &&
        phoneNumber &&
        !fullNameError &&
        !phoneNumberError
      ) {
        return true;
      } else {
        return false;
      }

    case ScreenEnum.SelectPayment:
      return Boolean(paymentMethodId);

    case ScreenEnum.AddPayment:
      return true;

    case ScreenEnum.CustomerPhoneNumber:
      if (firstName && lastName && phoneNumber && email) {
        const phoneNumberisValid = Boolean(phoneNumber) && !phoneNumberError;
        return Boolean(userProfile) || phoneNumberisValid;
      } else if (userExists && phoneNumber.length > 1) {
        const phoneNumberisValid = Boolean(phoneNumber) && !phoneNumberError;
        return Boolean(userProfile) || phoneNumberisValid;
      }

    case ScreenEnum.CashPayment:
      return (cashTendered as number) >= total && Boolean(cashTendered);

    case ScreenEnum.ConfirmOrder:
      return true;
  }

  return false;
};

export default useShowNextHook;
