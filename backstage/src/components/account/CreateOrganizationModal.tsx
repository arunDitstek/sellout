import React, { useEffect } from "react";
import { useQuery, useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import SelloutLogo from '../../assets/images/sellout-logo-long-white.svg';
import { Colors, Icon, Icons, Loader, LoaderSizes } from '@sellout/ui';
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import Button, { ButtonTypes, ButtonStates } from "@sellout/ui/build/components/Button";
import TextButton, { TextButtonSizes } from '@sellout/ui/build/components/TextButton';
import ConnectStripeButton from '../ConnectStripeButton';
import Error from '../../elements/Error';
import { FadeIn } from "@sellout/ui/build/components/Motion";
import {
  Container,
  LoaderContainer,
  LogoContainer,
  Body,
  Footer,
  StepTitle,
  StepSubtitle,
  Logo,
  CenterItems,
} from './AccountStyle';
import GET_PROFILE from '@sellout/models/.dist/graphql/queries/profile.query';
import SET_USER_ORG_CONTEXT_ID from '@sellout/models/.dist/graphql/mutations/setUserOrgContextId.mutation';
import gql from 'graphql-tag';
import url from 'url';
import { useHistory } from 'react-router-dom';

const ConfirmSkipContainer = styled.div`
  background: ${Colors.Grey7};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  margin-top: 20px;
  padding: 20px 40px;
`;

const AlignMiddle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
`;

const LightText = styled.div`
  color: ${Colors.Grey2};
  font-size: 1.4rem;
`;

const DarkText = styled.div`
  color: ${Colors.Grey1};
  font-size: 1.4rem;
  font-weight: 600;
  margin: 20px 0px 15px;
`;

const ButtonContainer = styled.div`
  display: flex;
`;

enum CreateOrgSteps {
  Name = 'Name',
  Stripe = 'Stripe',
  StripeConnected = 'StripeConnected',
};

const CREATE_ORGANIZATION = gql`
  mutation createOrganization {
    createOrganization {
      _id
    }
  }
`;

const UPDATE_ORGANIZATION = gql`
  mutation updateOrganization($organization: OrganizationInput!) {
    updateOrganization(organization: $organization) {
      _id
    }
  }
`;

type CreateOrganizationModalProps = {};
const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = () => {
  const [step, setStep] = React.useState(CreateOrgSteps.Name);
  const [orgName, setOrgName] = React.useState('');
  const [updateOrgId, setUpdateOrgId] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [showSkipConfirmation, setShowSkipConfirmation] = React.useState(false);
  const [validationError, setValidationError] = React.useState('');
  const [createOrganization] = useMutation(CREATE_ORGANIZATION);
  const [setUserOrgContextId] = useMutation(SET_USER_ORG_CONTEXT_ID);
  const [updateOrganization] = useMutation(UPDATE_ORGANIZATION);
  const { data, loading } = useQuery(GET_PROFILE, { fetchPolicy: 'network-only' });
  const history = useHistory();
  const parsed = url.parse(window.location.toString(), true);
  const connectCode = parsed.query.code;

  // React.useEffect(() => {
  //   (async () => {
  //     if (data?.organization && data?.user) {
  //       if (!data?.user.orgContextId || !data?.organization._id) {
  //         const orgData = await createOrganization();
  //         let orgId = orgData.data.createOrganization._id;
  //         let roleData = await setUserOrgContextId({
  //           variables: {
  //             orgId,
  //           },
  //         });
  //         const { token } = roleData.data.setUserOrgContextId;
  //         localStorage.setItem('SELLOUT_AUTH_TOKEN', token);
  //       } else {
  //         // change this later,
  //         // hacky way before we figure out where we are putting this stuff
  //         if (data?.organization?.stripeId) {
  //           setStep(CreateOrgSteps.StripeConnected);
  //         } else if (connectCode) {
  //           setStep(CreateOrgSteps.Stripe);
  //         }
  //         setOrgName(data?.organization?.orgName);
  //       }
  //     }
  //   })()
  // }, [connectCode, createOrganization, data, setUserOrgContextId]);

  const Name = () => {
    const canGoToNextAction = () => (orgName);
    const goToNextAction = async () => {
      if (validationError) setValidationError('');

      if (!updateOrgId) {
        const orgData = await createOrganization();
        let orgId = orgData.data.createOrganization._id;

        let roleData = await setUserOrgContextId({
          variables: {
            orgId,
          },
        });
        const { token } = roleData.data.setUserOrgContextId;
        localStorage.setItem('SELLOUT_AUTH_TOKEN', token);
      }
      updateOrganization({
        variables: {
          organization: {
            orgName,
          }
        }
      })
      setStep(CreateOrgSteps.Stripe);
      setUpdateOrgId(true);
    };

    const goToUserLoginAction = () => {
        history.push('/user/account');
    }

    return (
      <>
        <Body>
          <StepTitle>What's your organization's name?</StepTitle>
          <StepSubtitle>This is the name that will be displayed to your customers</StepSubtitle>
          <Input
            key={1}
            type="text"
            placeholder="Enter your organization name"
            size={InputSizes.Large}
            value={orgName}
            width="100%"
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              if (errorMsg) setErrorMsg('');
              if (validationError) setValidationError('');
              setOrgName(event.currentTarget.value);
            }}
            icon={Icons.OrganizationLight}
            onClear={() => setOrgName("")}
            onEnter={() => canGoToNextAction()
              ? goToNextAction()
              : setValidationError('You must enter an organization name')
            }
            autoFocus
            validationError={validationError}
          />
          <Error
            children={errorMsg}
            margin="10px 0px 0px 0px"
          />
          <TextButton
            size={TextButtonSizes.Regular}
            children={"Back to login"}
            margin="0px 10px 0px 0px"
            onClick={() => goToUserLoginAction()}
          />
        </Body>
        <Footer>
          <Button
            type={ButtonTypes.Next}
            state={canGoToNextAction() ? ButtonStates.Active : ButtonStates.Disabled}
            text="next"
            loading={false}
            onClick={() => goToNextAction()}
          />
        </Footer>
      </>
    );
  }

  const Stripe = () => {
    const { platformSettings: { stripeClientId, stripeRedirectUrl }, organization: { stripeId } } = data;

    const goToBackAction = () => {
      setStep(CreateOrgSteps.Name);
    }

    return (
      <>
        <Body>
          <CenterItems>
            <StepTitle>Let's connect your bank with Stripe</StepTitle>
            <StepSubtitle>We'll need to securely connect your bank account to deposit earnings. Click the button below to set up your bank using Stripe.</StepSubtitle>
            <ConnectStripeButton
              stripeClientId={stripeClientId}
              stripeRedirectUrl={stripeRedirectUrl}
              stripeId={stripeId}
              setErrorMsg={setErrorMsg}
            />
            <TextButton
              size={TextButtonSizes.Regular}
              children="Skip this step for now"
              margin="20px 0px 0px 0px"
              onClick={() => setShowSkipConfirmation(true)}
            />
            {showSkipConfirmation && (
              <FadeIn>
                <ConfirmSkipContainer>
                  <LightText>
                    You will not be able to sell tickets or charge customers until Stripe is set up.
                  </LightText>
                  <DarkText>
                    Are you sure you want to skip?
                  </DarkText>
                  <ButtonContainer>
                    <Button
                      type={ButtonTypes.Thin}
                      state={ButtonStates.Warning}
                      text="NO, DON'T SKIP"
                      loading={false}
                      margin="0px 10px 0px 0px"
                      onClick={() => setShowSkipConfirmation(false)}
                    />
                    <Button
                      type={ButtonTypes.Thin}
                      state={ButtonStates.Active}
                      text="YES, SKIP FOR NOW"
                      loading={false}
                      onClick={() => history.push('/admin/dashboard')}
                    />
                  </ButtonContainer>
                </ConfirmSkipContainer>
              </FadeIn>
            )}
          </CenterItems>
        </Body>

        {!showSkipConfirmation && <Footer>
          <Button
            type={ButtonTypes.Next}
            state={ButtonStates.Active}
            text="back"
            loading={false}
            onClick={() => goToBackAction()}
          />
        </Footer>}
      </>
    );
  }

  const StripeConnected = () => {
    return (
      <>
        <Body>
          <AlignMiddle>
            <Icon
              icon={Icons.CheckCircle}
              color={Colors.Green}
              size={72}
              margin="0px 0px 30px 0px"
            />
            <StepTitle>Bank account is connected!</StepTitle>
            <StepSubtitle>You're ready to start selling tickets to your event. Let's get this show on the road.</StepSubtitle>
          </AlignMiddle>
        </Body>
        <Footer>
          <Button
            type={ButtonTypes.Next}
            state={ButtonStates.Active}
            text="next"
            loading={false}
            onClick={() => history.push('/admin/dashboard')}
          />
        </Footer>
      </>
    );
  }

  const CreateOrgStep = () => {
    switch (step) {
      case CreateOrgSteps.Name:
        return <Name />;
      case CreateOrgSteps.Stripe:
        return <Stripe />;
      case CreateOrgSteps.StripeConnected:
        return <StripeConnected />;
      default:
        return <Name />;
    }
  }

  return (
    <Container>
      <LogoContainer>
        <Logo src={SelloutLogo} />
      </LogoContainer>
      {loading ? (
        <LoaderContainer>
          <Loader size={LoaderSizes.Large} color={Colors.Orange} />
        </LoaderContainer>
      ) : (
        <CreateOrgStep />
      )}
    </Container>
  )
}

export default CreateOrganizationModal;