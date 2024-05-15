import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { Icons, Colors } from '@sellout/ui';
import Error from '../../elements/Error';
import * as Validation from '@sellout/ui/build/utils/Validation';
import { useMutation } from '@apollo/react-hooks';
import { getErrorMessage } from '@sellout/ui/build/utils/ErrorUtil';
import { AppNotificationTypeEnum } from "../../models/interfaces/IAppNotification";
import RESET_USER_PASSWORD_IN_APP from '@sellout/models/.dist/graphql/mutations/resetUserPasswordInApp.mutation';
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";

const Container = styled.div`
  width: 100%;
`;

const ChangePasswordModal: React.FC = () => {
  const dispatch = useDispatch();
  const [validationError, setValidationError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetUserPasswordInApp, { loading }] = useMutation(RESET_USER_PASSWORD_IN_APP, {
    onCompleted(data) {
      dispatch(AppActions.showNotification('Your password has been updated', AppNotificationTypeEnum.Success));
      popModal();
    },
    onError(error) {
      console.error(error);
      setErrorMsg(getErrorMessage(error));
    },
  })
  const popModal = () => dispatch(AppActions.popModal());
  const canGoToNextAction = () => ((password === confirmPassword) && (password.length >= 8));
  const nextAction = () => {
    const { error } = Validation.password.validate(password);
    if (error) {
      setValidationError(error.message);
    } else {
      resetUserPasswordInApp({
        variables: {
          oldPassword,
          newPassword: password,
        },
      });
    }
  };

  return (
    <ModalContainer>
      <ModalHeader title="Change password" close={popModal} />
      <ModalContent>
        <Container>
          <Input
            label="Old password"
            placeholder="Enter old password"
            size={InputSizes.Large}
            value={oldPassword}
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              if (validationError) setValidationError('');
              if (errorMsg) setErrorMsg('');
              setOldPassword(event.currentTarget.value);
            }}
            icon={Icons.Lock}
            // onClear={() => setPassword("")}
            type="password"
            onEnter={() =>  canGoToNextAction() ? nextAction() : null}
            margin="0px 0px 20px 0px"
            autoFocus
          />
          <Input
            label="New password"
            placeholder="Enter new password"
            size={InputSizes.Large}
            value={password}
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              if (validationError) setValidationError('');
              if (errorMsg) setErrorMsg('');
              setPassword(event.currentTarget.value);
            }}
            icon={Icons.Lock}
            // onClear={() => setPassword("")}
            type="password"
            onEnter={() =>  canGoToNextAction() ? nextAction() : null}
            margin="0px 0px 10px 0px"
          />
          <Input
            placeholder="Re-enter new password"
            size={InputSizes.Large}
            value={confirmPassword}
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              if (validationError) setValidationError('');
              if (errorMsg) setErrorMsg('');
              setConfirmPassword(event.currentTarget.value);
            }}
            icon={Icons.CheckLight}
            type="password"
            onEnter={() =>  canGoToNextAction() ? nextAction() : null}
            iconConditionalColor={canGoToNextAction() ? Colors.Green : null}
            validationError={validationError}
          />
          <Error
            children={errorMsg}
            margin="10px 0px 0px 0px"
          />
        </Container>
      </ModalContent>
      <ModalFooter>
        <div />
        <Button
          type={ButtonTypes.Thin}
          text="Submit"
          state={canGoToNextAction() ? ButtonStates.Active : ButtonStates.Disabled}
          loading={loading}
          onClick={() => {
            nextAction();
          }}
        />
      </ModalFooter>
    </ModalContainer>
  );
};

export default ChangePasswordModal;