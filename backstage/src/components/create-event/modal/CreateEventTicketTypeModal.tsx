import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../../redux/store";
import * as AppActions from "../../../redux/actions/app.actions";
import * as EventActions from "../../../redux/actions/event.actions";
import { Colors, Icon, Icons } from "@sellout/ui";
import Input from "@sellout/ui/build/components/Input";
import FormattedInput, {
  InputFormats,
} from "@sellout/ui/build/components/FormattedInput";
import TextArea from "../../../elements/TextArea";
import Flex from "@sellout/ui/build/components/Flex";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import ITicketType from "@sellout/models/.dist/interfaces/ITicketType";
import ITicketTier from "@sellout/models/.dist/interfaces/ITicketTier";
import * as Price from "@sellout/utils/.dist/price";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
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
import { AppNotificationTypeEnum } from "../../../models/interfaces/IAppNotification";
import SelectEventDays from "../SelectEventDays";
import Label from "@sellout/ui/build/components/Label";

const Container = styled.div`
  position: relative;
  width: 700px;
  @media(max-width:767px){
    width: initial;
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  flex-flow: wrap;
  gap: 15px;
`;

const Spacer = styled.div`
  width: 20px;
  height: 20px;
`;

type CreateEventTicketTypeModalProps = {};

const CreateEventTicketTypeModal: React.FC<
  CreateEventTicketTypeModalProps
