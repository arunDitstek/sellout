import React, { useState, useEffect } from "react";
import Button, { ButtonTypes, ButtonStates } from "@sellout/ui/build/components/Button";
import { Colors, Icons, Loader, LoaderSizes } from '@sellout/ui';
import { useMutation } from '@apollo/react-hooks';
import SelloutLogo from '../../assets/images/sellout-logo-long-white.svg';
import { getErrorMessage } from '@sellout/ui/build/utils/ErrorUtil';
import Error from '../../elements/Error';
import TextButton, { TextButtonSizes } from '@sellout/ui/build/components/TextButton';
import * as Validation from '@sellout/ui/build/utils/Validation';
import HighlightButton from '../../elements/HighlightButton';
import PhoneNumberInput from "@sellout/ui/build/components/PhoneNumberInput";
import CodeInput from '@sellout/ui/build/components/CodeInput';
import { setToken } from '../../utils/Auth';
import DELETE_UNVERIFIED_USER from "@sellout/models/.dist/graphql/mutations/deleteUnverifiedUser.mutation";
import SEND_USER_PHONE_AUTHENTICATION from '@sellout/models/.dist/graphql/mutations/sendUserPhoneAuthentication.mutation';
import VERIFY_USER_PHONE_AUTHENTICATION from '@sellout/models/.dist/graphql/mutations/verifyUserPhoneAuthentication.mutation';
import REGISTER from '@sellout/models/.dist/graphql/mutations/register.mutation'
import * as Intercom from '../../utils/Intercom';
import { useHistory } from 'react-router-dom';
import {
  Container,
  LogoContainer,
  Logo,
  Body,
  InfoText,
  Footer,
  StepTitle,
  StepSubtitle,
  LoaderContainer,
  CenterItems,
} from '../../components/account/AccountStyle';
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";

enum AccountSteps {
  Email = 'email',
  ConfirmEmail = 'confirmEmail',
  Info = 'info',
  PhoneVerification = 'phoneVerification',
  SetPassword = 'setPassword',
  Login = 'login',
  NoCode = 'NoCode',
};

enum NoCodeSteps {
  CheckPhone = 'CheckPhone',
  CheckSignal = 'CheckSignal',
  CheckEmail = 'CheckEmail',
  ChangePhone = 'ChangePhone',
  EnterCode = 'EnterCode',
  NoSignal = 'NoSignal',
}

