import React, { useState } from "react";
import gql from 'graphql-tag';
import Button, { ButtonTypes, ButtonStates } from "@sellout/ui/build/components/Button";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { Colors, Icons, Icon, TextButton } from '@sellout/ui';
import { useMutation } from '@apollo/react-hooks';
import { getErrorMessage } from '@sellout/ui/build/utils/ErrorUtil';
import Error from '../elements/Error';
import * as Validation from '@sellout/ui/build/utils/Validation';
import SelloutLogo from '../assets/images/sellout-logo-long-white.svg';
import {
  Container,
  LogoContainer,
  Body,
  Logo,
  Footer,
  StepTitle,
  StepSubtitle,
  ConfirmedContainer,
} from '../components/account/AccountStyle';
import { TextButtonSizes } from "@sellout/ui/build/components/TextButton";
import { useHistory } from 'react-router-dom';

type ForogtPasswordProps = {
  match: any,
};

const FORGOT_USER_PASSWORD = gql`
  mutation forgotUserPassword($email: String!) {
    forgotUserPassword(email: $email)
  }
`;

enum PageStepEnum {
  EmailStep = 'EmailStep',
  ConfirmedStep = 'ConfirmedStep',
};

const ForgotPassword: React.FC<ForogtPasswordProps> = ({ match }) => {
  const [email, setEmail] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [pageStep, setPageStep] = useState(PageStepEnum.EmailStep);
  const [errorMsg, setErrorMsg] = useState('');
  const [forgotUserPassword, { loading: forgotPasswordLoading }] = useMutation(FORGOT_USER_PASSWORD, {
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    onCompleted(data) {
      setPageStep(PageStepEnum.ConfirmedStep);
      setErrorMsg('');
    },
  });

  const canGoToNextAction = () => (email);
  const goToNextAction = () => {
    const { error } = Validation.email.validate(email);
    if (error) {
      setValidationErrors([error?.message]);
    } else {
      forgotUserPassword({
        variables: {
          email,
        },
      });
    }
  };
  const history = useHistory();

  const goToLoginAction =()=>{
    history.push('/account/?step=email');
  }

  return (
    <Container>
      <LogoContainer>
        <Logo src={SelloutLogo} />
      </LogoContainer>
      <Body showLogo={false}>
        {pageStep === PageStepEnum.EmailStep ? (
          <>
            <StepTitle>
              Forgot your password?
            </StepTitle>
            <StepSubtitle>
              Please enter your email address and we'll send a reset link right over to you.
            </StepSubtitle>
            <Input
              type="email"
              placeholder="Enter your email address"
              size={InputSizes.Large}
              value={email}
              width="100%"
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                if (validationErrors.length > 0) setValidationErrors([]);
                if (errorMsg) setErrorMsg('');
                setEmail(event.currentTarget.value);
              }}
              icon={Icons.EnvelopeLight}
              onClear={() => setEmail("")}
              onEnter={() => canGoToNextAction() ? goToNextAction() : null}
              validationError={validationErrors[0]}
            />
            <Error
              children={errorMsg}
              margin="10px 0px 0px 0px"
            />
          </>
        ) : (
          <ConfirmedContainer>
            <Icon
              icon={Icons.EnvelopeOpenRegular}
              size={64}
              color={Colors.Grey1}
              margin="0px 0px 20px 0px"
            />
            <StepTitle>
              We just emailed you a reset link
            </StepTitle>
            <StepSubtitle>
              Please check your inbox to reset your password.
            </StepSubtitle>
          </ConfirmedContainer>
        )}
      </Body>
      <Footer>
        {pageStep === PageStepEnum.EmailStep ? (
          <Button
            type={ButtonTypes.Next}
            state={canGoToNextAction() ? ButtonStates.Active : ButtonStates.Disabled}
            text="send reset link"
            loading={forgotPasswordLoading}
            onClick={() => goToNextAction()}
          />
        ) : <TextButton
          size={TextButtonSizes.Regular}
          children="Login with your account"
          margin="0px 10px 0px 0px"
          onClick={() => goToLoginAction()}
        />}
      </Footer>
    </Container>
  );
};

export default ForgotPassword;
