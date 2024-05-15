import React, { useState, useEffect } from "react";
import Button, { ButtonTypes, ButtonStates } from "@sellout/ui/build/components/Button";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import SelloutLogo from '../assets/images/sellout-logo-long-white.svg';
import { useHistory } from 'react-router-dom';
import { Colors, Icons, Icon } from '@sellout/ui';
import { useMutation } from '@apollo/react-hooks';
import { getErrorMessage } from '@sellout/ui/build/utils/ErrorUtil';
import Error from '../elements/Error';
import * as Validation from '@sellout/ui/build/utils/Validation';
import RESET_USER_PASSWORD from '@sellout/models/.dist/graphql/mutations/resetUserPassword.mutation';
import url from 'url';
import {
  Container,
  LogoContainer,
  Logo,
  Body,
  Footer,
  StepTitle,
  StepSubtitle,
  ConfirmedContainer,
} from '../components/account/AccountStyle';

type ResetPasswordProps = {
  match: any,
};

enum PageStepEnum {
  PasswordStep = 'PasswordStep',
  ConfirmedStep = 'ConfirmedStep',
};

const ResetPassword: React.FC<ResetPasswordProps> = ({ match }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [pageStep, setPageStep] = useState(PageStepEnum.PasswordStep);
  const [errorMsg, setErrorMsg] = useState('');
  const [resetCode, setResetCode] = useState('');
  const history = useHistory();
  const [resetUserPassword, { loading: resetPasswordLoading }] = useMutation(RESET_USER_PASSWORD, {
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    onCompleted(data) {
      setErrorMsg('');
      setPageStep(PageStepEnum.ConfirmedStep);
    },
  });

  useEffect(() => {
    const { query: { code }} = url.parse(window.location.toString(), true);
    setResetCode((code as string) || 'error');
  }, []);

  const canGoToNextAction = () => ((password === confirmPassword) && (password.length >= 8));
  const goToNextAction = () => {
    const { error } = Validation.password.validate(password);
    if (error) {
      setValidationErrors([error?.message]);
    } else {
      resetUserPassword({
        variables: {
          password,
          forgotPasswordCode: resetCode,
        },
      })
    }
  };

  return (
    <Container>
      <LogoContainer>
      <Logo src={SelloutLogo} />
      </LogoContainer>
        <Body>
          {pageStep === PageStepEnum.PasswordStep ? (
            <>
              <StepTitle>
                Set a new password
              </StepTitle>
              <StepSubtitle>
                Choose something nice and secret
              </StepSubtitle>
              <Input
                placeholder="Enter a password"
                size={InputSizes.Large}
                value={password}
                width="100%"
                onChange={(event: React.FormEvent<HTMLInputElement>) => {
                  if (validationErrors.length > 0) setValidationErrors([]);
                  if (errorMsg) setErrorMsg('');
                  setPassword(event.currentTarget.value);
                }}
                icon={Icons.Lock}
                type="password"
                onEnter={() =>  canGoToNextAction() ? goToNextAction() : null}
                margin="0px 0px 10px 0px"
                autoFocus
              />
              <Input
                placeholder="Re-enter your password"
                size={InputSizes.Large}
                value={confirmPassword}
                width="100%"
                onChange={(event: React.FormEvent<HTMLInputElement>) => {
                  if (validationErrors.length > 0) setValidationErrors([]);
                  setConfirmPassword(event.currentTarget.value);
                }}
                icon={Icons.CheckLight}
                type="password"
                onEnter={() =>  canGoToNextAction() ? goToNextAction() : null}
                iconConditionalColor={canGoToNextAction() ? Colors.Green : null}
                validationError={validationErrors[0]}
              />
              <Error
                children={errorMsg}
                margin="10px 0px 0px 0px"
              />
            </>
          ) : (
            <>
              <ConfirmedContainer>
                <Icon
                  icon={Icons.CheckCircle}
                  size={64}
                  margin="0 0 30px 0px"
                  color={Colors.Green}
                />
                <StepTitle>
                  Your password has been reset
                </StepTitle>
            </ConfirmedContainer>
          </>
          )}
        </Body>
        <Footer>
          {pageStep === PageStepEnum.PasswordStep && (
            <Button
              type={ButtonTypes.Next}
              state={canGoToNextAction() ? ButtonStates.Active : ButtonStates.Disabled}
              text="RESET PASSWORD"
              loading={resetPasswordLoading}
              onClick={() => goToNextAction()}
            />
          )}
        </Footer>
      </Container>
  );
};

export default ResetPassword;
