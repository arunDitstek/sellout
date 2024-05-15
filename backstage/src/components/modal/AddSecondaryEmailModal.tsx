import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from '@apollo/react-hooks';
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { Icons, Colors } from '@sellout/ui';
import Error from '../../elements/Error';
import * as Validation from '@sellout/ui/build/utils/Validation';
import gql from 'graphql-tag';
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";

const Container = styled.div`
  width: 350px;
`;

const ADD_SECONDARY_EMAIL = gql`
  mutation addSecondaryEmail($email: String!) {
    addSecondaryEmail(email: $email) {
      _id
      secondaryEmails
    }
  }
`;

const AddSecondaryEmailModal: React.FC = () => {
  const dispatch = useDispatch();
  const [validationError, setValidationError] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('');
  const [addSecondaryEmail, { loading }] = useMutation(ADD_SECONDARY_EMAIL, {
    onCompleted(data) {
      console.log(data);
      popModal();
    },
    onError(error) {
      setErrorMsg(getErrorMessage(error));
    }
  })
  const popModal = () => dispatch(AppActions.popModal());
  const nextAction = () => {
    const { error } = Validation.email.validate(email);
    if (error) {
      setValidationError(error.message);
    } else {
      addSecondaryEmail({
        variables: {
          email,
        },
      });
    }
  }

  return (
    <ModalContainer>
      <ModalHeader title="Add another email address" close={popModal} />
      <ModalContent>
        <Container>
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
            onEnter={() =>  email === confirmEmail && email.length > 0 ? nextAction() : null}
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
            onEnter={() =>  email === confirmEmail && email.length > 0 ? nextAction() : null}
            iconConditionalColor={email === confirmEmail && email.length > 0 ? Colors.Green : null}
            validationError={validationError}
          />
          {errorMsg && <Error
            children={errorMsg}
            margin="10px 0px 0px 0px"
          />}
        </>
        </Container>
      </ModalContent>
      <ModalFooter>
        <div />
        <Button
          type={ButtonTypes.Thin}
          text="Submit"
          loading={loading}
          state={email === confirmEmail && email.length > 0 ? ButtonStates.Active : ButtonStates.Disabled}
          onClick={() => {
            nextAction();
          }}
        />
      </ModalFooter>
    </ModalContainer>
  );
};

export default AddSecondaryEmailModal;