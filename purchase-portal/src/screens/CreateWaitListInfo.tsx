import React, { useState } from "react";
import { Button, Colors, Icons, Input, PhoneNumberInput } from "@sellout/ui";
import styled from "styled-components";
import { Container, Content } from "./UserEmail";
import { PhoneNumberInputSizes } from "@sellout/ui/build/components/PhoneNumberInput";
import { useMutation } from "@apollo/react-hooks";
import * as Validation from "@sellout/ui/build/utils/Validation";
import { ErrorKeyEnum } from "../redux/reducers/app.reducer";
import * as AppActions from "../redux/actions/app.actions";
import { ButtonStates, ButtonTypes } from "@sellout/ui/build/components/Button";
import GlobalError from "../components/GlobalError";
import { PurchasePortalState } from "../redux/store";
import { useSelector, useDispatch } from "react-redux";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import CREATE_WAIT_LIST from "@sellout/models/.dist/graphql/mutations/createWaitList.mutation";
import { getErrorMessage } from "../utils/ErrorUtil";
import Error from "../components/Error";
import ScreenHeader from "../components/ScreenHeader";


export const Spacer = styled.div`
  height: 20px;
`;

export const FullContainer = styled(Container)`
  width: 100%;
  box-sizing: border-box;
  height: 500px;
`;

export const ButtonContainer = styled.div`
  margin: 0 24px;
`;
const WaitContent = styled(Content)`
  height: 380px;
  h2 {
    font-size: 1.6rem;
    line-height: 2.4rem;
    font-weight: 600;
    color: #333333;
  }
`;
type EventWaitListProps = {
  event?: IEventGraphQL;
  setUserName?:any
};
const CreateWaitListInfo: React.FC<EventWaitListProps> = ({ event,setUserName }) => {
  const initialInfoWaitList = {
    name: '',
    email: '',
    phoneNumber: '',
  };

  /** State */
  const [infoWaitList, setInfoWaitList] = useState({
    name: "",
    phoneNumber: "",
    email: "",
  });
  const [error, setErrors] = React.useState("");
  const { app } = useSelector((state: PurchasePortalState) => state);
  const { errors } = app;
  const emailError = errors[ErrorKeyEnum.WaitList];
  const phoneNumberError = errors[ErrorKeyEnum.UserPhoneNumber];


  /**actions */
  const dispatch = useDispatch();
  const setError = (key: ErrorKeyEnum, errorMsg: string) =>
    dispatch(AppActions.setError(key, errorMsg));

  const handleInputChange = (
    key: keyof typeof infoWaitList,
    value: string | number
  ) => {
    setInfoWaitList((prevInfo) => ({
      ...prevInfo,
      [key]: value,
    }));
    setUserName(infoWaitList.name)
  };
  const resetForm = () => {
    setInfoWaitList({ ...initialInfoWaitList });
  };


/** GraphQL **/

  const [handleSubmit, { loading }] = useMutation(CREATE_WAIT_LIST, {
    onCompleted(data) {
      resetForm();
      dispatch(AppActions.SetWaitingInfo(true));
      
    },
    onError: (error) => setErrors(getErrorMessage(error)),
  });

  return (
    <FullContainer>
      <WaitContent>
      <ScreenHeader title={"Wait List"} padding="0px 0px 20px;" />
        <Input
        autoFocus
          label="Name"
          placeholder="Name"
          value={infoWaitList.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const name = e.currentTarget.value;
            handleInputChange("name", name);
          }}
          width="100%"
          margin="0px 0px 10px 0px"

        />
        <Input
          type="email"
          label="Email address"
          placeholder="Email address"
          value={infoWaitList.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const email = e.currentTarget.value;
            const message =
              Validation.email.validate(email)?.error?.message || "";
            handleInputChange("email", email);
            email
              ? setError(ErrorKeyEnum.WaitList, message)
              : setError(ErrorKeyEnum.WaitList, "");
          }}
          icon={Icons.EnvelopeLight}
          margin="0px 0px 10px 0px"
          validationError={emailError}
        />
        <PhoneNumberInput
          label="Phone number"
          phoneNumberInputSize={PhoneNumberInputSizes.Regular}
          value={infoWaitList.phoneNumber}
          onChange={(phoneNumber: number) => {
            const message =
              Validation.phoneNumber.validate(phoneNumber)?.error?.message ||
              "";
            handleInputChange("phoneNumber", phoneNumber);
            setError(ErrorKeyEnum.UserPhoneNumber, message);
            setError(ErrorKeyEnum.UserProfileError, "");
          }}
          validationError={phoneNumberError}
        />
        <GlobalError />
     { error && <Error margin="20px 0px 0px 0px">{error}</Error>}

      </WaitContent>
      {/* <Spacer /> */}
      <ButtonContainer>
        <Button
          type={ButtonTypes.Next}
          text="Submit"
          state={
            infoWaitList.name === "" ||
            emailError !== "" ||
            phoneNumberError !== ""
              ? ButtonStates.Disabled
              : ButtonStates.Active
          }
          bgColor={Colors.Orange}
          textColor={Colors.White}
          onClick={() => {
            handleSubmit({
              variables: {
                params: {
                  name: infoWaitList.name,
                  email: infoWaitList.email,
                  phoneNumber: infoWaitList.phoneNumber
                },
                eventId: event?._id,
                type: "createWaitList"
              }
            });
          }}
          loading={loading}
        />
      </ButtonContainer>
    </FullContainer>
    );
};
export default CreateWaitListInfo;
