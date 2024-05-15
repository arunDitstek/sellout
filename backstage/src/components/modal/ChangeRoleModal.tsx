import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import { Colors, Loader, LoaderSizes } from '@sellout/ui';
import Error from '../../elements/Error';
import { BackstageState } from "../../redux/store";
import Dropdown from '@sellout/ui/build/components/Dropdown';
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import GET_ROLE from '@sellout/models/.dist/graphql/queries/role.query';
import CREATE_ROLE from '@sellout/models/.dist/graphql/mutations/createRole.mutation';
import { RolesEnum } from "@sellout/models/.dist/interfaces/IRole";
import * as StringUtil from '../../utils/StringUtil';
import gql from 'graphql-tag';
import * as Auth from "../../utils/Auth";

const GET_CURRENT_USER_ID = gql`
  query userId {
    user {
      _id
    }
  }
`;

const Container = styled.div`
  width: 100%;
`;

const LoaderContainer = styled.div`
  width: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SelfText = styled.div`
  margin-top: 16px;
  color: ${Colors.Grey2};
  font-weight: 500;
  font-size: 1.2rem;
`;

const ChangeRoleModal: React.FC = () => {
  const dispatch = useDispatch();
  const [roleType, setRoleType] = useState(RolesEnum.ADMIN);
  const [errorMsg, setErrorMsg] = useState('');
  const { roleId } = useSelector((state: BackstageState) => state.app);
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_CURRENT_USER_ID);
  const { data, loading, error } = useQuery(GET_ROLE, {
    variables: {
      roleId,
    },
  });
  const isSelf = data?.role?.user?._id === userData?.user?._id;
  const popModal = () => {
    dispatch(AppActions.popModal());
    dispatch(AppActions.setRoleId(''));
  }
  const [createRole, { loading: updateLoading }] = useMutation(CREATE_ROLE, {
    onCompleted(data) {
      if (isSelf) {
        Auth.logout();
      } else {
        popModal();
      }
    },
    onError(error) {
      setErrorMsg(getErrorMessage(error));
    }
  })

  const nextAction = () => {
    if (data?.role) {
      createRole({
        variables: {
          role: {
            userId: data.role.user?._id || '',
            userEmail: data.role.userEmail,
            orgId: data.role.orgId,
            role: roleType,
          },
          update: true,
        },
      });
    }
  }

  if (error) setErrorMsg(getErrorMessage(error));

  const items = Object.values(RolesEnum).filter((role) => {
    if (role === RolesEnum.SUPER_USER) return false;
    // if not owner, cannot assign someone to be an owner
    if (data?.role?.role !== RolesEnum.OWNER && role === RolesEnum.OWNER) return false;
    // Scanner and Box office wont event be able to see this page
    return true;
  })
  .map((role: RolesEnum) => {
    return {
      text: StringUtil.capitalizeFirstLetter(role).replace('_', ' '),
      value: role,
    };
  });


  /** Render */
  return (
    <ModalContainer>
      <ModalHeader title={`Change team member role`} close={() => popModal()} />
      <ModalContent>
        {loading || updateLoading || userLoading ? (
          <LoaderContainer>
            <Loader size={LoaderSizes.Large} color={Colors.Orange} />
          </LoaderContainer>
        ) : (
          <Container>
            <Dropdown
              value={StringUtil.capitalizeFirstLetter(roleType).replace('_', ' ')}
              items={items}
              onChange={(role: RolesEnum) => {
                setRoleType(role);
              }}
              label={data.role.acceptedAt
                ? `Which role should ${isSelf ? 'you' : `${data?.role?.user?.firstName} ${data?.role?.user?.lastName}`} be given?`
                : `Change the role for the unaccepted invite.`}
            />
            {isSelf && (
              <SelfText>
                Note: Changing your own role will log you out and you will have to log back in to continue.
              </SelfText>
            )}
            {errorMsg && <Error margin="10px 0px 0px 0px">{errorMsg}</Error>}
          </Container>
        )}
      </ModalContent>
      <ModalFooter>
        <div />
        {!loading && !updateLoading && !userLoading && (
          <Button
            type={ButtonTypes.Thin}
            text="CHANGE ROLE"
            state={ButtonStates.Active}
            onClick={() => {
              nextAction();
            }}
          />
        )}
      </ModalFooter>
    </ModalContainer>
  );
};

export default ChangeRoleModal;