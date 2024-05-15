import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../redux/store";
import * as AppActions from "../../redux/actions/app.actions";
import useHistory from "../../hooks/useHistory.hook";
import CreateFlowControls from "../create-flow/CreateFlowControls";
import { ModalTypes } from "../modal/Modal";
import * as Time from "@sellout/utils/.dist/time";
import GET_PROFILE from "@sellout/models/.dist/graphql/queries/profile.query";
import { useQuery } from "@apollo/react-hooks";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import * as SeasonActions from "../../redux/actions/season.actions";

type CreateSeasonControlsProps = {};

const CreateSeasonControls: React.FC<CreateSeasonControlsProps> = () => {
  /* Hooks */

  const history = useHistory();
  const { data } = useQuery(GET_PROFILE);

  const stripeId = data?.organization?.stripeId;
  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId, saving, seasonCache } = seasonState;
  const season = seasonCache[seasonId];
  const performance = season?.performances?.[0];
  /* State */

  const announceAt = season?.schedule?.announceAt ?? Infinity;

  const isAnnounced = announceAt < Time.now();

  let finalizeText = "PUBLISH Season";

  if (season?.published) {
    finalizeText = "UPDATE Season";
  }

  if (!isAnnounced) {
    finalizeText = "SCHEDULE Season";
  }

  let validation = false as boolean;
  const dateAndTimeTab =
    window.location.pathname.split("/")[1] === "create-season";
  /* Actions */
  const dispatch = useDispatch();
  const popModal = () => dispatch(AppActions.popModal());
  const finalize = () => {
    if (season) {
      const updatedScheduledDays = performance?.schedule?.map(
        (item) => item.startsAt
      );

      const updatedTicketTypes = season?.ticketTypes?.map((item) => {
        const updatedDayIds = item?.dayIds?.filter((item) =>
          updatedScheduledDays?.includes(Number(item))
        );
        item.dayIds = updatedDayIds;
        return item;
      });
      season.ticketTypes = updatedTicketTypes;
    }
    
    if (stripeId) {
      if (dateAndTimeTab) {
        seasonDateValidate();
      }
      if (!validation) {
        dispatch(AppActions.pushModal(ModalTypes.PublishSeasonModal));
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

  const seasonDateValidate = () => {
    const validationMessage = SeasonUtil.validateSeasonDates(season as any);
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
  };

  const navigateToPreviousStep = () => {
    if (dateAndTimeTab) {
      seasonDateValidate();
    }
    if (!validation) {
      dispatch(SeasonActions.navigatePreviousStep());
    }
  };
  const navigateToNextStep = () => {
    if (dateAndTimeTab) {
      seasonDateValidate();
    }
    if (!validation) {
      dispatch(SeasonActions.navigateNextStep());
    }
  };
  const exit = () => {
    if (dateAndTimeTab) {
      seasonDateValidate();
    }
    if (!validation) {
      if (season?.published) {
        history.push(
          `/admin/dashboard/seasons/details/overview?seasonId=${seasonId}`
        );
      } else {
        history.push(`/admin/dashboard/seasons`);
      }
    }
  };

  /* Render */
  return (
    <CreateFlowControls
      finalize={finalize}
      save={navigateToNextStep}
      previous={navigateToPreviousStep}
      finalizeText={finalizeText}
      exit={exit}
      cancel={season?.published ? undefined : undefined}
      saving={saving}
    />
  );
};

export default CreateSeasonControls;
