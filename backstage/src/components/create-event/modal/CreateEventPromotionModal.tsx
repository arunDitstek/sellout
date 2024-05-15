import React, { Fragment, useEffect } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../../redux/store";
import * as AppActions from "../../../redux/actions/app.actions";
import * as EventActions from "../../../redux/actions/event.actions";
import { Colors, Icon, Icons, Loader } from "@sellout/ui";
import Input from "@sellout/ui/build/components/Input";
import TextButton, {
  TextButtonSizes,
} from "@sellout/ui/build/components/TextButton";
import Flex from "@sellout/ui/build/components/Flex";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import CreateEventPromotionTicketOptions from "./../CreateEventPromotionTicketOptions";
import IEventPromotion, {
  EventPromotionAppliesToEnum,
  EventPromotionTypeEnum,
} from "@sellout/models/.dist/interfaces/IEventPromotion";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import DatePicker from "../../../elements/DatePicker";
import * as Time from "@sellout/utils/.dist/time";
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalTypes,
} from "../../modal/Modal";
import * as ChangeUtil from "../../../utils/ChangeUtil";
import useModalProps from "../../../hooks/useModalProps.hook";
import { ISaveOnChanges } from "../../../models/interfaces/IModalProps";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import { AppNotificationTypeEnum } from "../../../models/interfaces/IAppNotification";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import CreateEventPromotionUpgradeOptions from "../CreateEventPromotionUpgradeOptions";
import CreateEventPromotionDiscount from "../CreateEventPromotionDiscount";

const Container = styled.div`
  position: relative;
  width: 700px;
  ${media.tablet`
      width: 100% !important;
    `};
  ${media.mobile`
      width: 100% !important;
    `};
`;

export const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  ${media.mobile`
   flex-wrap: wrap;
  `};
`;

const Spacer = styled.div`
  width: 20px;
  height: 20px;
`;

const IconContainer = styled.div`
  position: relative;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
`;

const Warning = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-left: 7px;
`;

export const CustomFlex = styled.div`
  display: flex;
  align-items: flex-end;
  @media (max-width: 767px) {
    flex-wrap: wrap;
    gap: 15px;
  }
`;

type CreateEventPromotionModalProps = {};

const CreateEventPromotionModal: React.FC<
  CreateEventPromotionModalProps
