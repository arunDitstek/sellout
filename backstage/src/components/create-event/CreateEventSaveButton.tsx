import React from "react";
import { Icons } from "@sellout/ui";
import Button, {
  ButtonTypes,
  ButtonIconPosition,
} from "@sellout/ui/build/components/Button";
import { useDispatch } from "react-redux";
import * as EventActions from "../../redux/actions/event.actions";
import * as AppActions from "../../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import * as SeasonActions from "../../redux/actions/season.actions";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IOrder";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";

type CreateEventSaveButtonProps = {
  event?: IEventGraphQL;
  season?: ISeasonGraphQL;
};

const CreateEventSaveButton: React.FC<CreateEventSaveButtonProps> = ({
  event,
}) => {
  /* State */

  const firstPath = window.location.pathname.split("/")[1];
  const isEvent = firstPath === "create-event";
  const isSeason = firstPath === "create-season";
  /* Actions */
  const dispatch = useDispatch();

  let eventValidation = false as boolean;
  //let seasonValidation = false as boolean;

  const eventDateValidate = () => {
    const validationMessage = EventUtil.validateEventDates(event as any);
    if (validationMessage.length > 0) {
      dispatch(
        AppActions.showNotification(
          validationMessage,
          AppNotificationTypeEnum.Warning
        )
      );
      eventValidation = true;
    } else {
      eventValidation = false;
    }
  };

  const seasonDateValidate = () => {
    // const message = SeasonUtil.validateSeasonDates(event as any);
    // if (message.length > 0) {
    //   dispatch(
    //     AppActions.showNotification(
    //       message,
    //       AppNotificationTypeEnum.Warning
    //     )
    //   );
    //   seasonValidation = true;
    // } else {
    //   seasonValidation = false;
    // }
  };

  const navigateToNextStep = () => {
    if (isEvent) {
      eventDateValidate();
      if (!eventValidation) {
        dispatch(EventActions.navigateToNextStep());
      }
    } else if (isSeason) {
      seasonDateValidate();
      //if (!seasonValidation) {
      dispatch(SeasonActions.navigateNextStep());
      //}
    }
  };

  return (
    <Button
      type={ButtonTypes.Regular}
      text="NEXT"
      icon={Icons.LongRightArrow}
      iconPosition={ButtonIconPosition.Right}
      onClick={() => navigateToNextStep()}
    />
  );
};

export default CreateEventSaveButton;
