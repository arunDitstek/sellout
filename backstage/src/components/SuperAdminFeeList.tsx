import React, { useEffect } from "react";
import styled from "styled-components";
import Button, {
  ButtonStates,
  ButtonTypes,
} from "@sellout/ui/build/components/Button";
import * as Price from "@sellout/utils/.dist/price";
import * as Percentage from "@sellout/utils/.dist/percentage";
import { Flex } from "@sellout/ui";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import Input from "@sellout/ui/build/components/Input";
import FormattedInput, {
  InputFormats,
} from "@sellout/ui/build/components/FormattedInput";
import TextButton, {
  TextButtonSizes,
} from "@sellout/ui/build/components/TextButton";
import Label from "@sellout/ui/build/components/Label";
import APPLY_PLATFORM_FEES_TO_ALL_ORGANIZATIONS from "@sellout/models/.dist/graphql/mutations/applyPlatformFeesToAllOrganizations.mutation";
import shortid from "shortid";
import { useMutation } from "@apollo/react-hooks";
import { MultiSelectWrapper, StyledMultiSelect } from "../pages/FeesList";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
import { useDispatch } from "react-redux";
import * as AppActions from "../redux/actions/app.actions";
import LIST_PLATFORM_FEES from "@sellout/models/.dist/graphql/queries/platformFees.query";

const Container = styled.div``;

const FeesContainer = styled.div`
  margin: 20px 0px;
`;

const FeeContainer = styled.div`
  width: 100%;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.05);
  padding: 10px;
  margin-bottom: 15px;
  box-sizing: border-box;
`;

type FeeProps = {
  fee?: any;
  setFee?: any;
  deleteFee?: any;
};

const Fee: React.FC<FeeProps> = ({ fee, setFee, deleteFee }) => {
  let { value, paymentMethods } = fee;
  const isFlat = fee.type === "Flat";

  if (isFlat) {
    value = Price.output(value);
  }

  const [selectedOptions, setSelectedOptions] = React.useState([] as any);
  const handleChange = (options) => {
    if (options.length > 0) {
      let updatedOption = options.map(function (a) {
        return a.value === "Manual Card Entry" ? "Card Entry" : a.value;
      });
      setSelectedOptions(options);
      setFee({ paymentMethods: updatedOption });
    } else {
      setSelectedOptions(options);
      setFee({ paymentMethods: [] });
    }
  };

  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0) {
      const selectedPayment = paymentMethods.map((item) => {
        return {
          label: item === "Card Entry" ? "Manual Card Entry" : item,
          value: item === "Card Entry" ? "Manual Card Entry" : item,
        };
      });
      setSelectedOptions([...selectedPayment]);
    }
  }, []);

  return (
    <FeeContainer>
      {/** TOP ROW */}
      <Flex>
        <Flex flex="1">
          <Input
            value={fee.name}
            width="100%"
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              setFee({ name: e.currentTarget.value })
            }
            label="Fee name"
          />
        </Flex>
        <Flex flex="0.1" />
        <Flex flex="1">
          <Dropdown
            value={fee.appliedBy}
            width="100%"
            items={[
              { text: "Organization", value: "Organization" },
              { text: "Sellout", value: "Sellout" },
              { text: "Stripe", value: "Stripe" },
            ]}
            onChange={(item: any) => setFee({ appliedBy: item })}
            label="Fee applied by"
          />
        </Flex>
        <Flex flex="0.1" />
        <Flex flex="1">
          <Dropdown
            value={fee.appliedTo}
            width="100%"
            items={[
              { text: "Order", value: "Order" },
              { text: "Ticket", value: "Ticket" },
              { text: "Upgrade", value: "Upgrade" },
            ]}
            onChange={(item: any) => setFee({ appliedTo: item })}
            label="Fee applied to"
          />
        </Flex>
        <Flex flex="0.1" />
        <Flex flex="1">
          <Dropdown
            value={fee.filters[0]}
            width="100%"
            items={[
              { text: "None", value: null },
              { text: "Seated", value: "Seated" },
              { text: "Card Entry", value: "Card Entry" },
              { text: "Card Reader", value: "Card Reader" },
              { text: "Guest ticket", value: "Guest ticket" },
            ]}
            onChange={(item: any) => setFee({ filters: item ? [item] : [] })}
            label="Filters"
          />
        </Flex>
        <Flex flex="0.1" />
        <Flex flex="1">
          <MultiSelectWrapper>
            <Label text={"Payment method"} />
            <StyledMultiSelect
              isClearable={false}
              options={
                [
                  { label: "Card Reader", value: "Card Reader" },
                  { label: "Manual Card Entry", value: "Manual Card Entry" },
                  { label: "Cash", value: "Cash" },
                  { label: "Check", value: "Check" },
                ] as any
              }
              isMulti
              value={selectedOptions}
              onChange={handleChange}
            />
          </MultiSelectWrapper>
        </Flex>
        <Flex flex="0.1" />
      </Flex>

      {/** BOTTOM ROW */}
      <Flex margin="15px 0px 0px">
        <Flex flex="1">
          <FormattedInput
            label="Min price applied to"
            width="100%"
            value={Price.output(fee.minAppliedToPrice)}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              setFee({
                minAppliedToPrice: Price.input(e.currentTarget.value),
              });
            }}
            format={InputFormats.Price}
          />
        </Flex>
        <Flex flex="0.1" />
        <Flex flex="1">
          <FormattedInput
            label="Max price applied to"
            width="100%"
            value={Price.output(fee.maxAppliedToPrice)}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              setFee({
                maxAppliedToPrice: Price.input(e.currentTarget.value),
              });
            }}
            format={InputFormats.Price}
          />
        </Flex>
        <Flex flex="0.1" />
        <Flex flex="1">
          <Dropdown
            value={fee.type}
            width="100%"
            items={[
              { text: "Flat", value: "Flat" },
              { text: "Percent", value: "Percent" },
            ]}
            onChange={(item: any) => setFee({ type: item })}
            label="Fee type"
          />
        </Flex>
        <Flex flex="0.1" />
        <Flex flex="1">
          <FormattedInput
            label="Amount"
            width="100%"
            value={value}
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              setFee({
                value: isFlat
                  ? Price.input(e.currentTarget.value)
                  : Percentage.input(e.currentTarget.value),
              });
            }}
            format={isFlat ? InputFormats.Price : InputFormats.Percent}
          />
        </Flex>
        <Flex flex="0.1" />
      </Flex>
      {fee._id && (
        <TextButton
          size={TextButtonSizes.Small}
          children="Delete Fee"
          margin="10px 0px 0px 0px"
          onClick={() => deleteFee(fee._id)}
        />
      )}
    </FeeContainer>
  );
};

