import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../../redux/store";
import * as AppActions from "../../../redux/actions/app.actions";
import * as EventActions from "../../../redux/actions/event.actions";
import { Colors, Icon, Icons, Loader } from "@sellout/ui";
import Input from "@sellout/ui/build/components/Input";
import FormattedInput, {
  InputFormats,
} from "@sellout/ui/build/components/FormattedInput";
import TextArea from "../../../elements/TextArea";
import TextButton, {
  TextButtonSizes,
} from "@sellout/ui/build/components/TextButton";
import Flex from "@sellout/ui/build/components/Flex";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import CreateEventUpgradeTypeTicketOptions from "./../CreateEventUpgradeTypeTicketOptions";
import CreateEventUpgradeTypeComplimentaryOptions from "./../CreateEventUpgradeTypeComplimentaryOptions";
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import * as Price from "@sellout/utils/.dist/price";
import EventUtil from "@sellout/models/.dist/utils/EventUtil";
import SelectImage, { SelectImageSizes } from "../../SelectImage";
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


type CreateEventUpgradeTypeModalProps = {};

const CreateEventUpgradeTypeModal: React.FC<
  CreateEventUpgradeTypeModalProps
> = ({}) => {
  /* State */
  const eventState = useSelector((state: BackstageState) => state.event);
  const { saveOnChanges } = useModalProps(
    ModalTypes.UpgradeType
  ) as ISaveOnChanges;

  const { eventId, upgradeTypeId, eventsCache } = eventState;
  const event = eventsCache[eventId];
  const [showAdvancedOptions, setShowAdvancedOptions] = React.useState(false);

  /* Actions */
  const dispatch = useDispatch();

  const popModal = () => dispatch(AppActions.popModal());
  const saveEvent = () => {
    dispatch(EventActions.saveEvent(false, false));
  };
  const reCacheUpradeType = () =>
    dispatch(EventActions.reCacheUpgradeType(eventId, upgradeTypeId));

  const closeUpgradeModal = async () => {
    popModal();
    dispatch(EventActions.setUpgradeTypeId(""));
  };

  const saveChanges = async () => {
    const upgradeType: IEventUpgrade = EventUtil.upgrade(event, upgradeTypeId);

    const isPaid = EventUtil.isPaid(event);
    const validate = EventUtil.validateUpgrade(
      upgradeType as IEventUpgrade,
      isPaid as Boolean
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
    const hasChanged = await ChangeUtil.hasUpgradeTypeChanged(
      event,
      upgradeTypeId
    );

    if (hasChanged && saveOnChanges) {
      saveEvent();
    }
    closeUpgradeModal();
  };

  const discardChanges = async () => {
    const hasToRemoved = await ChangeUtil.hasToRemoveUpgradeType(
      event,
      upgradeTypeId
    );
    if (hasToRemoved)
      dispatch(
        EventActions.removeUpgradeType(eventId, upgradeTypeId as string)
      );
    reCacheUpradeType();
    popModal();
    popModal();
  };

  const cancel = async () => {
    const hasChanged = await ChangeUtil.hasUpgradeTypeChanged(
      event,
      upgradeTypeId
    );
    const hasToRemoved = await ChangeUtil.hasToRemoveUpgradeType(
      event,
      upgradeTypeId
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
          EventActions.removeUpgradeType(eventId, upgradeTypeId as string)
        );
      closeUpgradeModal();
    }
  };

  const setUpgradeType = (upgrade: Partial<IEventUpgrade>) => {
    dispatch(
      EventActions.setUpgradeType(eventId, upgradeTypeId as string, upgrade)
    );
  };

  // let upgradeType: IEventUpgrade | null = null;
  // React.useLayoutEffect(() => {
  //   const isUsingAdvancedOptions = Boolean(EventUtil.isUpgradeForSpecificTickets(event, upgradeType as IEventUpgrade) || upgradeType?.complimentary);
  //   setShowAdvancedOptions(isUsingAdvancedOptions);
  // }, [event, upgradeType]);

  /** Render */

  const TitleIcon = (
    <Icon
      icon={Icons.UpgradeSolid}
      color={Colors.Grey1}
      size={14}
      margin="0 7px 0 0"
    />
  );

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

        const upgradeType: IEventUpgrade = 
          EventUtil.upgrade(event, upgradeTypeId)


        if (!upgradeType) {
          return (
            <Fragment>
              <ModalHeader
                title="Invalid Upgrade"
                close={closeUpgradeModal}
                icon={TitleIcon}
              />
              <ModalContent>
                <Container>The requested upgrade does not exist</Container>
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

        const isPaid = EventUtil.isPaid(event);
        const isRSVP = EventUtil.isRSVP(event);
        const used = upgradeType.totalQty - upgradeType.remainingQty;
        return (
          <Fragment>
            <ModalHeader
              title={upgradeType.name}
              close={cancel}
              icon={TitleIcon}
            />
            <ModalContent>
              <Container>
                <Row>
                  <Input
                    autoFocus
                    label="Upgrade name"
                    placeholder="Camping Pass"
                    width="270px"
                    value={upgradeType.name as string}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setUpgradeType({ name: e.currentTarget.value })
                    }
                    maxLength={80}
                  />
                  <Input
                    label="Total qty."
                    placeholder="0"
                    width="90px"
                    type="number"
                    value={upgradeType.totalQty.toString()}
                    onChange={(e: React.FormEvent<HTMLInputElement>) => {
                      const qty = parseInt(e.currentTarget.value) || 0;
                      const remainingQty = qty - used;
                      setUpgradeType({
                        totalQty: qty,
                        remainingQty: remainingQty,
                      });
                    }}
                  />
                  {isPaid && !upgradeType.complimentary && (
                    <Fragment>
                      <FormattedInput
                        label="Price"
                        placeholder="0.00"
                        width="120px"
                        inputWidth
                        value={Price.output(upgradeType.price)}
                        onChange={(e: React.FormEvent<HTMLInputElement>) =>
                          setUpgradeType({
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
                    value={upgradeType.purchaseLimit.toString()}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setUpgradeType({
                        purchaseLimit: parseInt(e.currentTarget.value),
                      })
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
                    value={upgradeType.description as string}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setUpgradeType({
                        description: e.currentTarget.value,
                      })
                    }
                    maxLength={500}
                  />
                  <SelectImage
                    imageUrl={upgradeType.imageUrl}
                    setImageUrl={(imageUrl: string) => {
                      setUpgradeType({
                        imageUrl,
                      });
                    }}
                    size={SelectImageSizes.Regular}
                    label="Image"
                    subLabel="(optional)"
                  />
                </Row>
                <TextButton
                  size={TextButtonSizes.Small}
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  icon={Icons.RightChevronSolid}
                  iconRotation={showAdvancedOptions ? 90 : 0}
                >
                  Show advanced options
                </TextButton>
                {(() => {
                  if (showAdvancedOptions) {
                    return (
                      <Fragment>
                        <CreateEventUpgradeTypeTicketOptions
                          upgradeType={upgradeType}
                        />
                        <CreateEventUpgradeTypeComplimentaryOptions
                          upgradeType={upgradeType}
                        />
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
                  text="SAVE UPGRADE"
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

export default CreateEventUpgradeTypeModal;
