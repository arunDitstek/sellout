import React, { useState } from "react";
import { Button, Colors, Icons, Input } from "@sellout/ui";
import styled from "styled-components";
import { Container, Content } from "./UserEmail";
import * as Validation from "@sellout/ui/build/utils/Validation";
import { ErrorKeyEnum } from "../redux/reducers/app.reducer";
import * as AppActions from "../redux/actions/app.actions";
import { ButtonStates, ButtonTypes } from "@sellout/ui/build/components/Button";
import { PurchasePortalState } from "../redux/store";
import { useSelector, useDispatch } from "react-redux";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import NOTIFIY_EVENT from "@sellout/models/.dist/graphql/queries/notifiyEvent";
import { useLazyQuery, useQuery } from "@apollo/react-hooks";
import { getErrorMessage } from "../utils/ErrorUtil";
import Error from "../components/Error";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";



export const Spacer = styled.div`
  height: 20px;
`;

const FullContainer = styled(Container)`
  width: 100%;
  box-sizing: border-box;
  /* height: 260px; */
  top: 0;
`;

const ButtonContainer = styled.div`
  margin: 0 24px;
`;
const WaitContent = styled(Content)<HeightContentType>`
  height: ${(props) => (props.height ? props.height : "180px")};
  margin-top: 0;
  h2 {
    font-size: 1.6rem;
    line-height: 2.4rem;
    font-weight: 600;
    color: #333333;
  }
`;



type HeightContentType = {
  height?: string;
};
type EventWaitListProps = {
  event?: IEventGraphQL;
  height?:string
};
const NotifiyMeEmail: React.FC<EventWaitListProps> = ({ event,height }) => {

  /** State */

  const { app } = useSelector((state: PurchasePortalState) => state);
  const { errors } = app;
  const [notifiyMe, setNotifiyMe] = useState({
    email: "",
  });
  const [error, setErrors] = React.useState("");
  const emailError = errors[ErrorKeyEnum.NotifiyMe];

  /**actions */
  const dispatch = useDispatch();
  const setError = (key: ErrorKeyEnum, errorMsg: string) => 
    dispatch(AppActions.setError(key, errorMsg));



  /** GraphQL **/

  const [handleSubmit,{ loading,data }] = useLazyQuery(NOTIFIY_EVENT, {
    fetchPolicy: "network-only",
    onCompleted(data) {
      data?.notifyEvent
      ? dispatch(
          AppActions.showNotification(
            "Your email has been submitted",
            AppNotificationTypeEnum.Success
          )
        )
      : "";
      setNotifiyMe(prevState => ({ ...prevState, email: "" }));
      
    },
    onError: (error) => setErrors(getErrorMessage(error)),
  });

  return (
    <FullContainer>
      <WaitContent height={height}>
        <h2>Notify Me</h2>
        <Input
          autoFocus
          type="email"
          label="Enter your email address to be notified when this event goes on sale"
          placeholder="Email address"
          value={notifiyMe.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const email = e.currentTarget.value ;
            const message =
              Validation.email.validate(email)?.error?.message || "";
              setNotifiyMe((prevNotifiyMe) => ({
                ...prevNotifiyMe,
                email: email,
              }));
            email
              ? setError(ErrorKeyEnum.NotifiyMe, message)
              : setError(ErrorKeyEnum.NotifiyMe, "");
          }}
          icon={Icons.EnvelopeLight}
          margin="0px 0px 10px 0px"
          validationError={emailError}
        />
        {/* <GlobalError /> */}
     { error && <Error margin="20px 0px 0px 0px">{error}</Error>}

      </WaitContent>
      <ButtonContainer>
        <Button
          type={ButtonTypes.Next}
          text="Submit"
          state={
            notifiyMe?.email=="" || emailError !== "" ? ButtonStates.Disabled : ButtonStates.Active
          }
          bgColor={Colors.Orange}
          textColor={Colors.White}
          onClick={() => {
            handleSubmit({
              variables: {
                eventId: event?._id,
                email: notifiyMe?.email
              }
            });
          }}
          loading={loading}
        />
      </ButtonContainer>
    </FullContainer>
  );
};
export default NotifiyMeEmail;
