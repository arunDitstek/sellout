import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../../redux/store";
import * as AppActions from "../../../redux/actions/app.actions";
import { Colors, Icon, Icons, Loader } from "@sellout/ui";
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
import IEventUpgrade from "@sellout/models/.dist/interfaces/IEventUpgrade";
import * as Price from "@sellout/utils/.dist/price";
import SeasonUtil from "@sellout/models/.dist/utils/SeasonUtil";
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

type CreateSeasonUpgradeTypeModalProps = {};

const CreateSeasonUpgradeTypeModal: React.FC<
  CreateSeasonUpgradeTypeModalProps
> = ({}) => {
  /* State */
  const { saveOnChanges } = useModalProps(
    ModalTypes.UpgradeType
  ) as ISaveOnChanges;
  /* Season*/
  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId, seasonCache, upgradeTypeId } = seasonState;
  const season = seasonCache[seasonId];

  /* Actions */
  const dispatch = useDispatch();

  const popModal = () => dispatch(AppActions.popModal());
  const saveEvent = () => {
    dispatch(SeasonActions.saveSeason(false, false));
  };

  const closeUpgradeModal = async () => {
    popModal();
    dispatch(SeasonActions.setUpgradeTypeId(""));
  };

  const saveChanges = async () => {
    const upgradeType: IEventUpgrade = SeasonUtil.upgrade(
      season,
      upgradeTypeId
    );



    const hasChanged = await ChangeUtil.hasSeasonUpgradeTypeChanged(
      season,
      upgradeTypeId
    );

    if (hasChanged && saveOnChanges) {
      saveEvent();
    }
    closeUpgradeModal();
  };

  const discardChanges = async () => {
    const hasToRemoved = await ChangeUtil.hasSeasonToRemoveUpgradeType(
      season,
      upgradeTypeId
    );
    if (hasToRemoved)
      dispatch(
        SeasonActions.removeUpgradeType(seasonId, upgradeTypeId as string)
      );
    // reCacheUpradeType();
    popModal();
  };

  const cancel = async () => {
    const hasChanged = await ChangeUtil.hasSeasonUpgradeTypeChanged(
      season,
      upgradeTypeId
    );
    const hasToRemoved = await ChangeUtil.hasSeasonToRemoveUpgradeType(
      season,
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
      //   if (hasToRemoved)
      //     dispatch(
      //       SeasonActions.removeUpgradeType(seasonId, upgradeTypeId as string)
      //     );
      closeUpgradeModal();
    }
  };

  const setUpgradeType = (upgrade: Partial<IEventUpgrade>) => {
    dispatch(
      SeasonActions.setUpgradeType(seasonId, upgradeTypeId as string, upgrade)
    );
  };

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
        if (!season) {
          return (
            <Container>
              <Loader />
            </Container>
          );
        }

        const upgradeType: IEventUpgrade = SeasonUtil.upgrade(
          season,
          upgradeTypeId
        );

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

        // const isPaid = EventUtil.isPaid(event);
        // const isRSVP = EventUtil.isRSVP(event);
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
                  {/* {isPaid && !upgradeType.complimentary && ( */}
                  {!upgradeType.complimentary && (
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
                    label={"Purchase limit"}
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
                  <Spacer />
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
                {/* <TextButton
                  size={TextButtonSizes.Small}
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  icon={Icons.RightChevronSolid}
                  iconRotation={showAdvancedOptions ? 90 : 0}
                >
                  Show advanced options
                </TextButton> */}
                {/* {(() => {
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
                })()} */}
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

export default CreateSeasonUpgradeTypeModal;
