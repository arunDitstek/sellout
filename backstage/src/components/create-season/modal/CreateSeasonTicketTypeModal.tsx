import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../../redux/store";
import * as AppActions from "../../../redux/actions/app.actions";
import { Colors, Icon, Icons, Loader, LoaderSizes } from "@sellout/ui";
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
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "../../modal/Modal";
import * as ChangeUtil from "../../../utils/ChangeUtil";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
import * as SeasonActions from "../../../redux/actions/season.actions";

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


type CreateSeasonTicketTypeModalProps = {};

const CreateSeasonTicketTypeModal: React.FC<
  CreateSeasonTicketTypeModalProps
> = ({}) => {
  /* State */


  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId, seasonCache } = seasonState;
  const ticketTypeId = seasonState.ticketTypeId;
  const season = seasonCache[seasonId];
  /* Actions */
  const dispatch = useDispatch();

  const popModal = () => dispatch(AppActions.popModal());
  const saveSeason = () => dispatch(SeasonActions.saveSeason(false, false));
  const reCacheTicketType = () =>
    dispatch(SeasonActions.reCacheTicketType(seasonId, ticketTypeId));

  const closeTicketModal = async () => {
    popModal();
    dispatch(SeasonActions.setTicketTypeId(""));
  };

  const saveChanges = async () => {
    const ticketType: ITicketType = SeasonUtil.ticketType(season, ticketTypeId);

    // const validate = EventUtil.validateTicket(
    //   ticketType as ITicketType,
    //   isPaid as Boolean,
    //   isMultipleDays as boolean
    // );
    //     const validationErrors =
    //       validate?.error?.details?.map((detail: any) => detail.message) ?? [];
    //    if (validationErrors.length > 0) {
    //      dispatch(
    //        AppActions.showNotification(
    //          validationErrors.join("\n"),
    //          AppNotificationTypeEnum.Error
    //        )
    //      );
    //      return;
    //    }
    const hasChanged = await ChangeUtil.hasSeasonTicketTypeChanged(
      season,
      ticketTypeId
    );
    if (hasChanged) {
      saveSeason();
    }
    closeTicketModal();
  };

  const discardChanges = async () => {
    const hasToRemoved = await ChangeUtil.hasSeasonToRemoveTicketType(
      season,
      ticketTypeId
    );
    if (hasToRemoved)
      dispatch(
        SeasonActions.removeTicketType(seasonId, ticketTypeId as string)
      );
    reCacheTicketType();
    popModal();
  };

  const cancel = async () => {
    const hasChanged = await ChangeUtil.hasSeasonTicketTypeChanged(
      season,
      ticketTypeId
    );
    const hasToRemoved = await ChangeUtil.hasSeasonToRemoveTicketType(
      season,
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
          SeasonActions.removeTicketType(seasonId, ticketTypeId as string)
        );
      closeTicketModal();
    }
  };

  const setTicketTypeName = (name: string) =>
    dispatch(SeasonActions.setTicketTypeName(seasonId, ticketTypeId, name));

  const setTicketType = (ticketType: Partial<ITicketType>) =>
    dispatch(SeasonActions.setTicketType(seasonId, ticketTypeId, ticketType));

  const setTicketTypeTier = (tierId: string, tier: Partial<ITicketTier>) => {
    dispatch(
      SeasonActions.setTicketTypeTier(seasonId, ticketTypeId, tierId, tier)
    );
  };
  const setTicketTypePurchaseLimit = (purchaseLimit: number) =>
    dispatch(
      SeasonActions.setTicketTypePurchaseLimit(
        seasonId,
        ticketTypeId,
        purchaseLimit
      )
    );

  const setTicketTypeDescription = (description: string) =>
    dispatch(
      SeasonActions.setTicketTypeDescription(
        seasonId,
        ticketTypeId,
        description
      )
    );

  const setIsUsingPricingTiers = (isUsingPricingTiers: boolean) =>
    dispatch(SeasonActions.setIsUsingPricingTiers(isUsingPricingTiers));

  const setTicketTypeValues = (values: string) => {
    let numbers = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
    if (values.match(numbers) || values === "") {
      dispatch(
        SeasonActions.setTicketTypeValues(seasonId, ticketTypeId, values)
      );
    }
  };


  /** Render */
  const TitleIcon = (
    <Icon
      icon={Icons.TicketSolid}
      color={Colors.Grey1}
      size={14}
      margin="0 7px 0 0"
    />
  );

  const ticketType: ITicketType = SeasonUtil.ticketType(season, ticketTypeId);

  return (
    <ModalContainer>
      {(() => {
        if (!season) {
          return (
            <Container>
              <Flex height="300px" align="center" justify="center">
                <Loader color={Colors.Orange} size={LoaderSizes.Large} />
              </Flex>
            </Container>
          );
        }

        if (!ticketType) {
          return (
            <Fragment>
              <ModalHeader
                title="Invalid Ticket"
                close={closeTicketModal}
                icon={TitleIcon}
              />
              <ModalContent>
                <Container>
                  The requested ticket does not exist season
                </Container>
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
        // const isPaid = EventUtil.isPaid(event);
        // const isRSVP = EventUtil.isRSVP(event);
        const used = tier.totalQty - tier.remainingQty;

        const isSeatingPlan =
          season?.seatingChartKey && season?.seatingChartKey.length > 0
            ? true
            : false;

        // const addEventDaysOnTicketType = (eventDay: string) => {
        //   dispatch(
        //     SeasonActions.addEventDaysOnTicketType(
        //       seasonId,
        //       eventDay,
        //       ticketTypeId
        //     )
        //   );
        // };

        // const removeEventDaysOnTicketType = (eventDay: string) => {
        //   dispatch(
        //     SeasonActions.removeEventDaysOnTicketType(
        //       seasonId,
        //       eventDay,
        //       ticketTypeId
        //     )
        //   );
        // };

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
                  {!isUsingTiers && (
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
                    label={"Purchase limit"}
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
                <Spacer />
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
                  <Spacer />
                </Row>
                <Spacer />
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

export default CreateSeasonTicketTypeModal;
