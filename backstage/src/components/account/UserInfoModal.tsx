import React from "react";
import { useQuery, useMutation, useLazyQuery } from '@apollo/react-hooks';
import styled from 'styled-components';
import { Colors, Icon, Icons, Loader, LoaderSizes } from '@sellout/ui';
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import Button, { ButtonTypes, ButtonStates } from "@sellout/ui/build/components/Button";
import { setToken, logout } from '../../utils/Auth';
import { useDispatch, useSelector} from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import {
  Container,
  LoaderContainer,
  LogoContainer,
  Body,
  Footer,
  CenterItems,
  Logo,
} from './AccountStyle';
import SelloutLogo from '../../assets/images/sellout-logo-long-white.svg';
import GET_PROFILE from '@sellout/models/.dist/graphql/queries/profile.query';
import SET_USER_ORG_CONTEXT_ID from '@sellout/models/.dist/graphql/mutations/setUserOrgContextId.mutation';
import { useHistory } from 'react-router-dom';
import VerticalUserInfo from '../../elements/VerticalUserInfo';
import USER_ROLES from '@sellout/models/.dist/graphql/queries/userRoles.query';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const AlignMiddle = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type UserInfoModalProps = {};
const UserInfoModal: React.FC<UserInfoModalProps> = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const [setOrgContext] = useMutation(SET_USER_ORG_CONTEXT_ID, {
    onError(error) {
      console.error(error);
    },
    onCompleted(data) {
      setToken(data?.setUserOrgContextId?.token);
      window.location.href = '/admin/dashboard';
    },
  });
  const { data, loading } = useQuery(GET_PROFILE);
  const { data: roleData, loading: roleLoading } = useQuery(USER_ROLES, {
    fetchPolicy: 'network-only',
  });

  React.useEffect(() => {
    if (roleData) {
      let unacceptedRole = roleData?.userRoles.find((r: any) => !r.acceptedAt);
      let acceptedRole = roleData?.userRoles.find((r: any) => r.acceptedAt);
      if (unacceptedRole) {
        dispatch(AppActions.setRoleId(unacceptedRole._id));
        history.push(`/account/onboardingInvite?roleId=${unacceptedRole._id}`);
      } else if (acceptedRole) {
        setOrgContext({
          variables: {
            orgId: acceptedRole.orgId,
          }
        })
      }
    }
  }, [dispatch, history, roleData, setOrgContext]);


  return (
    <Container>
      <LogoContainer>
        <Logo src={SelloutLogo} />
      </LogoContainer>
      {loading || roleLoading ? (
        <LoaderContainer>
          <Loader size={LoaderSizes.Large} color={Colors.Orange} />
        </LoaderContainer>
      ) : (
        <>
          <Body>
            <AlignMiddle>
              <VerticalUserInfo user={data?.user} />
            </AlignMiddle>
          </Body>
          <Footer>
            <ButtonContainer>
              <Button
                type={ButtonTypes.Next}
                state={ButtonStates.Active}
                text="CREATE EVENT"
                margin="0px 0px 10px 0px"
                onClick={() => {
                  history.push('/account/createOrganization');
                }}
              />
              <Button
                type={ButtonTypes.Next}
                state={ButtonStates.Warning}
                text="LOG OUT"
                onClick={() => {
                  logout();
                }}
              />
            </ButtonContainer>
          </Footer>
        </>
      )}
    </Container>
  )
}

export default UserInfoModal;
