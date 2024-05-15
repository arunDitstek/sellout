import React, { useState, useEffect } from "react";
import gql from 'graphql-tag';
import styled from "styled-components";
import SelloutLogo from '../../assets/images/sellout-logo-long-white.svg';
import Button, { ButtonTypes, ButtonStates } from "@sellout/ui/build/components/Button";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { useHistory } from 'react-router-dom';
import { Colors, Icons, Loader, LoaderSizes } from '@sellout/ui';
import CodeInput from '@sellout/ui/build/components/CodeInput';
import TextButton, { TextButtonSizes } from '@sellout/ui/build/components/TextButton';
import { setToken } from '../../utils/Auth';
import { useMutation, useLazyQuery } from '@apollo/react-hooks';
import { getErrorMessage } from '@sellout/ui/build/utils/ErrorUtil';
import Error from '../../elements/Error';
import { setQueryString } from '@sellout/utils/.dist/UrlUtil';
import * as Validation from '@sellout/ui/build/utils/Validation';
import PhoneNumberInput from '@sellout/ui/build/components/PhoneNumberInput';
import NoCodeModal from './NoCodeModal';
import { useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import CHECK_USER_EXISTS from '@sellout/models/.dist/graphql/queries/userExists.query';
import DELETE_UNVERIFIED_USER from "@sellout/models/.dist/graphql/mutations/deleteUnverifiedUser.mutation";
import SEND_USER_PHONE_AUTHENTICATION from '@sellout/models/.dist/graphql/mutations/sendUserPhoneAuthentication.mutation';
import VERIFY_USER_PHONE_AUTHENTICATION from '@sellout/models/.dist/graphql/mutations/verifyUserPhoneAuthentication.mutation';
import REGISTER from '@sellout/models/.dist/graphql/mutations/register.mutation';
import SET_USER_PASSWORD from '@sellout/models/.dist/graphql/mutations/setUserPassword.mutation';
import USER_ROLES from '@sellout/models/.dist/graphql/queries/userRoles.query';
import { RolesEnum } from '@sellout/models/.dist/interfaces/IRole';
import UPDATE_USER_PREFERRED_LOGIN from '@sellout/models/.dist/graphql/mutations/updateUserPreferredLogIn.mutation';
import {
  Container,
  LoaderContainer,
  Logo,
  LogoContainer,
  Body,
  Footer,
  StepTitle,
  StepSubtitle,
  CenterItems,
} from './AccountStyle';
enum AccountSteps {
  Email = 'email',
  ConfirmEmail = 'confirmEmail',
  Info = 'info',
  PhoneVerification = 'phoneVerification',
  SetPassword = 'setPassword',
  Login = 'login',
  NoCode = 'NoCode',
  LoginWithSecondaryEmail = "LoginWithSecondaryEmail",
};

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        orgContextId
        role {
          role
        }
      }
    }
  }
`;

const RadioButtons = styled.div`
  text-align: left;
`;

const Checkbox = styled.input`
    padding: 0;
    height: initial;
    width: initial;
    margin-bottom: 0;
    display: none;
    cursor: pointer;
`;
type CheckBox = {
  checked?: boolean;
  disabled?: boolean;
}
const Label = styled.label<CheckBox>`
    position: relative;
    padding: 0 0 0 26px;
    cursor: pointer;
    &:before {
        content:'';
        -webkit-appearance: none;
        background-color: transparent;
        border: 2px solid ${props => props.checked ? '#ff700f' : '#ddd'};
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), inset 0px -15px 10px -12px rgba(0, 0, 0, 0.05);
        display: inline-block;
        vertical-align: middle;
        cursor: pointer;
        margin-right: 5px;
        border-radius: 50%;
        width: 15px;
        height: 15px;
        position: absolute;
        left: 0;
        top: 1px;
    }
    &:after {
      content: "";
      display:  ${props => props.checked ? 'block' : 'none'};
      border-radius: 50%;
      width: 10px;
      height: 10px;
      margin: 0;
      background: #ff700f;
      position: absolute;
      top: 6px;
      left: 4px;
    }
`;

const FormGroup = styled.div`
    display: flex;
    margin: 8px 8px 8px 0;
