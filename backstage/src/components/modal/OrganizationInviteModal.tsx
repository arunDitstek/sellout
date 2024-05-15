import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import SelloutLogo from '../../assets/images/sellout-logo-long-white.svg';
import Error from '../../elements/Error';
import { Colors, Flex, Icon, Loader, LoaderSizes, Icons } from '@sellout/ui';
import { useQuery, useMutation, useLazyQuery } from '@apollo/react-hooks';
import { getErrorMessage } from '@sellout/ui/build/utils/ErrorUtil';
import OrganizationLogo from '../OrganizationLogo';
import { BackstageState } from "../../redux/store";
import GET_ROLE from '@sellout/models/.dist/graphql/queries/role.query';
import { useHistory } from 'react-router-dom'
;import ACCEPT_ROLE from '@sellout/models/.dist/graphql/mutations/acceptRole.mutation';
import { setToken } from '../../utils/Auth';
import {
  ModalContainer,
  ModalHeader,
} from "./Modal";
import * as StringUtil from '../../utils/StringUtil';
import GET_PROFILE from '@sellout/models/.dist/graphql/queries/profile.query';
import SEND_USER_EMAIL_VERIFICATION from '@sellout/models/.dist/graphql/mutations/sendUserEmailVerification.mutation';
import {
  Container,
  LoaderContainer,
  LogoContainer,
  Body,
  Footer,
  CenterItems,
  Logo,
} from '../account/AccountStyle';

const Title = styled.div`
  color: ${Colors.Grey1};
  margin: 25px 0px 5px 0px;
  font-size: 1.8rem;
  font-weight: 600;
`;

const Subtitle = styled.div`
  color: ${Colors.Grey2};
  font-size: 1.4rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0px 30px 30px;
  box-sizing: border-box;
`;

const AlignMiddle = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

enum DisplayStates {
  Invite = 'Invite',
  VerifyEmail = 'VerifyEmail',
  WaitingForVerify = 'WaitingForVerify',
  Accepted = 'Accepted',
};

type OrgInviteDisplayProps = {
  displayState: DisplayStates;
  setDisplayState: (displayState: DisplayStates) => void;
  popModal: () => void;
  setToken?: (token: string) => void;
  token?: string;
}

const Invite: React.FC<OrgInviteDisplayProps> = ({
  displayState,
  setDisplayState,
  popModal,
  setToken,
}) => {
  /**
   * Hooks
   */
  const [errorMsg, setErrorMsg] = useState('');
  const [didAccept, setDidAccept] = React.useState(false);
  const { roleId } = useSelector((state: BackstageState) => state.app);
  const { data } = useQuery(GET_ROLE, {
    variables: {
      roleId,
    },
  });
  const [acceptRole, { data: acceptData, loading }] = useMutation(ACCEPT_ROLE, {
    onError(error) {
      setErrorMsg(getErrorMessage(error));
    },
    onCompleted(data) {
      if (didAccept) {
        if (data?.acceptRole?.token && setToken) {
          setToken(data.acceptRole.token);
          setDisplayState(DisplayStates.Accepted);
        }
      } else {
        popModal();
      }
    },
  });
  const [getProfile, { loading: profileLoading }] = useLazyQuery(GET_PROFILE, {
    onCompleted(data) {
      if (data?.user?.emailVerifiedAt) {
        setDidAccept(true);
        acceptRole({
          variables: {
            roleId,
            accept: true,
          },
        });
      } else {
        setDisplayState(DisplayStates.VerifyEmail);
      }
    },
    onError(error) {
      console.error(errorMsg);
      setErrorMsg(getErrorMessage(error));
    },
  });

  /**
   * Render
   */
  return (
    <>
      {data?.role && !loading ? (
        <>
          <Body>
            <AlignMiddle>
              <OrganizationLogo logoUrl={data?.role?.org?.orgLogoUrl} />
              <Title>
                  {`You've been invited to join ${data?.role?.org.orgName}`}
              </Title>
              <Subtitle>
                  {`Role: ${StringUtil.capitalizeFirstLetter(data?.role?.role)}`}
              </Subtitle>
              {errorMsg && (
                <Error
                  children={errorMsg}
                  margin="10px 0px 0px 0px"
                />
              )}
            </AlignMiddle>
          </Body>
          <ButtonContainer>
            <Button
              type={ButtonTypes.Next}
              text="Accept Invite"
              loading={profileLoading}
              margin="0 0 10px"
              state={ButtonStates.Active}
              onClick={() => {
                getProfile({});
              }}
            />
            <Button
              type={ButtonTypes.Next}
              state={ButtonStates.Warning}
              text="Decline Invite"
              onClick={() => {
                acceptRole({
                  variables: {
                    roleId,
                    accept: false,
                  }
                })
              }}
            />
          </ButtonContainer>
        </>
          ) : (
            <AlignMiddle>
              <Loader size={LoaderSizes.Large} color={Colors.Orange} />
            </AlignMiddle>
          )}
    </>
  );
}

