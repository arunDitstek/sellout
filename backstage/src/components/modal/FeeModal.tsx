import React from "react";
import { useDispatch, useSelector } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import { useQuery } from "@apollo/react-hooks";
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
  ModalTypes,
} from "./Modal";
import * as Price from "@sellout/utils/.dist/price";
import * as Percentage from "@sellout/utils/.dist/percentage";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import Input from "@sellout/ui/build/components/Input";
import FormattedInput, {
  InputFormats,
} from "@sellout/ui/build/components/FormattedInput";
import Label from "@sellout/ui/build/components/Label";
import { BackstageState } from "../../redux/store";
import TextButton, {
  TextButtonSizes,
} from "@sellout/ui/build/components/TextButton";
import GET_FEE from "@sellout/models/.dist/graphql/queries/fee.query";
import shortid from "shortid";
import { FeeAppliedByEnum, FeePaymentMethodEnum } from "@sellout/models/.dist/interfaces/IFee";
import Error from "../../elements/Error";
import styled from "styled-components";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import { Container } from "../create-event/modal/CreateEventFeeModal";
import Select from "react-select";
import { PaymentMethodTypeEnum } from "@sellout/models/.dist/enums/PaymentMethodTypeEnum";

const defaultFeeState = {
  _id: shortid.generate(),
  name: "Sellout Fee",
  type: "Flat",
  value: 0,
  appliedTo: "Ticket",
  minAppliedToPrice: 0,
  maxAppliedToPrice: 0,
  appliedBy: "Sellout",
  filters: [] as any,
  paymentMethods: [],
};

const filtersArray = [
  { text: "None", value: null },
  { text: "Seated", value: "Seated" },
  { text: "Card Entry", value: "Card Entry" },
  { text: "Card Reader", value: "Card Reader" },
  { text: "Guest ticket", value: "Guest ticket" },
];

type UpdateFeesModalProps = {};
const DeleteModalWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;

const DeleteModalContainer = styled.div`
  width: 500px;
  display: block;
  ${media.mobile`
    width: 100%;
    max-width: 430px;
    margin: 0 auto;
    `};
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-bottom: 10px;
  ${media.tablet`
    flex-wrap: wrap;
  `};
  ${media.mobile`
    flex-wrap: wrap;
  `};
`;

export const MultiSelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const RowWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;

  @media (max-width: 767px) {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 15px;
  }
`;

export const StyledMultiSelect = styled(Select)`
  .select__control {
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: #fff;
    font-size: 16px;
    padding: 8px;
  }

  .select__multi-value {
    background-color: #0077c2;
    border-radius: 4px;
    color: #fff;
    display: inline-block;
    font-size: 14px;
    margin-right: 4px;
    margin-top: 4px;
    padding: 2px 8px;
  }

  .select__multi-value__label {
    color: #fff;
  }
