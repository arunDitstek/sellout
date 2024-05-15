import React, { useState } from "react";
import styled from "styled-components";
import { useMutation } from "@apollo/react-hooks";
import { useSelector, useDispatch } from "react-redux";
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { Colors } from "@sellout/ui/build/Colors";
import ScreenHeader from "../components/ScreenHeader";
import CodeInput from "@sellout/ui/build/components/CodeInput";
import * as AppActions from "../redux/actions/app.actions";
import * as UserActions from "../redux/actions/user.actions";
import SEND_USER_PHONE_AUTHENTICATION from "@sellout/models/.dist/graphql/mutations/sendUserPhoneAuthentication.mutation";
import TextButton, {
  TextButtonSizes,
} from "@sellout/ui/build/components/TextButton";
import Error from "../components/Error";
import { ISeasonGraphQL } from "@sellout/models/.dist/interfaces/ISeason";
import { getErrorMessage } from "../utils/ErrorUtil";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
`;

const HeaderBar = styled.div`
  height: 60px;
  display: flex;
  flex-direction: row;
  background-color: ${Colors.White};
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
`;

const Content = styled.div`
  margin: 24px 0 0;
  padding: 0 24px;
`;

const Text = styled.div`
  font-size: 1.4rem;
  font-weight: 500;
  color: ${Colors.Grey2};
  margin-bottom: 30px;
`;

type PhoneCodeProps = {
  event?: IEventGraphQL;
  season?: ISeasonGraphQL;
};

const PhoneCode: React.FC<PhoneCodeProps> = ({ event, season }) => {
  /** State **/
  // const [showVerify, setShowVerify] = React.useState(false);
  const [resetCode, setResetCode] = React.useState(false);
  const [error, setError] = React.useState("");

  /** State **/
  const { app, user } = useSelector((state: PurchasePortalState) => state);
  const {
    createUserParams: { email },
  } = user;
  const [code, setCode] = useState([]);

  /** Actions **/
  const dispatch = useDispatch();
  const setPhoneVerificationToken = (phoneVerificationToken: string) =>
    dispatch(UserActions.setPhoneVerificationToken(phoneVerificationToken));
  const navigateForward = () => dispatch(AppActions.navigateForward());
  const seasonNavigateForward = () =>
    dispatch(AppActions.seasonNavigateForward());
  /** GraphQL **/
  const [sendUserPhoneAuthentication] = useMutation(
    SEND_USER_PHONE_AUTHENTICATION,
    {
      variables: {
        email,
      },
      onError: (error) => setError(getErrorMessage(error)),
      onCompleted(data) {
        data.sendUserPhoneAuthentication == true
          ? dispatch(
              AppActions.showNotification(
                "code sent sucessfully",
                AppNotificationTypeEnum.Success
              )
            )
          : "";
      },
    }
  );
  /** Effects **/
  React.useEffect(() => {
    sendUserPhoneAuthentication();
  }, []);

  /** Render **/
  return (
    <Container>
      <ScreenHeader title="Email verification" />
      <Content>
        <Text>
          We've just sent a 4-digit code to your email address, please enter it
          below
        </Text>
        <CodeInput
          key={6}
          length={4}
          onChange={(e: any) => {
            setCode(e);
            // no
            setResetCode(false);
          }}
          onComplete={(phoneVerificationToken: string) => {
            setPhoneVerificationToken(phoneVerificationToken);
            if (event) {
              navigateForward();
            } else if (season) {
              seasonNavigateForward();
            }
          }}
          resetCode={resetCode}
        />
        <TextButton
          onClick={() => {
            sendUserPhoneAuthentication();
            setResetCode(true);
          }}
          size={TextButtonSizes.Regular}
          margin="20px 0 0"
        >
          I didn't receive a code
        </TextButton>
        {!error
          ? code?.every((x) => x) &&
            app?.errors?.Global && (
              <Error margin="20px 0px 0px 0px">{app?.errors?.Global}</Error>
            )
          : error && <Error margin="20px 0px 0px 0px">{error}</Error>}
      </Content>
    </Container>
  );
};
export default PhoneCode;