const VerifyEmail: React.FC<OrgInviteDisplayProps> = ({
  displayState,
  setDisplayState,
  popModal,
}) => {
  /**
   * Hooks
   */
  const [errorMsg, setErrorMsg] = useState('');
  const [sendUserEmailVerification, { loading: emailLoading }] = useMutation(SEND_USER_EMAIL_VERIFICATION, {
    onCompleted(data) {
      setDisplayState(DisplayStates.WaitingForVerify);
    },
    onError(error) {
      setErrorMsg(getErrorMessage(error));
    }
  });

  /**
   * Render
   */
  return (
    <>
      <Body>
        <AlignMiddle>
          <Icon
            icon={Icons.EnvelopeLight}
            color={Colors.Black}
            size={64}
          />
          <Title>
            We need to verify your email address
          </Title>
          <Subtitle>
            You can only accept organization invites with a verified email address. Click the button below to recieve an email containing a verification link
          </Subtitle>
          {errorMsg && (
            <Error
              children={errorMsg}
              margin="10px 0px 0px 0px"
            />
          )}
        </AlignMiddle>
      </Body>
      <ButtonContainer>
        <Button
          type={ButtonTypes.Next}
          text="VERIFY"
          loading={emailLoading}
          state={ButtonStates.Active}
          onClick={() => emailLoading ? null : sendUserEmailVerification()}
        />
      </ButtonContainer>
    </>
  );
}

const WaitingForVerify: React.FC<OrgInviteDisplayProps> = ({
  displayState,
  setDisplayState,
  popModal,
  setToken,
}) => {
  /**
   * State
   */
  const { roleId } = useSelector((state: BackstageState) => state.app);

  /**
   * Hooks
   */
  const [errorMsg, setErrorMsg] = useState('');
  const [acceptRole, { data: acceptData, loading }] = useMutation(ACCEPT_ROLE, {
    onError(error) {
      setErrorMsg(getErrorMessage(error));
    },
    onCompleted(data) {
      if (data?.acceptRole?.token && setToken) {
        setToken(data.acceptRole.token);
        setDisplayState(DisplayStates.Accepted);
      }
    },
  });
  const { data } = useQuery(GET_PROFILE, {
    fetchPolicy: 'network-only',
    pollInterval: 2000, // check if email is verified every 2 seconds if on this page
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if(data.user.emailVerifiedAt) {
        acceptRole({
          variables: {
            roleId,
            accept: true,
          },
        });
      }
    },
  });

  /**
   * Render
   */
  return (
    <>
      <Body>
        <AlignMiddle>
          <Loader size={LoaderSizes.Large} color={Colors.Orange} />
          <Title>
            We just sent you a verification email
          </Title>
          <Subtitle>
            {`Check the inbox for ${data?.user?.email} and click the verification link to continue.`}
          </Subtitle>
          {errorMsg && (
            <Error
              children={errorMsg}
              margin="10px 0px 0px 0px"
            />
          )}
        </AlignMiddle>
      </Body>
      <ButtonContainer />
    </>
  );
}


const Accepted: React.FC<OrgInviteDisplayProps> = ({
  displayState,
  setDisplayState,
  popModal,
  token,
}) => {
  const [errorMsg, setErrorMsg] = useState('');
  const { roleId } = useSelector((state: BackstageState) => state.app);
  const { data } = useQuery(GET_ROLE, {
    variables: {
      roleId,
    },
  });

  /**
   * Render
   */
  return (
    <>
      <Body>
        <AlignMiddle>
          <OrganizationLogo logoUrl={data?.role?.org?.orgLogoUrl} />
          <Title>
              {`You now have the role of ${StringUtil.capitalizeFirstLetter(data?.role?.role)} at ${data?.role?.org.orgName}`}
          </Title>
          <Subtitle>
              Click continue to log into the organization
          </Subtitle>
          {errorMsg && (
            <Error
              children={errorMsg}
              margin="10px 0px 0px 0px"
            />
          )}
        </AlignMiddle>
      </Body>
      <ButtonContainer>
        <Button
          type={ButtonTypes.Next}
          text="Continue"
          loading={false}
          state={ButtonStates.Active}
          onClick={() => {
            if (token) {
              setToken(token);
              window.location.href = '/admin/dashboard/events';
            } else {
              setErrorMsg('Please contact support. There was an issue settings your token')
            }
          }}
        />
      </ButtonContainer>
    </>
  );
}

type OrganizationInviteModalProps = {
  isInAccountLayout?: boolean;
};

// todo pass in context of launch to determine where to go on decline invite etc
const OrganizationInviteModal: React.FC<OrganizationInviteModalProps> = ({ isInAccountLayout }) => {
  /**
   * Hooks
   */
  const dispatch = useDispatch();
  const history = useHistory();
  const [displayState, setDisplayState] = React.useState(DisplayStates.Invite);
  const [token, setToken] = React.useState('');

  /**
   * State
   */
  const popModal = () => {
    dispatch(AppActions.setRoleId(""));
    if (isInAccountLayout) {
      history.push('/account/userInfo');
    } else {
      dispatch(AppActions.popModal());
    }
  };

  /**
   * Render
   */
  return (
    <Container>
      <LogoContainer>
        <Logo src={SelloutLogo} />
      </LogoContainer>
      {(() => {
        switch(displayState) {
          case DisplayStates.Invite:
            return (
              <Invite
                displayState={displayState}
                setDisplayState={setDisplayState}
                popModal={popModal}
                setToken={setToken}
              />
            );
          case DisplayStates.VerifyEmail:
            return (
              <VerifyEmail
                displayState={displayState}
                setDisplayState={setDisplayState}
                popModal={popModal}
              />
            );
          case DisplayStates.WaitingForVerify:
            return (
              <WaitingForVerify
                displayState={displayState}
                setDisplayState={setDisplayState}
                popModal={popModal}
                setToken={setToken}
              />
            );
          case DisplayStates.Accepted:
            return (
              <Accepted
                displayState={displayState}
                setDisplayState={setDisplayState}
                popModal={popModal}
                token={token}
              />
            );
        }
      })()}
    </Container>
  );
};

export default OrganizationInviteModal;