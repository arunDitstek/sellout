import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as EventActions from "../../redux/actions/event.actions";
import * as AppActions from "../../redux/actions/app.actions";
import useHistory from "../../hooks/useHistory.hook";
import CreateFlowControls from "../create-flow/CreateFlowControls";
import { ModalTypes } from "../modal/Modal";
import * as Time from "@sellout/utils/.dist/time";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";
import { useQuery } from "@apollo/react-hooks";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";

type CreateEventControlsProps = {};

const CreateEventControls: React.FC<CreateEventControlsProps> = () => {
  /* Hooks */
  const history = useHistory();
  const eventState = useSelector((state: BackstageState) => state.event);
  const { eventId, saving, eventsCache } = eventState;
  const event = eventsCache[eventId]
  const { data } = useQuery(GET_PROFILE);
  const performance = event?.performances?.[0];
  /* State */
  const stripeId = data?.organization?.stripeId;
  const announceAt = event?.schedule?.announceAt ?? Infinity;
  const isAnnounced = announceAt < Time.now();

  let finalizeText = "PUBLISH EVENT";

  if (event?.published) {
    finalizeText = "UPDATE EVENT";
  }

  if (!isAnnounced) {
    finalizeText = "SCHEDULE EVENT";
  }

  let validation = false as boolean;
  const dateAndTimeTab =
    window.location.pathname.split("/")[1] === "create-event";
  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());
  const finalize = () => {
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

    if (stripeId) {
      if (dateAndTimeTab) {
        eventDateValidate();
        if (event?.isMultipleDays) {
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
      }
      if (!validation) {
        dispatch(AppActions.pushModal(ModalTypes.PublishEvent));
      }
    } else {
      dispatch(
        AppActions.pushModalConfirmAction({
          title: "Stripe not connected",
          message: `You must connect Stripe in order to publish events. Would you like to do this now?`,
          confirm: () => {
            popModal();
            history.push("/admin/dashboard/settings/payouts");
          },
          confirmText: "GO TO SETTINGS",
          cancel: popModal,
          cancelText: "CLOSE",
        })
      );
    }
  };

  const eventDateValidate = () => {
    const isTicketTab =
      window.location.pathname.split("/")[2] === "ticket-types";
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
    if (
      event?.isMultipleDays &&
      validationMessage.length === 0 &&
      isTicketTab
    ) {
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
    if (event?.isGuestTicketSale && event?.guestTicketPerMember?.length === 0) {
      validation = true;
      dispatch(
        AppActions.showNotification(
          "'Guest Tickets Per Member' is required. If you Allow Guest Ticket Sales",
          AppNotificationTypeEnum.Warning
        )
      );
    }
  };

  const navigateToPreviousStep = () => {
    if (dateAndTimeTab) {
      eventDateValidate();
    }
    if (!validation) {
      dispatch(EventActions.navigateToPreviousStep());
    }
  };
  const navigateToNextStep = () => {
    if (dateAndTimeTab) {
      eventDateValidate();
    }
    if (!validation) {
      dispatch(EventActions.navigateToNextStep());
    }
  };
  const exit = () => {
    if (dateAndTimeTab) {
      eventDateValidate();
    }
    if (!validation) {
      if (event?.published) {
        history.push(
          `/admin/dashboard/events/details/overview?eventId=${eventId}`
        );
      } else {
        history.push(`/admin/dashboard/events`);
      }
    }
  };
  const cancelEvent = () =>
    dispatch(AppActions.pushModal(ModalTypes.CancelEvent));

  /* Render */
  return (
    <CreateFlowControls
      finalize={finalize}
      save={navigateToNextStep}
      previous={navigateToPreviousStep}
      finalizeText={finalizeText}
      exit={exit}
      cancel={event?.published ? undefined : cancelEvent}
      saving={saving}
    />
  );
};

export default CreateEventControls;
