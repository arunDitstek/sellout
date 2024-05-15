import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, {
  ButtonTypes,
  ButtonStates,
} from "@sellout/ui/build/components/Button";
import Flex from "@sellout/ui/build/components/Flex";
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { Icons } from "@sellout/ui/build/components/Icon";
import PhoneNumberInput from "@sellout/ui/build/components/PhoneNumberInput";
import Error from "../../elements/Error";
import { Label, Validation } from "@sellout/ui";
import useCustomer from "../../hooks/useCustomer.hook";
import UPDATE_USER_INFO from "@sellout/models/.dist/graphql/mutations/updateUserInfo.mutation";
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import { useMutation } from "@apollo/react-hooks";
import { BackstageState } from "../../redux/store";

const Spacer = styled.div`
  height: 40px;
`;

type UpdateCustomerModalProps = {};

const UpdateCustomerModal: React.FC<UpdateCustomerModalProps> = ({}) => {
  /* State */
  const customerState = useSelector((state: BackstageState) => state.customer);
  const { customerId } = customerState;
  const {
    customer: { user },
  } = useCustomer(customerId);
  const [email, setEmail] = useState(user?.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [validationError, setValidationError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  /* Actions */
  const dispatch = useDispatch();

  const close = () => dispatch(AppActions.popModal());

  const [updateUserInfo, { loading }] = useMutation(UPDATE_USER_INFO, {
    onCompleted(data) {
      dispatch(
        AppActions.showNotification(
          "Your user has been updated successfully.",
          AppNotificationTypeEnum.Success
        )
      );
      close();
    },
    onError(error) {
      setErrorMsg(getErrorMessage(error));
    },
  });

  useEffect(() => {
    const message =
      Validation.email.validate(email)?.error?.message ||
      Validation.phoneNumber.validate(phoneNumber)?.error?.message ||
      "";
    setValidationError(message);
    if (phoneNumber.length === 1) {
      setValidationError("Phone number is required.");
    }
  }, [validationError, email, phoneNumber]);

  /** Render */
  return (
    <ModalContainer width="500px">
      <ModalHeader title={"Update Customer"} close={close} />
      <ModalContent>
        <Input
          label="Email address"
          type="email"
          placeholder="Enter an email address"
          size={InputSizes.Large}
          value={email}
          width="100%"
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            const email = event.currentTarget.value;
            setEmail(email);
          }}
          icon={Icons.EnvelopeLight}
          onClear={() => {
            setEmail("");
            setValidationError("");
          }}
          margin="0px 0px 10px 0px"
          validationError={validationError}
          autoFocus
        />
        <Label text={"Phone Number"} />
        <PhoneNumberInput
          key={5}
          value={phoneNumber}
          onChange={(phoneNumberValue: string) => {
            setPhoneNumber(phoneNumberValue);
          }}
        />
        <Spacer />
        <ModalFooter>
          <div />
          {errorMsg && <Error children={errorMsg} />}
          <Flex>
            <Button
              type={ButtonTypes.Thin}
              state={
                validationError ? ButtonStates.Disabled : ButtonStates.Active
              }
              text={"Update"}
              margin="0 10px 0 0"
              loading={loading}
              onClick={() => {
                updateUserInfo({
                  variables: {
                    _id: user?._id,
                    email,
                    phoneNumber,
                  },
                });
              }}
            />
            <Button
              type={ButtonTypes.Thin}
              state={ButtonStates.Warning}
              text={"Cancel"}
              onClick={() => {
                close();
              }}
            />
          </Flex>
        </ModalFooter>
      </ModalContent>
    </ModalContainer>
  );
};

export default UpdateCustomerModal;