`;

const FeeModal: React.FC<UpdateFeesModalProps> = () => {
  /* State */
  const feeState = useSelector((state: BackstageState) => state.fee);
  const { feeId } = feeState;
  const {
    modal: { modalProps },
  } = useSelector((state: BackstageState) => state.app);
  const { createFee, updateFee, deleteFee, orgId, eventId, seasonId } =
    modalProps[ModalTypes.FeeModal][0];
  let title = feeId ? "Update Fee" : "Create New Fee";
  let cancelText = "Cancel";
  let confirmText = feeId ? "Update Fee" : "Save Fee";
  const [error, setError] = React.useState("");
  const [newFee, setNewFee] = React.useState(defaultFeeState);
  const setNewFeeState = (values: any) => setNewFee({ ...newFee, ...values });

  // Confirm
  const [showConfirm, setShowConfirm] = React.useState(false as boolean);

  /* Actions */
  const dispatch = useDispatch();
  const [selectedOptions, setSelectedOptions] = React.useState([] as any);
  
  const handleChange = (options) => {
    if (options.length > 0) {
      let updatedOption = options.map(function (a) {
        return a.value === "Manual Card Entry" ? "Card Entry" : a.value;
      });
      setSelectedOptions(options);
      setNewFeeState({ paymentMethods: updatedOption });
    } else {
      setSelectedOptions(options);
      setNewFeeState({ paymentMethods: [] });
    }
  };
  const close = () => dispatch(AppActions.popModal());

  // GraphQl
  const { data } = useQuery(GET_FEE, {
    fetchPolicy: "network-only",
    variables: { feeId },
    onCompleted: (data) => {
      setNewFee({
        _id: data?.fee._id,
        name: data?.fee.name,
        type: data?.fee.type,
        value: data?.fee.value,
        appliedTo: data?.fee.appliedTo,
        minAppliedToPrice: data?.fee.minAppliedToPrice,
        maxAppliedToPrice: data?.fee.maxAppliedToPrice,
        appliedBy: data?.fee.appliedBy,
        filters: data?.fee.filters,
        
        paymentMethods: data?.fee.paymentMethods,
      });
      if (data?.fee.paymentMethods && data?.fee.paymentMethods.length > 0) {
        const selectedPayment = data?.fee.paymentMethods.map((item) => {
          return {
            label: item === "Card Entry" ? "Manual Card Entry" : item === "Card Reader" ? "Card Reader (Wifi)" : item,
            value: item === "Card Entry" ? "Manual Card Entry" : item === "Card Reader" ? "Card Reader" : item,
          };
        });
        setSelectedOptions([...selectedPayment]);
      }
    },
    onError: (error) => setError(getErrorMessage(error)),
  });
  const isFlat = newFee.type === "Flat";
  const guestValidation =
    newFee.appliedBy !== "Organization" &&
    newFee?.filters.includes("Guest ticket");
  const percentValidation =
    newFee.appliedBy === "Sellout" &&
    newFee.appliedTo !== "Order" &&
    newFee.type === "Percent";

  React.useEffect(() => {
    if (!guestValidation && !percentValidation) {
      setError("");
    }
  }, [error, guestValidation, percentValidation]);

  /** Render */
  return (
    <>
      <ModalContainer width="1000px" display={showConfirm ? "none" : "block"}>
        <ModalHeader title={title} close={close} />
        <ModalContent>
          <Container>
            <RowWrapper>
              <Input
                width="100%"
                value={newFee?.name as string}
                onChange={(e: React.FormEvent<HTMLInputElement>) =>
                  setNewFeeState({ name: e.currentTarget.value })
                }
                label="Fee name"
              />
              <Dropdown
                value={newFee?.appliedBy}
                width="100%"
                items={[
                  { text: "Organization", value: "Organization" },
                  { text: "Sellout", value: "Sellout" },
                  { text: "Stripe", value: "Stripe" },
                ]}
                onChange={(item: any) => {
                  if (item === FeeAppliedByEnum.Organization) {
                    setNewFeeState({
                      filters: ["Guest ticket"],
                      appliedBy: item,
                    });
                  } else {
                    setNewFeeState({ filters: [], appliedBy: item });
                  }
                }}
                label="Fee applied by"
              />
              <Dropdown
                value={newFee?.appliedTo}
                width="100%"
                items={[
                  { text: "Order", value: "Order" },
                  { text: "Ticket", value: "Ticket" },
                  { text: "Upgrade", value: "Upgrade" },
                ]}
                onChange={(item: any) => setNewFeeState({ appliedTo: item })}
                label="Fee applied to"
              />
              <Dropdown
                value={newFee.filters[0]}
                width="100%"
                items={
                  newFee.appliedBy === FeeAppliedByEnum.Organization
                    ? filtersArray.slice(1)
                    : filtersArray
                }
                onChange={(item: any) =>
                  setNewFeeState({ filters: item ? [item] : [] })
                }
                label="Filters"
              />
              <MultiSelectWrapper>
                <Label text={"Payment method"} />
                <StyledMultiSelect
                  isClearable={false}
                  options={
                    [
                      { label: FeePaymentMethodEnum.CardReaderWifi, value: PaymentMethodTypeEnum.CardReader },
                      { label: FeePaymentMethodEnum.CardReaderBluetooth, value: FeePaymentMethodEnum.CardReaderBluetooth },
                      { label: FeePaymentMethodEnum.CardEntry, value: FeePaymentMethodEnum.CardEntry },
                      { label: FeePaymentMethodEnum.Cash, value: FeePaymentMethodEnum.Cash },
                      { label: FeePaymentMethodEnum.Check, value: FeePaymentMethodEnum.Check },
                    ] as any
                  }
                  isMulti
                  value={selectedOptions}
                  onChange={handleChange}
                />
              </MultiSelectWrapper>
            </RowWrapper>
            <RowWrapper>
              <FormattedInput
                inputWidth
                width="100%"
                label="Min price applied to"
                value={Price.output(newFee?.minAppliedToPrice) as any}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  setNewFeeState({
                    minAppliedToPrice: Price.input(e.currentTarget.value),
                  });
                }}
                format={InputFormats.Price}
              />
              <FormattedInput
                inputWidth
                width="100%"
                label="Max price applied to"
                value={Price.output(newFee?.maxAppliedToPrice) as string}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  setNewFeeState({
                    maxAppliedToPrice: Price.input(e.currentTarget.value),
                  });
                }}
                format={InputFormats.Price}
              />
              <Dropdown
                width="100%"
                value={newFee?.type}
                items={[
                  { text: "Flat", value: "Flat" },
                  { text: "Percent", value: "Percent" },
                ]}
                onChange={(item: any) => {
                  setNewFeeState({ type: item });
                }}
                label="Fee type"
              />
              <FormattedInput
                inputWidth
                width="100%"
                label="Amount"
                value={isFlat ? Price.output(newFee?.value) : newFee?.value}
                onChange={(e: React.FormEvent<HTMLInputElement>) => {
                  setNewFeeState({
                    value: isFlat
                      ? (Price.input(e.currentTarget.value) as string)
                      : Percentage.input(e.currentTarget.value),
                  });
                }}
                format={isFlat ? InputFormats.Price : InputFormats.Percent}
              />
            </RowWrapper>
          </Container>
        </ModalContent>
        <ModalFooter>
          {feeId && (
            <TextButton
              size={TextButtonSizes.Small}
              children="Delete Fee"
              onClick={() => setShowConfirm(true)}
            />
          )}
          <div style={{ padding: "10px" }} />
          <Error>{error}</Error>
          <div style={{ display: "flex" }}>
            <Button
              type={ButtonTypes.Thin}
              state={ButtonStates.Warning}
              text={cancelText}
              margin="0 10px 0 0"
              onClick={() => {
                close();
              }}
            />
            <Button
              type={ButtonTypes.Thin}
              text={confirmText}
              onClick={() => {
                if (guestValidation) {
                  setError("Guest Ticket is only applied to the organization.");
                } else if (percentValidation) {
                  setError(
                    "Sellout percentage fee is only applied to the order."
                  );
                } else if (feeId) {
                  updateFee({
                    variables: {
                      orgId,
                      eventId,
                      seasonId,
                      fee: {
                        ...newFee,
                      },
                    },
                    context: {
                      debounceKey: `UPDATE_FEE_${feeId}`,
                    },
                  });
                  close();
                } else {
                  createFee({
                    variables: {
                      orgId,
                      eventId,
                      seasonId,
                      fee: newFee,
                    },
                  });
                  close();
                }
              }}
            />
          </div>
        </ModalFooter>
      </ModalContainer>
      {showConfirm && (
        <ConfirmActionModal
          title="Delete Confirmation"
          message="Are you sure you want to delete the fee?"
          cancel={() => setShowConfirm(false)}
          // loading={loading || false}
          confirm={() => {
            deleteFee({
              variables: { orgId, feeId, eventId, seasonId },
            });
            close();
          }}
        />
      )}
    </>
  );
};
const ConfirmActionModal = ({
  title = "Are you sure?",
  message,
  confirm,
  confirmText = "CONFIRM",
  cancel,
  cancelText = "CANCEL",
  loading = false,
}) => {
  return (
    <DeleteModalContainer>
      <ModalHeader title={title} close={cancel} />
      <ModalContent padding="10px 20px" backgroundColor="#fff">
        {message}
      </ModalContent>
      <ModalFooter>
        <DeleteModalWrapper>
          {cancel && (
            <Button
              type={ButtonTypes.Thin}
              state={ButtonStates.Warning}
              text={cancelText}
              margin="0 10px 0 0"
              onClick={() => {
                if (cancel) cancel();
              }}
            />
          )}
          <Button
            type={ButtonTypes.Thin}
            text={confirmText}
            onClick={() => {
              if (confirm) confirm();
            }}
            loading={loading}
          />
        </DeleteModalWrapper>
      </ModalFooter>
    </DeleteModalContainer>
  );
};

export default FeeModal;
