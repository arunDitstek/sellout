import React, { Fragment } from "react";
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
import CreateEventPromotionTicketOptions from "../../../components/create-event/CreateEventPromotionTicketOptions";
import CreateEventPromotionDiscount from "../../../components/create-event/CreateEventPromotionDiscount";
import IEventPromotion, {
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
import * as SeasonActions from "../../../redux/actions/season.actions";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import { CustomFlex, Row } from "../../create-event/modal/CreateEventPromotionModal";

const Container = styled.div`
  position: relative;
  width: 700px;
  ${media.mobile`
    width: 100%;
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

type CreateSeasonPromotionModalProps = {};

const CreateSeasonPromotionModal: React.FC<
  CreateSeasonPromotionModalProps
> = ({}) => {
  const { saveOnChanges } = useModalProps(
    ModalTypes.SeasonPromotion
  ) as ISaveOnChanges;
  /* State */

  /* Season*/
  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId, seasonCache, promotionId } = seasonState;
  const season = seasonCache[seasonId];

  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false);
  const venueState = useSelector((state: BackstageState) => state.venue);
  const { venuesCache } = venueState;
  const venueId = season?.venueId as string;
  const venue = venuesCache[venueId];
  const timezone =
    venue && venue.address && venue.address.timezone != ""
      ? venue.address.timezone
      : season?.venue?.address?.timezone;
  const diffInMinutes = Time.getTimezoneMindifference(timezone);
  /* Actions */

  const dispatch = useDispatch();

  const popModal = () => dispatch(AppActions.popModal());
  const saveEvent = () => {
    dispatch(SeasonActions.saveSeason(false, false));
  };
  const reCacheUpradeType = () =>
    dispatch(EventActions.reCachePromotion(seasonId, promotionId));

  const closePromotionModal = async () => {
    popModal();
    dispatch(SeasonActions.setPromotionId(""));
  };

  const saveChanges = async () => {
    const promotion: IEventPromotion = SeasonUtil.promotion(
      season,
      promotionId
    );

    const validate = SeasonUtil.validatePromotion(promotion as IEventPromotion);
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
    const hasChanged = await ChangeUtil.hasSeasonPromotionChanged(
      season,
      promotionId
    );

    if (hasChanged && saveOnChanges) {
      saveEvent();
    }
    closePromotionModal();
  };

  const discardChanges = async () => {
    const hasToRemoved = await ChangeUtil.hasSeasonToRemovePromotion(
      season,
      promotionId
    );
    if (hasToRemoved)
      dispatch(EventActions.removePromotion(seasonId, promotionId as string));
    reCacheUpradeType();
    popModal();
    popModal();
  };

  const cancel = async () => {
    const hasChanged = await ChangeUtil.hasSeasonPromotionChanged(
      season,
      promotionId
    );
    const hasToRemoved = await ChangeUtil.hasSeasonToRemovePromotion(
      season,
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
        dispatch(
          SeasonActions.removePromotion(seasonId, promotionId as string)
        );
      closePromotionModal();
    }
  };

  const setPromotion = (promotion: Partial<IEventPromotion>) => {
    dispatch(
      SeasonActions.setPromotion(seasonId, promotionId as string, promotion)
    );
  };

  /** Render */
  const TitleIcon = (
    <Icon
      icon={Icons.KeySolid}
      color={Colors.Grey1}
      size={14}
      margin="0 7px 0 0"
    />
  );

  const types = Object.values(EventPromotionTypeEnum)
    .filter(
      (type: EventPromotionTypeEnum) => type !== EventPromotionTypeEnum.Discount
    )
    .map((type: EventPromotionTypeEnum) => {
      return {
        text: type,
        value: type,
      };
    });

  return (
    <ModalContainer>
      {(() => {
        if (!season) {
          return (
            <Container>
              <Loader />
            </Container>
          );
        }

        const promotion: IEventPromotion = SeasonUtil.promotion(
          season,
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
                  <Spacer />
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
                  <Spacer />
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
                  <Spacer />
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
                <Spacer />
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
                </Row>
                {/* {promotion.type === EventPromotionTypeEnum.Discount && (
                  <CreateEventPromotionDiscount
                    promotion={promotion}
                    showToggle={false}
                  />
                )} */}
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
                  <Fragment>
                    <CreateEventPromotionTicketOptions
                      promotion={promotion}
                      showToggle={false}
                      label="Unlocks"
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
                )}
                {(() => {
                  // Unlock codes don't have any advanced options
                  if (promotion.type === EventPromotionTypeEnum.Unlock)
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
                  if (promotion.type === EventPromotionTypeEnum.Unlock)
                    return null;

                  if (showAdvancedOptions) {
                    return (
                      <Fragment>
                        <CreateEventPromotionTicketOptions
                          promotion={promotion}
                        />
                        {/* {promotion.type === EventPromotionTypeEnum.PreSale && (
                          <CreateEventPromotionDiscount
                            promotion={promotion}
                          />
                        )} */}
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

export default CreateSeasonPromotionModal;
