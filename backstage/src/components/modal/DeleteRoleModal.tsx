import React, { useState } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from '@sellout/ui/build/components/Button';
import { Colors, Loader, LoaderSizes } from '@sellout/ui';
import Error from '../../elements/Error';
import { useQuery, useMutation } from "@apollo/react-hooks";
import { BackstageState } from "../../redux/store";
import UserInfo, { UserInfoSizeEnum } from '@sellout/ui/build/components/UserInfo'
import QUERY_ROLES from '@sellout/models/.dist/graphql/queries/roles.query';
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import GET_ROLE from '@sellout/models/.dist/graphql/queries/role.query';
import DELETE_ROLE from '@sellout/models/.dist/graphql/mutations/deleteRole.mutation';

const Container = styled.div`
  width: 100%;
`;

const LoaderContainer = styled.div`
  width: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DarkText = styled.div`
  font-weight: 600;
  color: ${Colors.Grey2};
  font-size: 1.4rem;
  margin: 25px 0px;
`;

const LightText = styled.div`
  font-weight: 500;
  color: ${Colors.Grey2};
  font-weight: 1.4rem;
`;

const DeleteRoleModal: React.FC = () => {
  const dispatch = useDispatch();
  const [errorMsg, setErrorMsg] = useState('');
  const { roleId } = useSelector((state: BackstageState) => state.app);
  const { data, loading, error } = useQuery(GET_ROLE, {
    variables: {
      roleId,
    },
  });
  const [deleteRole, { loading: deleteLoading }] = useMutation(DELETE_ROLE, {
    refetchQueries: [{ query: QUERY_ROLES }],
    onCompleted(data) {
      popModal();
    },
    onError(error) {
      setErrorMsg(getErrorMessage(error));
    },
  });
  const popModal = () => {
    dispatch(AppActions.popModal());
    dispatch(AppActions.setRoleId(''));
  };
  const nextAction = () => {
    deleteRole({
      variables: {
        roleId,
      },
    });
  };

  if (error) setErrorMsg(getErrorMessage(error));

  /** Render */
  return (
    <ModalContainer>
      <ModalHeader title="Remove user from this organization" close={() => popModal()} />
      <ModalContent>
        {loading || deleteLoading ? (
          <LoaderContainer>
            <Loader size={LoaderSizes.Large} color={Colors.Orange} />
          </LoaderContainer>
        ) : (
          <Container>
            <UserInfo
              user={data.role.user || { email: data.role.userEmail }}
              size={UserInfoSizeEnum.Regular}
            />
            <DarkText>
              {data.role.acceptedAt
                ? `Are you sure you want to remove ${data?.role?.user?.firstName} ${data?.role?.user?.lastName} from this organization?`
                : `Are you sure you want to rescind the invite that was sent to ${data.role.userEmail}?`}
            </DarkText>
            <LightText>
              {data.role.acceptedAt
              ?`${data?.role?.user?.firstName} ${data?.role?.user?.lastName} will be removed immediately and will no longer be able to log into this organization unless they are invited back.`
              : `This user will not be allowed to join this organization unless they are sent another invite.`}
            </LightText>
            {errorMsg && <Error margin="10px 0px 0px 0px">{errorMsg}</Error>}
          </Container>
        )}
      </ModalContent>
      <ModalFooter>
        <div />
        {!loading && !deleteLoading && (
          <Button
            type={ButtonTypes.Thin}
            text={data.role.acceptedAt ? "REMOVE TEAM MEMBER" : 'INVALIDATE INVITE'}
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

export default DeleteRoleModal;