`;

type AccountModalProps = {};
const AccountModal: React.FC<AccountModalProps> = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [email, setEmail] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [confirmEmail, setConfirmEmail] = useState<string>('');
  const [existEmail, setExistEmail] = useState<string>('');
  const [secondaryEmailField, setSecondaryEmailField] = useState<string>('');
  const [secondaryEmailUpdate, setSecondaryEmailUpdate] = useState<boolean>(false);
  const [secondaryEmail, setSecondaryEmail] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [existEmailMsg, setExistEmailMsg] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [stepState, setStepState] = useState<AccountSteps>(AccountSteps.Email);
  const [preferredLogin, setPreferredLogin] = useState<string>('');
  const [hasPassword, setHasPassword] = useState<string>('');
  const [existPhoneNumber, setExistPhoneNumber] = useState<string>('');
  const [updatePrefferedLogin, setUpdatePrefferedLogin] = useState<boolean>(false);

  const [getUserRoles] = useLazyQuery(USER_ROLES, {
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    onCompleted(data) {
      let role = data?.userRoles.find((r: any) => !r.acceptedAt);
      const isUserUrl = window.location.pathname.split('/')[1] === "user"
      if (role) {
        dispatch(AppActions.setRoleId(role._id));
        history.push(`/account/onboardingInvite?roleId=${role._id}`);
      } else if (isUserUrl) {
        history.push('/my-tickets');
      }
      else {
        history.push('/account/createOrganization');
      }
    },

  });
  const [deleteUnverifiedUser, { loading: deleteLoading }] = useMutation(DELETE_UNVERIFIED_USER, {
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    onCompleted(data) {
      setStep(AccountSteps.ConfirmEmail);
    },
  });
  const [checkUserExists, { loading: checkUserExistsLoading }] = useLazyQuery(CHECK_USER_EXISTS, {
    fetchPolicy: 'no-cache',
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    async onCompleted(data) {
      setErrorMsg('');
      
      if (data?.userExists?.userId) {
        setExistPhoneNumber(data?.userExists?.phoneNumber)
        setHasPassword(data?.userExists?.hasPassword)
        if (!data?.userExists?.phoneNumberVerifiedAt) {
          // user has never logged into anything, it is safe to delete the account
          // users will only get here if they mess things up while previously registering
          // such as refreshing after not entering a phone code

          // await deleteUnverifiedUser({
          //   variables: {
          //     email,
          //   },
          // })

          await sendUserPhoneAuthentication({
            variables: {
              email,
              isLogin:true
            },
          });
          setStep(AccountSteps.PhoneVerification);
        } else if (!data?.userExists?.hasPassword) {
          // If user has a verified phone number but no password (purchase portal people)
          // make them auth by phone to get a token then set a password
          setPreferredLogin(data?.userExists?.preferredLogin);
          await sendUserPhoneAuthentication({
            variables: {
              email,
              isLogin:true
            },
          });
          setStep(AccountSteps.PhoneVerification);
        } else if (data?.userExists?.preferredLogin === "PhoneCode") {
          sendUserPhoneAuthentication({
            variables: {
              email,
              isLogin:true
            },
          });
        } else if (data?.userExists?.hasPassword) {
          setStep(AccountSteps.Login);
        }

      } else {
        setStep(AccountSteps.ConfirmEmail);
      }
    },
  });
  const [login, { loading: loginLoading }] = useMutation(LOGIN, {
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    onCompleted(data) {
      if (updatePrefferedLogin) {
        updateUserPreferredLogIn()
      }
      setErrorMsg('');
      setToken(data?.login?.token);

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
      } else {
        history.push('/account/userInfo');
      }
    },
  });
  const [sendUserPhoneAuthentication, { loading: sendPhoneAuthLoading }] = useMutation(SEND_USER_PHONE_AUTHENTICATION, {
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    onCompleted(data) {
      setErrorMsg('');
      if (preferredLogin !== "Password") {
        setStep(AccountSteps.PhoneVerification);
      }
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
      if (!hasPassword && !secondaryEmail) {
        setStep(AccountSteps.SetPassword);
      } else {
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
    }
  });
  const [register, { loading: registerLoading }] = useMutation(REGISTER, {
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    async onCompleted(data) {
      setErrorMsg('');
      if (secondaryEmailUpdate && data?.register?.userProfile?.user.preferredLogin === 'Password') {
        setStep(AccountSteps.LoginWithSecondaryEmail)
      }
      else
        await sendUserPhoneAuthentication({
          variables: {
            email,
            isLogin:true
          },
        });
    }
  });
  const [setUserPassword, { loading: setUserPasswordLoading }] = useMutation(SET_USER_PASSWORD, {
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    async onCompleted(data) {
      setErrorMsg('');
      await getUserRoles();
    }
  });


  const [updateUserPreferredLogIn, { loading: updateUserLoading }] = useMutation(UPDATE_USER_PREFERRED_LOGIN, {
    variables: {
      preferredLogin: "Password"
    },
    onCompleted(data) {
      setUpdatePrefferedLogin(false)
      //dispatch(AppActions.showNotification(`Your security settings have been saved.`, AppNotificationTypeEnum.Success));
    },
    onError(error) {
    }
  });

  const [checkUserPhoneNumberExists] = useLazyQuery(CHECK_USER_EXISTS, {
    fetchPolicy: 'no-cache',
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
    async onCompleted(data) {
      if (data?.userExists?.userId && data?.userExists?.email && !secondaryEmailUpdate) {

        ///////////// partially email hide with * ////////////
        var censorWord = (str) => {
          return str[0] + str[1] + str[2] + "*".repeat(str.length - 3)
        }
        var hideEmail = (email) => {
          var arr = email.split("@");
          return censorWord(arr[0]) + "@" + censorWord(arr[1]);
        }

        setErrorMsg("An account with this phone number is already registered to email address " + hideEmail(data?.userExists?.email) + ". If this is your account, please enter the registered email address and select one of the handling options.");
        setSecondaryEmailUpdate(true);
        setExistEmail(data?.userExists?.email)
      } else {
        const lastSpaceIndex = fullName.lastIndexOf(' ');
        const firstName = fullName.substring(0, lastSpaceIndex);
        const lastName = fullName.substring(lastSpaceIndex + 1, fullName.length);
        register({
          variables: {
            user: {
              firstName,
              lastName,
              email: email.toLowerCase(),
              phoneNumber,
              secondaryEmail
            },
          },
        });
      }
    },
  });

  useEffect(() => {
    setStep(stepState);
  }, [stepState]);

  const setStep = (step: AccountSteps) => {
    setErrorMsg('');
    setStepState(step);
    setQueryString({ step });
  };

  const emailStep = () => {
    const canGoToNextAction = () => (email);
    const goToNextAction = async () => {
      const { error } = Validation.email.validate(email);
      if (error) {
        setValidationErrors([error?.message]);
      } else {
        checkUserExists({
          variables: {
            email,
          },
        });
      }
    }
    const isUserUrl = window.location.pathname === "/user/account"

    const goToUserLoginAction = () => {
      if (isUserUrl) {
        history.push('/account');
      } else {
        history.push('/user/account');
      }
      // window.open("/user/account?section=register&step=email", "_self");
    }

    return {
      title: 'Welcome to Sellout',
      subtitle: 'Please enter your email address.',
      body: () => (
        <>
          <Input
            key={1}
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
            onClear={() => {
              setEmail("");
              setConfirmEmail("");
            }}
            onEnter={() => canGoToNextAction() ? goToNextAction() : null}
            autoFocus
            validationError={validationErrors[0]}
          />
          <Error
            children={errorMsg}
            margin="10px 0px 0px 0px"
          />
          <TextButton
            size={TextButtonSizes.Regular}
            children={isUserUrl ? "Login or create a promoter account." : "Login or create a customer account."}
            textWithoutLink={isUserUrl ? "Are you an event promoter?" : "Not an event promoter?"}
            margin="0px 10px 0px 0px"
            onClick={() => goToUserLoginAction()}
          />
        </>
      ),
      footer: () => (
        <Button
          type={ButtonTypes.Next}
          state={canGoToNextAction() ? ButtonStates.Active : ButtonStates.Disabled}
          text="next"
          loading={checkUserExistsLoading || sendPhoneAuthLoading || deleteLoading}
          onClick={() => goToNextAction()}
        />
      ),
    }
  };

  const confirmEmailStep = () => {
    const canGoToNextAction = () => ((email.toLowerCase() === confirmEmail.toLowerCase()) && (email.length > 0));
    const goToNextAction = () => {
      setStep(AccountSteps.Info);
    };

    return {
      title: 'Looks like you\'re new here!',
      subtitle: 'Please re-enter your email address',
      body: () => (
        <>
          <Input
            key={2}
            type="email"
            placeholder="Enter your email address"
            size={InputSizes.Large}
            value={email}
            width="100%"
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              if (confirmEmail) setConfirmEmail("");
              setStep(AccountSteps.Email);
              setEmail(event.currentTarget.value);
            }}
            icon={Icons.EnvelopeLight}
            onClear={() => {
              setEmail("");
              if (confirmEmail) setConfirmEmail("");
              setStep(AccountSteps.Email);
            }}
            margin="0px 0px 10px 0px"
            onEnter={() => canGoToNextAction() ? goToNextAction() : null}
          />
          <Input
            key={3}
            type="email"
            placeholder="Re-enter your email address"
            size={InputSizes.Large}
            value={confirmEmail}
            width="100%"
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              if (errorMsg) setErrorMsg('');
              setConfirmEmail(event.currentTarget.value)
            }}
            icon={Icons.CheckLight}
            onEnter={() => canGoToNextAction() ? goToNextAction() : null}
            iconConditionalColor={canGoToNextAction() ? Colors.Green : null}
            autoFocus
          />
          <Error
            children={errorMsg}
            margin="10px 0px 0px 0px"
          />
        </>
      ),
      footer: () => (
        <Button
          type={ButtonTypes.Next}
          state={canGoToNextAction() ? ButtonStates.Active : ButtonStates.Disabled}
          text="next"
          loading={false}
          onClick={() => goToNextAction()}
        />
      ),
    }
  };

  const infoStep = () => {
    const canGoToNextAction = () => (fullName && phoneNumber);
    const goToNextAction = () => {
      const { error } = Validation.fullName.validate(fullName);
      const { error: phoneError } = Validation.phoneNumber.validate(phoneNumber);
      if (error || phoneError) {
        if (error) {
          setValidationErrors([error.message]);
        }
        if (phoneError) {
          if (error) {
            setValidationErrors(validationErrors => [...validationErrors, phoneError.message]);
          } else {
            setValidationErrors(['', phoneError.message]);
          }
        }
      } else {
        const lastSpaceIndex = fullName.lastIndexOf(' ');
        const firstName = fullName.substring(0, lastSpaceIndex);
        const lastName = fullName.substring(lastSpaceIndex + 1, fullName.length);
        if (firstName && lastName) {

          checkUserPhoneNumberExists({
            variables: {
              phoneNumber,
            },
          });

        } else {
          setErrorMsg('Please include both first and last name');
        }
      }
    }
    const onSecondaryEmailChange = (value) => {
      setSecondaryEmail(value)
    }
    const goToBackAction = () => {
      setFullName("");
      setPhoneNumber("");
      setEmail("");
      setConfirmEmail("");
      setStep(AccountSteps.Email)
      setSecondaryEmailUpdate(false);
    }

    return {
      title: 'Let\'s set up your account',
      subtitle: 'We\'ll need a few details to get started.',
      body: () => (
        <>
          <Input
            key={4}
            placeholder="Enter your full name"
            size={InputSizes.Large}
            value={fullName}
            width="100%"
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              if (validationErrors.length > 0) setValidationErrors([]);
              //if (errorMsg) setErrorMsg('');
              setFullName(event.currentTarget.value);
            }}
            icon={Icons.UserLight}
            onClear={() => setFullName("")}
            onEnter={() => canGoToNextAction() ? goToNextAction() : null}
            margin="0px 0px 10px 0px"
            validationError={validationErrors[0]}
            autoFocus
          />
          <PhoneNumberInput
            key={5}
            value={phoneNumber}
            onChange={(phoneNumberValue: string) => {
              if (validationErrors.length > 0) setValidationErrors([]);
              if (errorMsg) {
                setErrorMsg('')
                setSecondaryEmailUpdate(false)
              }
              setPhoneNumber(phoneNumberValue);
            }}
            validationError={
              validationErrors[1]
            }
            onEnter={() => canGoToNextAction() ? goToNextAction() : null}
          />
          <Error
            children={errorMsg}
            margin="10px 0px 0px 0px"
          />
          <Error
            children={existEmailMsg}
            margin="10px 0px 0px 0px"
          />
          {secondaryEmailUpdate && <Input
            key={1}
            type="email"
            placeholder="Enter your registered email address"
            size={InputSizes.Large}
            value={secondaryEmailField}
            width="100%"
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              if (validationErrors.length > 0) setValidationErrors([]);
              //if (errorMsg) setErrorMsg('');
              setSecondaryEmailField(event.currentTarget.value);
            }}
            icon={Icons.EnvelopeLight}
            onClear={() => {
              setSecondaryEmailField("");
            }}
            onEnter={() => canGoToNextAction() ? goToNextAction() : null}
            autoFocus
          />}

          {
            (secondaryEmailField.toLowerCase() === existEmail.toLowerCase()) && secondaryEmailUpdate &&
            <RadioButtons>
              <FormGroup onClick={() => onSecondaryEmailChange(false)}>
                <Checkbox type="checkbox" />
                <Label checked={!secondaryEmail} >
                  My email address has changed. Please update it to {email}.</Label>
              </FormGroup>

              <FormGroup onClick={() => onSecondaryEmailChange(true)}>
                <Checkbox type="checkbox" />
                <Label checked={secondaryEmail} >
                  I have multiple email addresses. Please add {email} to my account.</Label>
              </FormGroup>

            </RadioButtons>
          }

        </>
      ),
      footer: () => {
        return (
          <>
            {(errorMsg === "" || (secondaryEmailField.toLowerCase() === existEmail.toLowerCase())) && <Button
              type={ButtonTypes.Next}
              state={canGoToNextAction() ? ButtonStates.Active : ButtonStates.Disabled}
              text="next"
              loading={registerLoading || sendPhoneAuthLoading}
              onClick={() => goToNextAction()}
            />}
            {errorMsg !== "" && (secondaryEmailField.toLowerCase() !== existEmail.toLowerCase()) && <Button
              type={ButtonTypes.Next}
              state={ButtonStates.Active}
              text="Back"
              onClick={() => goToBackAction()}
            />}
          </>
        )
      },
    }
  };

  const phoneVerificationStep = () => {
    const lastFourDigit = existPhoneNumber.slice(-4)
    return {
      title: 'Check your phone for a code',
      subtitle: ' We just texted a 4-digit code to your phone number ending in' + ` ${lastFourDigit}` + '. Please enter it below.',
      body: () => (
        <CenterItems>
          <CodeInput
            key={6}
            length={4}
            onChange={() => {
              if (errorMsg) setErrorMsg('');
            }}
            onComplete={(phoneVerificationToken: string) => {
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
            children="Try sending the code again"
            margin="35px 0px 0px 0px"
            onClick={() => {
              if (preferredLogin !== "PhoneCode") { setStepState(AccountSteps.NoCode) }
              else {
                sendUserPhoneAuthentication({
                  variables: {
                    email,
                    isLogin:true
                  },
                });
              }
            }}
          />

          {confirmEmail.length === 0 && hasPassword && <TextButton
            size={TextButtonSizes.Regular}
            children="I will login using a password"
            margin="15px 0px 0px 0px"
            onClick={() => {
              setStep(AccountSteps.Login);
              setUpdatePrefferedLogin(true)
            }}
          />}
          <Error
            children={errorMsg}
            margin="10px 0px 0px 0px"
          />
        </CenterItems>
      ),
      footer: () => (null),
    }
  };

  const setPasswordStep = () => {
    const canGoToNextAction = () => ((password === confirmPassword) && (password.length >= 8));
    const goToNextAction = () => {
      const { error } = Validation.password.validate(password);
      if (error) {
        setValidationErrors([error?.message]);
      } else {
        setUserPassword({
          variables: {
            password,
          },
        });
      }
    };

    return {
      title: 'Please set a password for your account',
      subtitle: 'Choose something nice and secret',
      body: () => (
        <>
          <Input
            key={7}
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
            // onClear={() => setPassword("")}
            type="password"
            onEnter={() => canGoToNextAction() ? goToNextAction() : null}
            margin="0px 0px 10px 0px"
            autoFocus
          />
          <Input
            key={8}
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
            onEnter={() => canGoToNextAction() ? goToNextAction() : null}
            iconConditionalColor={canGoToNextAction() ? Colors.Green : null}
            validationError={validationErrors[0]}
          />
          <Error
            children={errorMsg}
            margin="10px 0px 0px 0px"
          />
        </>
      ),
      footer: () => (
        <Button
          type={ButtonTypes.Next}
          state={canGoToNextAction() ? ButtonStates.Active : ButtonStates.Disabled}
          text="next"
          loading={setUserPasswordLoading}
          onClick={() => goToNextAction()}
        />
      ),
    }
  };

  const loginStep = () => {
    const canGoToNextAction = () => (email && password);
    const goToNextAction = () => {
      login({
        variables: {
          email,
          password,
        },
      });
    };

    return {
      title: 'Welcome back',
      subtitle: 'Please enter your password.',
      body: () => (
        <>
          <Input
            key={9}
            type="email"
            placeholder="Enter your email address"
            size={InputSizes.Large}
            value={email}
            width="100%"
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              setStep(AccountSteps.Email);
              setEmail(event.currentTarget.value);
              setPassword('');
            }}
            icon={Icons.EnvelopeLight}
            onClear={() => {
              setEmail('');
              setPassword('');
              setStep(AccountSteps.Email);
            }}
            margin="0px 0px 10px 0px"
            onEnter={() => canGoToNextAction() ? goToNextAction() : null}
          />
          {
            preferredLogin === "PhoneCode" ?
              setStepState(AccountSteps.PhoneVerification)
              : <><Input
                key={10}
                placeholder="Enter your password"
                size={InputSizes.Large}
                value={password}
                width="100%"
                onChange={(event: React.FormEvent<HTMLInputElement>) => {
                  if (errorMsg) setErrorMsg('');
                  setPassword(event.currentTarget.value);
                }}
                icon={Icons.Lock}
                type="password"
                onEnter={() => canGoToNextAction() ? goToNextAction() : null}
                autoFocus
              />
                <TextButton
                  size={TextButtonSizes.Regular}
                  children="Forgot password?"
                  margin="15px 0px 0px 0px"
                  onClick={() => history.push('/account/forgotPassword')}
                /> </>}
          <Error
            children={errorMsg}
            margin="10px 0px 0px 0px"
          />
        </>
      ),
      footer: () => (
        <Button
          type={ButtonTypes.Next}
          state={canGoToNextAction() ? ButtonStates.Active : ButtonStates.Disabled}
          text="next"
          loading={loginLoading}
          onClick={() => goToNextAction()}
        />
      ),
    }
  };

  const SecondaryEmailPasswordStep = () => {
    const canGoToNextAction = () => (email && password);
    const goToNextAction = () => {
      login({
        variables: {
          email,
          password,
        },
      });
    };

    return {
      title: '',
      subtitle: 'Please enter your password.',
      body: () => (
        <>
          <Input
            key={10}
            placeholder="Enter your password"
            size={InputSizes.Large}
            value={password}
            width="100%"
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              if (errorMsg) setErrorMsg('');
              setPassword(event.currentTarget.value);
            }}
            icon={Icons.Lock}
            type="password"
            onEnter={() => canGoToNextAction() ? goToNextAction() : null}
            autoFocus
          />
          <TextButton
            size={TextButtonSizes.Regular}
            children="Forgot password?"
            margin="15px 0px 0px 0px"
            onClick={() => history.push('/account/forgotPassword')}
          />
          <Error
            children={errorMsg}
            margin="10px 0px 0px 0px"
          />
        </>
      ),
      footer: () => (
        <Button
          type={ButtonTypes.Next}
          state={canGoToNextAction() ? ButtonStates.Active : ButtonStates.Disabled}
          text="next"
          loading={loginLoading}
          onClick={() => goToNextAction()}
        />
      ),
    }
  };

  const getAccountStep = () => {
    switch (stepState) {
      case AccountSteps.Email:
        return emailStep();
      case AccountSteps.ConfirmEmail:
        return confirmEmailStep();
      case AccountSteps.Info:
        return infoStep();
      case AccountSteps.PhoneVerification:
        return phoneVerificationStep();
      case AccountSteps.SetPassword:
        return setPasswordStep();
      case AccountSteps.Login:
        return loginStep();
      case AccountSteps.LoginWithSecondaryEmail:
        return SecondaryEmailPasswordStep();

      default:
        return emailStep();
    }
  };

  if (stepState === AccountSteps.NoCode) {
    return (
      <NoCodeModal
        setStep={setStep}
        userInfo={{
          phoneNumber: phoneNumber ? phoneNumber : existPhoneNumber,
          email,
          fullName,
        }}
      />
    );
  }

  const currentStep = getAccountStep();
  const { title, subtitle, body, footer } = currentStep;

  const showLogo =
    stepState === AccountSteps.Login
    || stepState === AccountSteps.Email
    || stepState === AccountSteps.ConfirmEmail;

  return (
    <>
      {verifyUserPhoneAuthLoading
        ? (
          <Container>
            <LogoContainer>
              <Logo src={SelloutLogo} />
            </LogoContainer>
            <LoaderContainer>
              <Loader size={LoaderSizes.Large} color={Colors.Orange} />
            </LoaderContainer>
          </Container>
        ) : (
          <Container>
            <LogoContainer>
              <Logo src={SelloutLogo} />
            </LogoContainer>
            <Body showLogo={showLogo}>
              {title && <StepTitle>{title}</StepTitle>}
              {subtitle && <StepSubtitle>{subtitle}</StepSubtitle>}
              {body && body()}
            </Body>
            <Footer>
              {footer && footer()}
            </Footer>
          </Container>
        )}
    </>
  );
};

export default AccountModal;
