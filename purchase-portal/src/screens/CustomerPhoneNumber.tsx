import React, { useEffect } from "react";
import styled from "styled-components";
import { useLazyQuery } from "@apollo/react-hooks";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
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
import LIST_CUSTOMERS from "@sellout/models/.dist/graphql/queries/customerProfile.query";
import UserInfo, {
  UserInfoSizeEnum,
} from "@sellout/ui/build/components/UserInfo";
import Label from "@sellout/ui/build/components/Label";
import { IUserProfileGraphQL } from "@sellout/models/.dist/interfaces/IUserProfile";
import GlobalError from "./../components/GlobalError";
import USER_EXISTS from "@sellout/models/.dist/graphql/queries/userExists.query";
import * as OrderActions from "../redux/actions/order.actions";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
`;

const Content = styled.div`
  margin: 16px 0 0;
  padding: 0 24px;
`;

const ForMargin = styled.div`
  margin-bottom: 10px;
`;

const UserProfileContainer = styled.div`
  margin-top: 32px;
`;

const ErrorMessage = styled.p`
  color: red;
`;

type CustomerPhoneNumberProps = {};

const CustomerPhoneNumber: React.FC<CustomerPhoneNumberProps> = () => {
  /** State **/
  const initialState = {
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    __typename: "User",
    _id: "",
  };
  const [customer, setCustomer] = React.useState(initialState);
  /** State **/
  const { app, user } = useSelector((state: PurchasePortalState) => state);
  const {
    createUserParams: { firstName, lastName, phoneNumber, email },
    userExists,
  } = user;

  /** Actions **/
  const dispatch = useDispatch();
  const setCreateUserParams = (params: Partial<ICreateUserParams>) =>
    dispatch(UserActions.setCreateUserParams(params));
  const setError = (key: ErrorKeyEnum, errorMsg: string) =>
    dispatch(AppActions.setError(key, errorMsg));
  const getUserProfileSuccess = (userProfile: IUserProfileGraphQL) => {
    dispatch(UserActions.getUserProfileSuccess(userProfile));
    dispatch(UserActions.setCreateUserParams(userProfile?.user));
  };

  const setUserExists = (userExists: boolean) =>
    dispatch(UserActions.setUserExists(userExists));
  /** GraphQL **/

  const [getCustomer, { data, loading, error }] = useLazyQuery(LIST_CUSTOMERS, {
    fetchPolicy: "network-only",
    context: {
      debounceKey: "LIST_CUSTOMERS",
    },
    onCompleted: () => {
      const userProfiles = data?.userProfiles ?? [];
      const userProfile = userProfiles?.[0];
      if (userProfiles.length === 1 && userProfile) {
        getUserProfileSuccess(userProfile);
      }
    },
    onError: () => {
      const userProfileError = getErrorMessage(error);
      setError(ErrorKeyEnum.UserProfileError, userProfileError);
    },
  });

  const [getExistsPhoneNumber] = useLazyQuery(USER_EXISTS, {
    fetchPolicy: "network-only",
    context: {
      debounceKey: "USER_EXISTS",
    },
    onCompleted: (data) => {
      const exists = Boolean(data?.userExists?.userId.length ?? 0 > 0);
      if (exists) {
        const userId = data?.userExists?.userId;
        dispatch(OrderActions.setCreateOrderParams({ userId }));
        setCustomer({
          ...customer,
          email: data?.userExists?.email,
          firstName: data?.userExists?.firstName,
          lastName: data?.userExists?.lastName,
          phoneNumber: phoneNumber,
          __typename: "User",
          _id: data?.userExists?.userId,
        });
        setUserExists(true);
      } else {
        setCustomer(initialState);
        setUserExists(false);
      }
    },
  });
  const { errors } = app;
  const phoneNumberError = errors[ErrorKeyEnum.UserPhoneNumber];
  const phoneNumberisValid = Boolean(phoneNumber) && !phoneNumberError;
  const UserProfileError = errors[ErrorKeyEnum.UserProfileError];
  const emailError = errors[ErrorKeyEnum.UserEmail];
  const fullNameError = errors[ErrorKeyEnum.UserFullName];

  useEffect(() => {
    if (phoneNumber && phoneNumberisValid) {
      getExistsPhoneNumber({
        variables: {
          phoneNumber,
        },
      });
      getCustomer({
        variables: {
          query: {
            phoneNumber,
          },
          pagination: {
            pageSize: 1,
            pageNumber: 1,
          },
        },
      });
    }
    if (firstName && lastName && email && phoneNumber.length > 1) {
      dispatch(OrderActions.setGuestCheckout(false));
    } else if (phoneNumber.length > 1 && userExists) {
      dispatch(OrderActions.setGuestCheckout(false));
    } else {
      dispatch(OrderActions.setGuestCheckout(true));
    }
  }, [phoneNumber.length, firstName, lastName, email, userExists]);

  /** Render **/
  return (
    <Container>
      <ScreenHeader title="Customer phone number" />
      <Content>
        <PhoneNumberInput
          autoFocus={true}
          label="Customer phone number"
          phoneNumberInputSize={PhoneNumberInputSizes.Large}
          value={phoneNumber}
          onChange={(phoneNumber: string) => {
            const message =
              Validation.phoneNumber.validate(phoneNumber)?.error?.message ||
              "";
            setCreateUserParams({ phoneNumber });
            setError(ErrorKeyEnum.UserPhoneNumber, message);
            setError(ErrorKeyEnum.UserProfileError, "");
          }}
        />
        <ForMargin></ForMargin>
        {customer._id.length === 0 && phoneNumberisValid && (
          <>
            <Input
              //autoFocus
              type="email"
              label="Customer name"
              placeholder="First and last name"
              size={InputSizes.Large}
              value={`${firstName}${Boolean(lastName) ? ` ${lastName}` : ""}`}
              width="100%"
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                const value = event.currentTarget.value;
                const message =
                  Validation.fullName.validate(value)?.error?.message || "";
                const [firstName, lastName] = value.split(" ");
                setCreateUserParams({ firstName, lastName });
                setError(ErrorKeyEnum.UserFullName, message);
                setError(ErrorKeyEnum.UserProfileError, "");
              }}
              icon={Icons.UserLight}
              onClear={() => {
                setCreateUserParams({ firstName: "", lastName: "" });
              }}
              margin="0px 0px 10px 0px"
              validationError={fullNameError}
            />
            <Input
              type="email"
              label="Customer email address"
              placeholder="Enter your email address"
              size={InputSizes.Large}
              value={email}
              width="100%"
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                const email = event.currentTarget.value;
                const message =
                  Validation.email.validate(email)?.error?.message || "";
                setCreateUserParams({ email });
                setError(ErrorKeyEnum.UserEmail, message);
                setError(ErrorKeyEnum.UserProfileError, "");
              }}
              icon={Icons.EnvelopeLight}
              onClear={() => {
                setCreateUserParams({ email: "" });
              }}
              validationError={emailError}
              margin={emailError ? "0px 0px 50px 0px" : "0px"}
            />
            <GlobalError />
          </>
        )}
        {!UserProfileError &&
          customer._id.length > 0 &&
          phoneNumber.length > 1 && (
            <UserProfileContainer>
              <Label text="Is this the customer?" />
              <UserInfo user={customer} size={UserInfoSizeEnum.Large} />
            </UserProfileContainer>
          )}
        <ErrorMessage>{UserProfileError}</ErrorMessage>
      </Content>
    </Container>
  );
};

export default CustomerPhoneNumber;