> = ({}) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { saveOnChanges } = useModalProps(
    ModalTypes.Promotion
  ) as ISaveOnChanges;

  const { eventId, promotionId, eventsCache } = eventState;
  const event = eventsCache[eventId];

  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false);
  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venuesCache } = venueState;
  const venueId = event?.venueId as string;
  const venue = venuesCache[venueId];
  const timezone =
    venue && venue.address && venue.address.timezone != ""
      ? venue.address.timezone
      : event?.venue?.address?.timezone;
  const diffInMinutes = Time.getTimezoneMindifference(timezone);
  /* Actions */

  const dispatch = useDispatch();

  const popModal = () => dispatch(AppActions.popModal());
  const saveEvent = () => {
    dispatch(EventActions.saveEvent(false, false));
  };
  const reCacheUpradeType = () =>
    dispatch(EventActions.reCachePromotion(eventId, promotionId));

  const closePromotionModal = async () => {
    popModal();
    dispatch(EventActions.setPromotionId(""));
  };

  const saveChanges = async () => {
    const promotion: IEventPromotion = EventUtil.promotion(event, promotionId);

    const validate = EventUtil.validatePromotion(promotion as IEventPromotion);

    const validationErrors =
      validate?.error?.details?.map((detail: any) => detail.message) ?? [];
    if (validationErrors.length > 0) {
      dispatch(
        AppActions.showNotification(
          validationErrors.join("\n"),
          AppNotificationTypeEnum.Error
        )
      );
      return;
    }
    const hasChanged = await ChangeUtil.hasPromotionChanged(event, promotionId);

    if (hasChanged && saveOnChanges) {
      saveEvent();
    }
    closePromotionModal();
  };

  const discardChanges = async () => {
    const hasToRemoved = await ChangeUtil.hasToRemovePromotion(
      event,
      promotionId
    );
    if (hasToRemoved)
      dispatch(EventActions.removePromotion(eventId, promotionId as string));
    reCacheUpradeType();
    popModal();
  };

  const cancel = async () => {
    const hasChanged = await ChangeUtil.hasPromotionChanged(event, promotionId);
    const hasToRemoved = await ChangeUtil.hasToRemovePromotion(
      event,
      promotionId
    );
    if (hasChanged && !hasToRemoved) {
      dispatch(
        AppActions.pushModalConfirmAction({
          title: "Unsaved Changes",
          message: `You have unsaved changes. What would you like to do?`,
          confirm: () => popModal(),
          confirmText: "SAVE CHANGES",
          cancel: () => discardChanges(),
          cancelText: "DISCARD CHANGES",
        })
      );
    } else {
      if (hasToRemoved)
        dispatch(EventActions.removePromotion(eventId, promotionId as string));
      closePromotionModal();
    }
  };

  const setPromotion = (promotion: Partial<IEventPromotion>) => {
    dispatch(
      EventActions.setPromotion(eventId, promotionId as string, promotion)
    );
  };

  // useEffect(() => {
  //   debugger
  //   if (promotion.appliesTo === EventPromotionAppliesToEnum.PerOrder) {
  //     setPromotion({
  //       ticketTypeIds: [],
  //     });
  //   }
  // }, []);

  /** Render */
  const TitleIcon = (
    <Icon
      icon={Icons.KeySolid}
      color={Colors.Grey1}
      size={14}
      margin="0 7px 0 0"
    />
  );

  const types = Object.values(EventPromotionTypeEnum).map((type: EventPromotionTypeEnum) => {
      return {
        text: type,
        value: type,
      };
    });

  return (
    <ModalContainer>
      {(() => {
        if (!event) {
          return (
            <Container>
              <Loader />
            </Container>
          );
        }

        const promotion: IEventPromotion = EventUtil.promotion(
          event,
          promotionId
        );

        if (!promotion) {
          return (
            <Fragment>
              <ModalHeader
                title="Invalid Secret Code"
                close={closePromotionModal}
                icon={TitleIcon}
              />
              <ModalContent>
                <Container>The requested secret code does not exist</Container>
              </ModalContent>
              <ModalFooter>
                <div />
                <Flex>
                  <Button
                    type={ButtonTypes.Thin}
                    text="CLOSE"
                    onClick={() => cancel()}
                  />
                </Flex>
              </ModalFooter>
            </Fragment>
          );
        }
        const used = promotion.totalQty - promotion.remainingQty;
        return (
          <Fragment>
            <ModalHeader
              title={promotion.code}
              close={cancel}
              icon={TitleIcon}
            />
            <ModalContent>
              <Container>
                <Row>
                  <Input
                    autoFocus
                    label="Secret code"
                    placeholder="SECRETCODE"
                    width="230px"
                    value={promotion.code as string}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setPromotion({ code: e.currentTarget.value })
                    }
                    maxLength={80}
                  />
                  <Dropdown
                    label="Code type"
                    value={`${promotion.type}`}
                    width="123px"
                    items={types}
                    onChange={(type: EventPromotionTypeEnum) => {
                      setPromotion({
                        type,
                      });
                    }}
                  />
                  <Input
                    label="Total qty."
                    placeholder="0"
                    width="75px"
                    type="number"
                    value={promotion.totalQty.toString()}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                      const qty = parseInt(e.currentTarget.value) || 0;
                      const remainingQty = qty - used;
                      setPromotion({
                        totalQty: qty,
                        remainingQty: remainingQty,
                      });
                    }}
                  />
                  <Input
                    label="Use limit"
                    placeholder="1"
                    width="75px"
                    type="number"
                    value={promotion.useLimit.toString()}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setPromotion({
                        useLimit: parseInt(e.currentTarget.value),
                      })
                    }
                  />
                  {promotion.type !== EventPromotionTypeEnum.Discount &&
                  <>
                  <Input
                    label="Max Tickets"
                    placeholder="1"
                    width="75px"
                    type="number"
                    margin="0"
                    value={promotion?.overRideMax?.toString()}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setPromotion({
                        overRideMax: parseInt(e.currentTarget.value),
                      })
                    }
                  />
                  <Input
                    label="Max Upgrades"
                    placeholder="1"
                    width="75px"
                    type="number"
                    margin="0"
                    value={promotion?.overRideMaxUpg?.toString()}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setPromotion({
                        overRideMaxUpg: parseInt(e.currentTarget.value),
                      })
                    }
                  />
                  </>}
                {promotion.type === EventPromotionTypeEnum.Discount && (
                  <CreateEventPromotionDiscount
                    promotion={promotion}
                    showToggle={false}
                  />
                )}
                </Row>
                <Spacer />
                <CustomFlex>
                  <DatePicker
                    label="Usable from"
                    width="220px"
                    value={Time.date(
                      promotion.startsAt
                        ? promotion.startsAt - diffInMinutes * 60
                        : promotion.startsAt
                    )}
                    onChange={(value: any) => {
                      const startsAt =
                        Time.fromDate(value) + diffInMinutes * 60;
                      setPromotion({ startsAt });
                    }}
                  />
                  <IconContainer>
                    <Icon
                      icon={Icons.LongRightArrow}
                      color={Colors.Grey4}
                      size={16}
                    />
                  </IconContainer>
                  <DatePicker
                    width="220px"
                    value={Time.date(promotion.endsAt)}
                    onChange={(value: any) => {
                      const endsAt = Time.fromDate(value);
                      setPromotion({ endsAt });
                    }}
                  />
                </CustomFlex>
                {promotion.type === EventPromotionTypeEnum.Unlock && (
                  <>
                    <Fragment>
                      <CreateEventPromotionTicketOptions
                        promotion={promotion}
                        showToggle={false}
                        label="Unlocks tickets"
                      />
                      <Flex align="center" margin="15px 0 0">
                        <Icon
                          icon={Icons.Warning}
                          color={Colors.Yellow}
                          size={12}
                        />
                        <Warning>
                          Selected tickets will be invisible unless unlocked by
                          code
                        </Warning>
                      </Flex>
                    </Fragment>
                    {event?.upgrades && event?.upgrades?.length > 0 && (
                      <>
                        <CreateEventPromotionUpgradeOptions
                          promotion={promotion}
                          showOnOffToggle={false}
                          label="Unlocks upgrades"
                        />
                        <Flex align="center" margin="15px 0 0">
                          <Icon
                            icon={Icons.Warning}
                            color={Colors.Yellow}
                            size={12}
                          />
                          <Warning>
                            Selected upgrade will be invisible unless unlocked
                            by code
                          </Warning>
                        </Flex>
                      </>
                    )}
                  </>
                )}
                {(() => {
                  // Unlock codes don't have any advanced options
                  if (promotion.type === EventPromotionTypeEnum.Unlock || promotion.appliesTo === EventPromotionAppliesToEnum.PerOrder)
                    return null;
                  return (
                    <Fragment>
                      <Spacer />
                      <TextButton
                        size={TextButtonSizes.Small}
                        onClick={() =>
                          setShowAdvancedOptions(!showAdvancedOptions)
                        }
                        icon={Icons.RightChevronSolid}
                        iconRotation={showAdvancedOptions ? 90 : 0}
                      >
                        Show advanced options
                      </TextButton>
                    </Fragment>
                  );
                })()}
                {(() => {
                  // Unlock codes don't have any advanced options
                  if (promotion.type === EventPromotionTypeEnum.Unlock || promotion.appliesTo === EventPromotionAppliesToEnum.PerOrder)
                    return null;
                  if (showAdvancedOptions) {
                    return (
                      <Fragment>
                        <CreateEventPromotionTicketOptions
                          promotion={promotion}
                        />
                        {promotion.type !== EventPromotionTypeEnum.Discount && event?.upgrades && event?.upgrades?.length > 0 && (
                          <CreateEventPromotionUpgradeOptions
                            promotion={promotion}
                          />
                        )}
                      </Fragment>
                    );
                  }
                })()}
              </Container>
            </ModalContent>
            <ModalFooter>
              <div />
              <Flex>
                <Button
                  type={ButtonTypes.Thin}
                  state={ButtonStates.Warning}
                  text="CANCEL"
                  margin="0 10px 0 0"
                  onClick={() => {
                    cancel();
                  }}
                />
                <Button
                  type={ButtonTypes.Thin}
                  text="SAVE CODE"
                  onClick={() => saveChanges()}
                />
              </Flex>
            </ModalFooter>
          </Fragment>
        );
      })()}
    </ModalContainer>
  );
};

export default CreateEventPromotionModal;