> = ({}) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { saveOnChanges } = useModalProps(
    ModalTypes.TicketType
  ) as ISaveOnChanges;

  const { eventId, ticketTypeId, eventsCache, isUsingPricingTiers } =
    eventState;
  const event = eventsCache[eventId];
  const performance = event?.performances?.[0].schedule;

  /* Actions */
  const dispatch = useDispatch();

  const popModal = () => dispatch(AppActions.popModal());
  const saveEvent = () => dispatch(EventActions.saveEvent(false, false));
  const reCacheTicketType = () =>
    dispatch(EventActions.reCacheTicketType(eventId, ticketTypeId));

  const closeTicketModal = async () => {
    popModal();
    dispatch(EventActions.setTicketTypeId(""));
  };

  const saveChanges = async () => {
    const ticketType: ITicketType = EventUtil.ticketType(event, ticketTypeId);

    const isPaid = EventUtil.isPaid(event);
    const isMultipleDays = event?.isMultipleDays as boolean;
    const validate = EventUtil.validateTicket(
      ticketType as ITicketType,
      isPaid as Boolean,
      isMultipleDays as boolean
    );
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
    const hasChanged = await ChangeUtil.hasTicketTypeChanged(
      event,
      ticketTypeId
    );
    if (hasChanged && saveOnChanges) {
      saveEvent();
    }
    closeTicketModal();
  };

  const discardChanges = async () => {
    const hasToRemoved = await ChangeUtil.hasToRemoveTicketType(
      event,
      ticketTypeId
    );
    if (hasToRemoved)
      dispatch(EventActions.removeTicketType(eventId, ticketTypeId as string));
    reCacheTicketType();
    popModal();
  };

  const cancel = async () => {
    const hasChanged = await ChangeUtil.hasTicketTypeChanged(
      event,
      ticketTypeId
    );
    const hasToRemoved = await ChangeUtil.hasToRemoveTicketType(
      event,
      ticketTypeId
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
          EventActions.removeTicketType(eventId, ticketTypeId as string)
        );
      closeTicketModal();
    }
  };

  const setTicketTypeName = (name: string) =>
    dispatch(EventActions.setTicketTypeName(eventId, ticketTypeId, name));

  const setTicketType = (ticketType: Partial<ITicketType>) =>
    dispatch(EventActions.setTicketType(eventId, ticketTypeId, ticketType));

  const setTicketTypeTier = (tierId: string, tier: Partial<ITicketTier>) => {
    dispatch(
      EventActions.setTicketTypeTier(eventId, ticketTypeId, tierId, tier)
    );
  };
  const setTicketTypePurchaseLimit = (purchaseLimit: number) =>
    dispatch(
      EventActions.setTicketTypePurchaseLimit(
        eventId,
        ticketTypeId,
        purchaseLimit
      )
    );

  const setTicketTypeDescription = (description: string) =>
    dispatch(
      EventActions.setTicketTypeDescription(eventId, ticketTypeId, description)
    );

  const setIsUsingPricingTiers = (isUsingPricingTiers: boolean) =>
    dispatch(EventActions.setIsUsingPricingTiers(isUsingPricingTiers));

  const setTicketTypeValues = (values: string) => {
    let numbers = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
    if (values.match(numbers) || values === "") {
      dispatch(EventActions.setTicketTypeValues(eventId, ticketTypeId, values));
    }
  };

  //  React.useEffect(() => {
  //   if(performance && performance?.length === 1){
  //     const eventDay = (performance?.[0].startsAt).toString() as string;
  //     dispatch(
  //       EventActions.addEventDaysOnTicketType(
  //         eventId,
  //         eventDay,
  //         ticketTypeId
  //       ));
  //   }
  //   }, []);

  /** Effects */
  //   React.useEffect(() => {
  //     if(event) {
  //       console.log(event);
  //       const ticketType: ITicketType = EventUtil.ticketType(event, ticketTypeId);
  //       console.log(ticketType);
  //       setIsUsingPricingTiers(ticketType.tiers.length > 1);
  //     }
  //   }, [event]);

  // React.useEffect(() => {
  //   setShowAdvancedOptions(isUsingPricingTiers);
  // }, [isUsingPricingTiers]);

  /** Render */
  const TitleIcon = (
    <Icon
      icon={Icons.TicketSolid}
      color={Colors.Grey1}
      size={14}
      margin="0 7px 0 0"
    />
  );

  const ticketType: ITicketType = EventUtil.ticketType(event, ticketTypeId);

  return (
    <ModalContainer>
      {(() => {
        // if (!event) {
        //   return (
        //     <Container>
        //       <Flex height="300px" align="center" justify="center">
        //         <Loader color={Colors.Orange} size={LoaderSizes.Large} />
        //       </Flex>
        //     </Container>
        //   );
        // }

        if (!ticketType) {
          return (
            <Fragment>
              <ModalHeader
                title="Invalid Ticket"
                close={closeTicketModal}
                icon={TitleIcon}
              />
              <ModalContent>
                <Container>The requested ticket does not exist Event</Container>
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

        const tier = ticketType.tiers[ticketType.tiers.length - 1];
        const isUsingTiers = ticketType?.tiers.length > 1 ?? false;
        const isPaid = EventUtil.isPaid(event);
        const isRSVP = EventUtil.isRSVP(event);
        const used = tier.totalQty - tier.remainingQty;

        const isSeatingPlan =
          event?.seatingChartKey && event?.seatingChartKey.length > 0
            ? true
            : false;

        const addEventDaysOnTicketType = (eventDay: string) => {
          dispatch(
            EventActions.addEventDaysOnTicketType(
              eventId,
              eventDay,
              ticketTypeId
            )
          );
        };

        const removeEventDaysOnTicketType = (eventDay: string) => {
          dispatch(
            EventActions.removeEventDaysOnTicketType(
              eventId,
              eventDay,
              ticketTypeId
            )
          );
        };

        return (
          <Fragment>
            <ModalHeader
              title={ticketType.name}
              close={cancel}
              icon={TitleIcon}
            />
            <ModalContent>
              <Container>
                <Row>
                  <Input
                    autoFocus
                    label="Ticket name"
                    placeholder="General admission"
                    width="270px"
                    value={ticketType.name as string}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setTicketTypeName(e.currentTarget.value)
                    }
                    maxLength={80}
                    disabled={isSeatingPlan}
                  />
                  <Input
                    label="Total qty."
                    placeholder="0"
                    width="90px"
                    disabled={isSeatingPlan}
                    type="number"
                    value={tier.totalQty.toString()}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                      const qty = parseInt(e.currentTarget.value) || 0;
                      const remainingQty = qty - used;
                      setTicketType({
                        totalQty: qty,
                        remainingQty: remainingQty,
                      });
                      setTicketTypeTier(tier._id as string, {
                        totalQty: qty,
                        remainingQty: remainingQty,
                      });
                    }}
                  />
                  {!isUsingTiers && isPaid && (
                    <Fragment>
                      <FormattedInput
                        label="Price"
                        placeholder="0.00"
                        width="120px"
                        inputWidth
                        value={Price.output(tier.price)}
                        onChange={(e: React.FormEvent<HTMLInputElement>) =>
                          setTicketTypeTier(tier._id as string, {
                            price: Price.input(e.currentTarget.value),
                          })
                        }
                        format={InputFormats.Price}
                      />
                    </Fragment>
                  )}
                  <Input
                    label={isPaid ? "Purchase limit" : "RSVP limit"}
                    placeholder="8"
                    width="120px"
                    type="number"
                    value={ticketType.purchaseLimit.toString()}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setTicketTypePurchaseLimit(
                        parseInt(e.currentTarget.value)
                      )
                    }
                  />
                </Row>
                <Spacer/>
                <Row>
                  <TextArea
                    label="Description"
                    subLabel="(optional)"
                    placeholder="Add a description here"
                    width="370px"
                    height="78px"
                    value={ticketType.description as string}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setTicketTypeDescription(e.currentTarget.value)
                    }
                    maxLength={500}
                  />{" "}
                  {isRSVP && (
                    <Fragment>
                      <FormattedInput
                        label="Value"
                        placeholder="0.00"
                        width="100px"
                        value={Price.output(ticketType?.values)}
                        onChange={(e: React.FormEvent<HTMLInputElement>) => 
                            setTicketTypeValues(Price.input(e.currentTarget.value).toString())
                        }
                        format={InputFormats.Price}
                      />
                    </Fragment>
                  )}
                </Row>
                {performance && performance.length > 1 && (
                  <Label
                    text={"Event days"}
                    subText={"(select atleast one day)"}
                  />
                )}
                <Row>
                  <SelectEventDays
                    selected={ticketType.dayIds as any}
                    add={addEventDaysOnTicketType}
                    remove={removeEventDaysOnTicketType}
                  />
                </Row>
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
                  text="SAVE TICKET"
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

// Advaned Options hidden for now
// {(() => {
//   if(isPaid) {
//     return (
//       <Fragment>
//         <Spacer />
//         <TextButton
//           size={TextButtonSizes.Small}
//           onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
//           icon={Icons.RightChevronSolid}
//           iconRotation={showAdvancedOptions ? 90 : 0}
//         >
//           {`Show advanced options${isUsingPricingTiers ? ' (1 active)' : ''}`}
//         </TextButton>
//       </Fragment>
//     );
//   }
// })()}

// Tiers hidden for now
// {(() => {
//   if (showAdvancedOptions && isPaid) {
//     return (
//       <Fragment>
//         {/* <CreateEventTicketTypeFeeOptions
//           ticketType={ticketType}
//         /> */}
//         <CreateEventTicketTypeTiers ticketType={ticketType} />
//       </Fragment>
//     );
//   }
// })()}

export default CreateEventTicketTypeModal;
