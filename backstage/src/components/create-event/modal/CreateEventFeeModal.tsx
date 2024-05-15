import React, { Fragment } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { BackstageState } from "../../../redux/store";
import * as AppActions from "../../../redux/actions/app.actions";
import * as FeeActions from "../../../redux/actions/fee.actions";
import { Colors, Icon, Icons, Loader } from "@sellout/ui";
import Input from "@sellout/ui/build/components/Input";
import FormattedInput, {
  InputFormats,
} from "@sellout/ui/build/components/FormattedInput";
import Flex from "@sellout/ui/build/components/Flex";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import IFee, { FeeTypeEnum } from "@sellout/models/.dist/interfaces/IFee";
import * as Price from "@sellout/utils/.dist/price";
import * as Percentage from "@sellout/utils/.dist/percentage";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "../../modal/Modal";
import * as ChangeUtil from "../../../utils/ChangeUtil";
import FeeUtil from "@sellout/models/.dist/utils/FeeUtil";
import { AppNotificationTypeEnum } from "../../../models/interfaces/IAppNotification";
import { VariantEnum } from "../../../../src/models/enums/VariantEnum";
import { media } from "@sellout/ui/build/utils/MediaQuery";

export const Container = styled.div`
  position: relative;
  width: 700px;
  ${media.tablet`
    width: 100% !important;
  `};
  ${media.mobile`
    width: 100% !important;
  `};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  ${media.tablet`
    flex-wrap: wrap;
    gap: 15px;
  `};
  ${media.mobile`
    flex-wrap: wrap;
    gap: 15px;
  `};
`;

const Spacer = styled.div`
  width: 20px;
  height: 20px;
`;

const Text = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey4};
  margin-left: 10px;
  margin-bottom: 10px;
`;

type CreateEventFeeModalProps = {};

const CreateEventFeeModal: React.FC<CreateEventFeeModalProps> = ({ }) => {
  /* State */
  const feeState = useSelector((state: BackstageState) => state.fee);
  const eventState = useSelector((state: BackstageState) => state.event);
  const { feeId, feesCache } = feeState;
  const { eventId } = eventState;

  const seasonState = useSelector((state: BackstageState) => state.season);
  const { seasonId } = seasonState;

  const fee = feesCache && feesCache[feeId];

  const firstPath = window.location.pathname.split("/")[1];
  const isEvent = firstPath === "create-event";
  const isSeason = firstPath === "create-season";

  /* Actions */
  const dispatch = useDispatch();
  const type = isEvent ? VariantEnum.Event : VariantEnum.Season;
  const id = isEvent ? eventId : seasonId;

  const popModal = () => {
    dispatch(AppActions.popModal());
    // dispatch(FeeActions.setFeeId(""));
  };
  const saveFee = () => dispatch(FeeActions.saveFee(id, type));
  const reCacheUpradeType = () => dispatch(FeeActions.reCacheFee(feeId));

  const closeFeeModal = () => {
    popModal();
    // dispatch(FeeActions.setFeeId(""));
  };

  const saveChanges = async () => {
    const validate = FeeUtil.validateFee(fee as IFee);
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
    const hasChanged = await ChangeUtil.hasFeeChanged(fee);
    if (hasChanged) {
      saveFee();
    }
    closeFeeModal();
  };

  const discardChanges = () => {
    reCacheUpradeType();
    popModal();
    popModal();
  };

  const cancel = async () => {
    const hasChanged = await ChangeUtil.hasFeeChanged(fee);
    if (hasChanged) {
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
      closeFeeModal();
    }
  };

  const setFee = (fee: Partial<IFee>) => {
    dispatch(FeeActions.setFee(feeId, fee));
  };
  /** Render */
  const TitleIcon = (
    <Icon
      icon={Icons.FeeSolid}
      color={Colors.Grey1}
      size={14}
      margin="0 7px 0 0"
    />
  );

  const types = Object.values(FeeTypeEnum).map((type: FeeTypeEnum) => {
    return {
      text: type,
      value: type,
    };
  });
  return (
    <ModalContainer>
      {(() => {
        if (!fee) {
          return (
            <Container>
              <Loader />
            </Container>
          );
        }

        const isFlat = fee.type === FeeTypeEnum.Flat;

        return (
          <Fragment>
            <ModalHeader title={fee.name} close={cancel} icon={TitleIcon} />
            <ModalContent>
              <Container>
                <Row>
                  <Input
                    autoFocus
                    label="Fee Name"
                    placeholder="Camping Pass"
                    width="270px"
                    value={fee.name as string}
                    onChange={(e: React.FormEvent<HTMLInputElement>) =>
                      setFee({ name: e.currentTarget.value })
                    }
                    maxLength={80}
                  />
                  <Dropdown
                    label="Code type"
                    value={`${fee.type}`}
                    width="116px"
                    items={types}
                    onChange={(type: FeeTypeEnum) => {
                      setFee({
                        type,
                      });
                    }}
                  />
                  <Flex align="flex-end">
                    <FormattedInput
                      label="Price"
                      placeholder={isFlat ? "0.00" : "10"}
                      width="95px"
                      value={isFlat ? Price.output(fee.value) : fee.value}
                      onChange={(e: React.FormEvent<HTMLInputElement>) =>
                        setFee({
                          value: isFlat
                            ? Price.input(e.currentTarget.value)
                            : Percentage.input(e.currentTarget.value),
                        })
                      }
                      format={
                        isFlat ? InputFormats.Price : InputFormats.Percent
                      }
                    />

                    {/* <Text>/&nbsp;&nbsp;order</Text> */}
                  </Flex>
                  <Spacer />
                  <Dropdown
                    label="Applied to"
                    value={`${fee.appliedTo}`}
                    width="116px"
                    items={[
                      { text: "Per Order", value: "Order" },
                      { text: "Per Ticket", value: "Ticket" },
                    ]}
                    onChange={(item: any) => {
                      setFee({
                        appliedTo: item,
                      });
                    }}

                  />
                  <Spacer />
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
                  text="SAVE FEE"
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

export default CreateEventFeeModal;