type ForogtPasswordProps = {
  setStep: Function;
  userInfo?: any;
};
const NoCodeModal: React.FC<ForogtPasswordProps> = ({
  setStep,
  userInfo,
}) => {
  const [noCodeStep, setNoCodeStep] = useState(NoCodeSteps.CheckPhone);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const history = useHistory();
  const [deleteUnverifiedUser, { loading: deleteLoading }] = useMutation(DELETE_UNVERIFIED_USER, {
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    onCompleted(data) {
      setErrorMsg('');
    },
  });
  const [sendUserPhoneAuthentication, { loading: sendPhoneAuthLoading }] = useMutation(SEND_USER_PHONE_AUTHENTICATION, {
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    onCompleted(data) {
      setErrorMsg('');
      setNoCodeStep(NoCodeSteps.EnterCode);
    }
  });
  const [verifyUserPhoneAuthentication, { loading: verifyUserPhoneAuthLoading }] = useMutation(VERIFY_USER_PHONE_AUTHENTICATION, {
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    onCompleted(data) {
      setErrorMsg('');
      setToken(data?.verifyUserPhoneAuthentication?.token);
      //setStep(AccountSteps.SetPassword);
      
      const isUserUrl = window.location.pathname === "/user/account"
      // if organization context, route to dashboard dependent on current role,
      if (data?.login?.user?.orgContextId) {
        if (data?.login?.user?.role?.role === RolesEnum.BOX_OFFICE
          || data?.login?.user?.role?.role === RolesEnum.SCANNER) {
          history.push('/admin/dashboard/events');
        } else {
          history.push('/admin/dashboard');
        }
      }
      else if (isUserUrl) {
        history.push('/my-tickets');
      } else if (data?.verifyUserPhoneAuthentication.user.orgContextId.length === 0) {
        history.push('/account/userInfo');
      }
      else {
        history.push('/admin/dashboard');
      }
    }
  });
  const [register, { loading: registerLoading }] = useMutation(REGISTER, {
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    async onCompleted(data) {
      setErrorMsg('');
      await sendUserPhoneAuthentication({
        variables: {
          email,
          isLogin:true
        },
      });
    }
  });

  useEffect(() => {
    setPhoneNumber(userInfo.phoneNumber);
    setEmail(userInfo.email) ;
    setFullName(userInfo.fullName);
  }, [userInfo.email, userInfo.fullName, userInfo.phoneNumber]);

  // detect back button press and route accordingly
  useEffect(() => {
    window.onpopstate = (e: any) => {
      switch(noCodeStep) {
        case NoCodeSteps.CheckPhone:
          setStep(AccountSteps.PhoneVerification);
          break;
        case NoCodeSteps.CheckSignal:
          setNoCodeStep(NoCodeSteps.CheckPhone);
          break;
        case NoCodeSteps.EnterCode:
          if (errorMsg) setErrorMsg('');
          setNoCodeStep(NoCodeSteps.CheckPhone);
          break;
        case NoCodeSteps.ChangePhone:
          setNoCodeStep(NoCodeSteps.CheckPhone);
          break;
        case NoCodeSteps.NoSignal:
          setNoCodeStep(NoCodeSteps.CheckSignal);
          break;
      }
   }
  }, [errorMsg, noCodeStep, setStep]);


  const checkPhoneStep = () => {
    return (
      <Body>
        {/* <GoBackButton onClick={() => setStep(AccountSteps.PhoneVerification)} /> */}
        <StepTitle>Let's get this sorted out</StepTitle>
        <StepSubtitle>{`Is your mobile phone number ${phoneNumber || 'correct'}?`}</StepSubtitle>
        <HighlightButton
          text="Yes"
          icon={Icons.ThumbsUpLight}
          onClick={() => setNoCodeStep(NoCodeSteps.CheckSignal)}
        />
        <HighlightButton
          text="No"
          onClick={() => setNoCodeStep(NoCodeSteps.ChangePhone)}
          icon={Icons.ThumbsDownLight}
          margin="10px 0px 0px 0px"
        />
      </Body>
    );
  }

  const checkSignalStep = () => {
    return (
      <Body>
        {/* <GoBackButton onClick={() => setNoCodeStep(NoCodeSteps.CheckPhone)} /> */}
        <StepTitle>Do you have at least 2 bars of cell signal?</StepTitle>
        <StepSubtitle>If you don't, please move to a place where you do.</StepSubtitle>
        <HighlightButton
          text="Yes"
          icon={Icons.ThumbsUpLight}
          onClick={async () => {
            await sendUserPhoneAuthentication({
              variables: {
                email,
                isLogin:true
              },
            });
            setNoCodeStep(NoCodeSteps.EnterCode)
          }}
        />
        <HighlightButton
          text="No"
          onClick={() => setNoCodeStep(NoCodeSteps.NoSignal)}
          icon={Icons.ThumbsDownLight}
          margin="10px 0px 0px 0px"
        />
      </Body>
    );
  }

  const enterCodeStep = () => {
    return (
      <Body>
        {/* <GoBackButton onClick={() => {
          setNoCodeStep(NoCodeSteps.CheckPhone);
          if (errorMsg) setErrorMsg('');
        }}/> */}
        <CenterItems>
          <StepTitle>Check your phone for a code</StepTitle>
          <StepSubtitle>{`We've sent a new four-digit code to ${phoneNumber || 'your mobile phone'}, please enter it below.`}</StepSubtitle>
          <CodeInput
            length={4}
            onChange={() => {
              if (errorMsg) setErrorMsg('');
            }}
            onComplete={(phoneVerificationToken: string) =>  {
              verifyUserPhoneAuthentication({
                variables: {
                  email,
                  phoneVerificationToken,
                }
              });
            }}
          />
          <TextButton
            size={TextButtonSizes.Regular}
            children="Contact Support"
            margin="35px 0px 0px 0px"
            onClick={() => Intercom.toggle()}
          />
          <Error
            children={errorMsg}
            margin="10px 0px 0px 0px"
          />
        </CenterItems>
      </Body>
    );
  }

  const noSignalStep = () => {
    return (
      <>
      <Body>
        {/* <GoBackButton onClick={() => setNoCodeStep(NoCodeSteps.CheckSignal)} /> */}
        <StepTitle />
        <InfoText>- If you are not in an area with good cell signal, please move to one where you have at least two bars.</InfoText>
        <InfoText>- If you are connected to wifi, try switching on Wifi Calling.
          <TextButton
            size={TextButtonSizes.Regular}
            children="Click here for wifi calling instructions"
            onClick={() => window.open('https://help.sellout.io/en/articles/4571462-using-wifi-calling', '_blank')}
          />
        </InfoText>
        <InfoText>{`- Once you have done either of these steps, please click below to resend a code to ${phoneNumber}`}</InfoText>
      </Body>
      <Footer>
        <Button
          type={ButtonTypes.Next}
          state={ButtonStates.Active}
          text="RESEND CODE"
          loading={sendPhoneAuthLoading}
          onClick={async () => {
            await sendUserPhoneAuthentication({
              variables: {
                email,
                isLogin:true
              },
            });
            setNoCodeStep(NoCodeSteps.EnterCode)
          }}
        />
      </Footer>
      </>
    );
  }

  const changePhoneStep = () => {
    const canGoToNextAction = () => (phoneNumber);
    const goToNextAction = async () => {
      const { error } = Validation.phoneNumber.validate(phoneNumber);
      if (error) {
        setValidationErrors([error?.message]);
      } else {
        const lastSpaceIndex = fullName.lastIndexOf(' ');
        const firstName = fullName.substring(0, lastSpaceIndex);
        const lastName = fullName.substring(lastSpaceIndex + 1, fullName.length);
        await deleteUnverifiedUser({
          variables: {
            email,
          },
        });
        await register({
          variables: {
            user: {
              firstName,
              lastName,
              email: email.toLowerCase(),
              phoneNumber,
            },
          },
        });
      }
    }
    return (
      <>
        <Body>
          {/* <GoBackButton onClick={() => setNoCodeStep(NoCodeSteps.CheckPhone)} /> */}
          <StepTitle>Let's try this again</StepTitle>
          <StepSubtitle>Please enter your correct mobile phone number.</StepSubtitle>
          <PhoneNumberInput
              value={phoneNumber}
              onChange={(phoneNumberValue: string) => {
                if (validationErrors.length > 0) setValidationErrors([]);
                if (errorMsg) setErrorMsg('');
                setPhoneNumber(phoneNumberValue);
              }}
              validationError={validationErrors[0]}
              onEnter={() => canGoToNextAction() ? goToNextAction() : null}
            />
            <Error
              children={errorMsg}
              margin="10px 0px 0px 0px"
            />
        </Body>
        <Footer>
          <Button
            type={ButtonTypes.Next}
            state={canGoToNextAction() ? ButtonStates.Active : ButtonStates.Disabled}
            text="RESEND CODE"
            loading={registerLoading || deleteLoading || sendPhoneAuthLoading}
            onClick={() => goToNextAction()}
          />
        </Footer>
    </>
    );
  }

  const getNoCodeStep = () => {
    switch(noCodeStep) {
      case NoCodeSteps.CheckPhone:
        return checkPhoneStep();
      case NoCodeSteps.CheckSignal:
        return checkSignalStep();
      case NoCodeSteps.ChangePhone:
        return changePhoneStep();
      case NoCodeSteps.EnterCode:
        return enterCodeStep();
      case NoCodeSteps.NoSignal:
        return noSignalStep();
      default:
        return checkPhoneStep();
    }
  }

  return (
    <Container>
      <LogoContainer>
        <Logo src={SelloutLogo} />
      </LogoContainer>
      {verifyUserPhoneAuthLoading || (sendPhoneAuthLoading && noCodeStep === NoCodeSteps.CheckSignal)
        ? (
          <LoaderContainer>
            <Loader size={LoaderSizes.Large} color={Colors.Orange} />
          </LoaderContainer>
        ) : (
          getNoCodeStep()
       )}
    </Container>
  );
};

export default NoCodeModal;
