import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import PhoneNumberInput from "@sellout/ui/build/components/PhoneNumberInput";
import Error from '../../elements/Error';
import CodeInput from '@sellout/ui/build/components/CodeInput';
import * as Validation from '@sellout/ui/build/utils/Validation';
import { Colors } from '@sellout/ui';
import { useMutation } from '@apollo/react-hooks';
import { getErrorMessage } from '@sellout/ui/build/utils/ErrorUtil';
import GET_PROFILE from '@sellout/models/.dist/graphql/queries/profile.query';
import UPDATE_USER_PHONE_NUMBER from '@sellout/models/.dist/graphql/mutations/updateUserPhoneNumber.mutation';
import SEND_USER_PHONE_VERIFICATION from '@sellout/models/.dist/graphql/mutations/sendUserPhoneVerification.mutation';
import VERIFY_USER_PHONE_NUMBER from '@sellout/models/.dist/graphql/mutations/verifyUserPhoneNumber.mutation';
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";

const Container = styled.div`
  width: 100%;
`;

const MessageText = styled.div`
  font-size: 1.4rem;
  color: ${Colors.Grey2};
  font-weight: 500;
  margin: 25px 0px;
`;

const ChangePhoneNumberModal: React.FC = () => {
  const dispatch = useDispatch();
  const [validationError, setValidationError] = useState('');
  const [codeInputIsOpen, setCodeInputIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [updateUserPhoneNumber, { loading: updateLoading }] = useMutation(UPDATE_USER_PHONE_NUMBER, {
    async onCompleted(data) {
      await sendUserPhoneVerification({
        variables: {
          phoneNumber,
        },
      });
    },
    onError(error) {
      console.error(error);
      setErrorMsg(getErrorMessage(error));
    },
  });
  const [verifyUserPhoneNumber, { loading: verifyLoading }] = useMutation(VERIFY_USER_PHONE_NUMBER, {
    refetchQueries: [{ query: GET_PROFILE }],
    onCompleted(data) {
      popModal();
    },
    onError(error) {
      console.error(error);
      setErrorMsg(getErrorMessage(error));
    },
  });
  const [sendUserPhoneVerification, { loading }] = useMutation(SEND_USER_PHONE_VERIFICATION, {
    onCompleted(data) {
      setCodeInputIsOpen(true);
    },
    onError(error) {
      console.error(error);
      setErrorMsg(getErrorMessage(error));
    },
  });
  const popModal = () => dispatch(AppActions.popModal());
  const nextAction = async () => {
    const { error } = Validation.phoneNumber.validate(phoneNumber);
    if (error) {
      setValidationError(error.message);
    } else {
      await updateUserPhoneNumber({
        variables: {
          newPhoneNumber: phoneNumber,
        },
      });
    }
  }

  return (
    <ModalContainer>
      <ModalHeader title="Change phone number" close={popModal} />
      <ModalContent>
        <Container>
          <PhoneNumberInput
            value={phoneNumber}
            onChange={(val: string) => {
              if (validationError) setValidationError('');
              if (errorMsg) setErrorMsg('');
              if (codeInputIsOpen) setCodeInputIsOpen(false);
              setPhoneNumber(val);
            }}
            validationError={validationError}
            onEnter={() => phoneNumber ? nextAction() : null}
          />
          {codeInputIsOpen &&
            <>
              <MessageText>
                We just sent a 4-digit code to your mobile phone, please enter it below.
              </MessageText>
              <CodeInput
                length={4}
                onChange={() => {
                  if (errorMsg) setErrorMsg('');
                }}
                onComplete={(phoneCode: string) => {
                  verifyUserPhoneNumber({
                    variables: {
                      phoneVerificationToken: phoneCode,
                    }
                  })
                }}
              />
            </>}
          <Error
            children={errorMsg}
            margin="10px 0px 0px 0px"
          />
        </Container>
      </ModalContent>
      <ModalFooter>
        <div />
        {!codeInputIsOpen &&
          <Button
            type={ButtonTypes.Thin}
            text="Verify"
            loading={loading || updateLoading || verifyLoading}
            state={phoneNumber ? ButtonStates.Active : ButtonStates.Disabled}
            onClick={async () => {
              await nextAction();
            }}
          />}
      </ModalFooter>
    </ModalContainer>
  );
};

export default ChangePhoneNumberModal;