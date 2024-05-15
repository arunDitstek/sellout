import React from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { Colors } from "@sellout/ui/build/Colors";
import { Icons } from "@sellout/ui/build/components/Icon";
import ScreenHeader from "../components/ScreenHeader";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import ICreateUserParams from "../models/interfaces/ICreateUserParams";
import * as AppActions from "../redux/actions/app.actions";
import * as UserActions from "../redux/actions/user.actions";
import PhoneNumberInput, {
  PhoneNumberInputSizes,
} from "@sellout/ui/build/components/PhoneNumberInput";
import { ErrorKeyEnum } from "../redux/reducers/app.reducer";
import * as Validation from "@sellout/ui/build/utils/Validation";
import GlobalError from "./../components/GlobalError";

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
`;

const Content = styled.div`
  margin: 24px 0 0;
  padding: 0 24px;
`;

const ErrorMessage = styled.p`
  color: red;
`;

type UserInfoProps = {
  event?: IEventGraphQL;
};

const UserInfo: React.FC<UserInfoProps> = ({ event }) => {
  /** State **/
  const [showVerify, setShowVerify] = React.useState(false);
  /** State **/
  const { app, user } = useSelector((state: PurchasePortalState) => state);
  const {
    createUserParams: { firstName, lastName, phoneNumber },
  } = user;

  const { screen, errors, loading } = app;

  const fullNameError = errors[ErrorKeyEnum.UserFullName];
  const phoneNumberError = errors[ErrorKeyEnum.UserPhoneNumber];

  /** Actions **/
  const dispatch = useDispatch();
  const setCreateUserParams = (params: Partial<ICreateUserParams>) =>
    dispatch(UserActions.setCreateUserParams(params));
  const setError = (key: ErrorKeyEnum, errorMsg: string) =>
    dispatch(AppActions.setError(key, errorMsg));

  /** GraphQL **/

  /** Render **/
  return (
    <Container>
      <ScreenHeader title="Contact Info" />
      <Content>
        <Input
          autoFocus
          type="email"
          label="Enter your information"
          placeholder="Enter your first and last name"
          size={InputSizes.Large}
          value={`${firstName}${lastName ? ` ${lastName}` : ""}`}
          width="100%"
          onChange={(e: any) => {
            const value = e.currentTarget.value;
            const message =
              Validation.fullName.validate(value)?.error?.message || "";
            let [firstName, lastName] = value.split(" ");
            if (!lastName) {
              firstName = value;
            }
            setCreateUserParams({ firstName, lastName });
            setError(ErrorKeyEnum.UserFullName, message);
          }}
          icon={Icons.UserLight}
          onClear={() => {
            setCreateUserParams({ firstName: "", lastName: "" });
          }}
          margin="0px 0px 10px 0px"
        />
        <ErrorMessage>{fullNameError}</ErrorMessage>
        <PhoneNumberInput
          phoneNumberInputSize={PhoneNumberInputSizes.Large}
          value={phoneNumber}
          onChange={(phoneNumber: string) => {
            const message =
              Validation.phoneNumber.validate(phoneNumber)?.error?.message ||
              "";
            setCreateUserParams({ phoneNumber });
            setError(ErrorKeyEnum.UserPhoneNumber, message);
          }}
        />
        <ErrorMessage>{phoneNumberError}</ErrorMessage>
        <GlobalError />
      </Content>
    </Container>
  );
};

export default UserInfo;