const defaultFeeState = {
  _id: shortid.generate(),
  name: "Sellout Fee",
  type: "Flat",
  value: 100,
  appliedTo: "Ticket",
  minAppliedToPrice: 0,
  maxAppliedToPrice: 1000,
  appliedBy: "Sellout",
  filters: [],
};

type SuperAdminFeeListProps = {
  fees?: any;
  disableButton?: boolean;
  createFee?: any;
  updateFee?: any;
  deleteFee?: any;
  orgId?: any;
};

const SuperAdminFeeList: React.FC<SuperAdminFeeListProps> = ({
  fees,
  createFee,
  updateFee,
  deleteFee,
  orgId,
}) => {
  /** Hooks */
  const dispatch = useDispatch();
  const [showCreateNew, setShowCreateNew] = React.useState(false);
  const [newFee, setNewFee] = React.useState(defaultFeeState);
  const setNewFeeState = (values: any) => setNewFee({ ...newFee, ...values });
  // const [disableButton, setDisableButton] = React.useState(false);
  /** GraphQL */
  const [applyPlatformFeesToAllOrganizations, { loading }] = useMutation(
    APPLY_PLATFORM_FEES_TO_ALL_ORGANIZATIONS,
    {
      onCompleted(data) {
        dispatch(
          AppActions.showNotification(
            "Platform fees applied successfully.",
            AppNotificationTypeEnum.Success
          )
        );
      },
      refetchQueries: [
        {
          query: LIST_PLATFORM_FEES,
        },
      ],
      awaitRefetchQueries: true,
      // setDisableButton(false)
    }
  );

  // React.useEffect(() => {
  //   if (fees.length > 0) {
  //     const isApplyPlatformFee = fees?.some(item => item.isApplyPlatformFee === false)
  //     setDisableButton(isApplyPlatformFee);
  //   }
  // }, [fees]);

  /* Render */
  return (
    <Container>
      {showCreateNew ? (
        <Container>
          <Label text={"Create new fee"} />
          <Fee fee={newFee} setFee={setNewFeeState} />
          <Flex>
            <Button
              type={ButtonTypes.Thin}
              text="Save fee"
              margin="0px 10px 0px 0px"
              onClick={async () => {
                await createFee({
                  variables: {
                    orgId,
                    fee: newFee,
                  },
                });
                setShowCreateNew(false);
              }}
            />
            <Button
              type={ButtonTypes.Thin}
              state={ButtonStates.Warning}
              text="Don't Save"
              onClick={() => {
                setShowCreateNew(false);
              }}
            />
          </Flex>
        </Container>
      ) : (
        <Flex>
          <Button
            type={ButtonTypes.Thin}
            text="Create New Fee"
            onClick={() => {
              setShowCreateNew(true);
            }}
            margin="0 10px 0 0"
          />
          {!orgId && (
            <Button
              type={ButtonTypes.Thin}
              loading={loading}
              // state={!disableButton ? ButtonStates.Disabled : ButtonStates.Active}
              state={ButtonStates.Active}
              text="Apply Platform Fees to All Organizations"
              onClick={() => {
                applyPlatformFeesToAllOrganizations();
                // setDisableButton(true)
              }}
            />
          )}
        </Flex>
      )}
      <FeesContainer>
        {[...fees].reverse().map((fee) => (
          <Fee
            key={fee._id}
            fee={fee}
            setFee={(newFee: any) => {
              updateFee({
                variables: {
                  orgId,
                  fee: {
                    _id: fee._id,
                    ...newFee,
                  },
                },
                context: {
                  debounceKey: `UPDATE_FEE_${fee._id}`,
                },
              });
            }}
            deleteFee={(feeId: string) => {
              deleteFee({
                variables: {
                  orgId,
                  feeId,
                },
              });
            }}
          />
        ))}
      </FeesContainer>
    </Container>
  );
};

export default SuperAdminFeeList;
