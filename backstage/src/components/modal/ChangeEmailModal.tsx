import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { Icons, Colors, Loader, LoaderSizes } from '@sellout/ui';
import Error from '../../elements/Error';
import * as Validation from '@sellout/ui/build/utils/Validation';
import { useMutation, useQuery } from '@apollo/react-hooks';
import SEND_USER_EMAIL_VERIFICATION from '@sellout/models/.dist/graphql/mutations/sendUserEmailVerification.mutation';
import UPDATE_USER_EMAIL from '@sellout/models/.dist/graphql/mutations/updateUserEmail.mutation';
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import GET_PROFILE from '@sellout/models/.dist/graphql/queries/profile.query';
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";

const Container = styled.div`
  width: 350px;
`;

const Title = styled.div`
  color: ${Colors.Grey1};
  margin: 25px 0px 5px 0px;
  font-size: 1.8rem;
  font-weight: 600;
`;

const Subtitle = styled.div`
  color: ${Colors.Grey3};
  font-size: 1.4rem;
`;

const AlignMiddle = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

enum DisplayStates {
  Input = 'Input',
  WaitingForVerify = 'WaitingForVerify',
  Completed = 'Completed',
}

const ChangeEmail: React.FC = () => {
  const dispatch = useDispatch();
  const [validationError, setValidationError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('');
  const [displayState, setDisplayState] = React.useState(DisplayStates.Input);
  const [sendUserEmailVerification, { loading: emailLoading }] = useMutation(SEND_USER_EMAIL_VERIFICATION, {
    onError(error) {
      setErrorMsg(getErrorMessage(error));
    }
  });
  const [updateUserEmail, { loading: updateLoading }] = useMutation(UPDATE_USER_EMAIL, {
    onCompleted(data) {
      if (data?.updateUserEmail?.emailWaitingForVerify) {
        setDisplayState(DisplayStates.WaitingForVerify);
        sendUserEmailVerification();
      }
    },
    onError(error) {
      console.error(error);
      setErrorMsg(getErrorMessage(error));
    },
  });

  const popModal = () => dispatch(AppActions.popModal());
  const nextAction = async () => {
    const { error } = Validation.email.validate(email);
    if (error) {
      setValidationError(error.message);
    } else {
      await updateUserEmail({
        variables: {
          newEmail: email,
        }
      });
    }
  };

  useQuery(GET_PROFILE, {
    fetchPolicy: 'network-only',
    pollInterval: 2000, // check if email is verified every 2 seconds if on this page
    notifyOnNetworkStatusChange: true,
    skip: displayState !== DisplayStates.WaitingForVerify,
    onCompleted: (data) => {
      console.log(data);
      if (data?.user?.emailWaitingForVerify.length === 0 && !errorMsg) {
        popModal();
      }
    },
  });

  // make sure emailWaitingForVerify is cleared on dismount
  // prevents edge case error where user recieves an org invite but has not verified
  // their email but has an emailWaitingForVerify
  // React.useEffect(() => {
  //   return () => {
  //     updateUserEmail({
  //       variables: {
  //         newEmail: '',
  //       },
  //     });
  //   }
  // }, [updateUserEmail]);

  /**
   * Render
   */
  return (
    <ModalContainer>
      <ModalHeader title="Change email address" close={popModal} />
      <ModalContent>
        <Container>
          {(() => {
            switch (displayState) {
              case DisplayStates.Input:
                return (
                  <>
                    <Input
                      label="New email address"
                      type="email"
                      placeholder="Enter new email address"
                      size={InputSizes.Large}
                      value={email}
                      width="100%"
                      onChange={(event: React.FormEvent<HTMLInputElement>) => {
                        if (validationError) setValidationError('');
                        if (errorMsg) setErrorMsg('');
                        setEmail(event.currentTarget.value);
                      }}
                      icon={Icons.EnvelopeLight}
                      onClear={() => {
                        setEmail("");
                      }}
                      margin="0px 0px 10px 0px"
                      onEnter={() => email === confirmEmail && email.length > 0 ? nextAction() : null}
                      autoFocus
                    />
                    <Input
                      type="email"
                      placeholder="Re-enter new email address"
                      size={InputSizes.Large}
                      value={confirmEmail}
                      width="100%"
                      onChange={(event: React.FormEvent<HTMLInputElement>) => {
                        if (validationError) setValidationError('');
                        if (errorMsg) setErrorMsg('');
                        setConfirmEmail(event.currentTarget.value)
                      }}
                      icon={Icons.CheckLight}
                      onEnter={() => email === confirmEmail && email.length > 0 ? nextAction() : null}
                      iconConditionalColor={email === confirmEmail && email.length > 0 ? Colors.Green : null}
                      validationError={validationError}
                    />
                    <Error
                      children={errorMsg}
                      margin="10px 0px 0px 0px"
                    />
                  </>
                );
              case DisplayStates.WaitingForVerify:
                return (
                  <AlignMiddle>
                    <Loader size={LoaderSizes.Large} color={Colors.Orange} />
                    <Title>
                      We just sent you a verification email
                    </Title>
                    <Subtitle>
                      {`To update your email, you must click the verification link in the email sent to ${email}`}
                    </Subtitle>
                    <Error
                      children={errorMsg}
                      margin="10px 0px 0px 0px"
                    />
                  </AlignMiddle>
                );
            }
          })()}
        </Container>
      </ModalContent>
      <ModalFooter>
        {(() => {
          switch (displayState) {
            case DisplayStates.Input:
              return (
                <>
                  <div />
                  <Button
                    type={ButtonTypes.Thin}
                    text="Submit"
                    loading={updateLoading || emailLoading}
                    state={email === confirmEmail && email.length > 0 ? ButtonStates.Active : ButtonStates.Disabled}
                    onClick={() => {
                      nextAction();
                    }}
                  />
                </>
              );
          }
        })()}
      </ModalFooter>
    </ModalContainer>
  );
};

export default ChangeEmail;