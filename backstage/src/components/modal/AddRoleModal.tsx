import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import * as AppActions from "../../redux/actions/app.actions";
import Button, { ButtonTypes, ButtonStates } from "@sellout/ui/build/components/Button";
import Input, { InputSizes } from "@sellout/ui/build/components/Input";
import { Icons, Colors, Loader, LoaderSizes } from "@sellout/ui";
import Error from "../../elements/Error";
import * as Validation from "@sellout/ui/build/utils/Validation";
import Dropdown from "@sellout/ui/build/components/Dropdown";
import gql from "graphql-tag";
import CREATE_ROLE from '@sellout/models/.dist/graphql/mutations/createRole.mutation';
import { getErrorMessage } from "@sellout/ui/build/utils/ErrorUtil";
import QUERY_ROLES from "@sellout/models/.dist/graphql/queries/roles.query";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { RolesEnum } from '@sellout/models/.dist/interfaces/IRole';
import * as StringUtil from '../../utils/StringUtil';
import {
  ModalContainer,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "./Modal";

const Container = styled.div`
  width: 100%;
`;

const LoaderContainer = styled.div`
  width: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spacer = styled.div`
  height: 10px;
`;

const GET_ORGANIZATION_ID = gql`
  query organization {
    organization {
      _id
    }
  }
`;

// TODO: backend change: disallow adding people including yourself multiple times
const AddRoleModal: React.FC = () => {
  const dispatch = useDispatch();
  const [validationError, setValidationError] = useState("");
  const [roleType, setRoleType] = useState(RolesEnum.ADMIN);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  // const [userId, setUserId] = useState('');
  const { data, loading, error } = useQuery(GET_ORGANIZATION_ID);
  // const { data: checkUserData } = useQuery(CHECK_USER_EXISTS, {
  //   variables: {
  //     email,
  //   },
  //   context: {
  //     debounceKey: 'CHECK_USER_EXISTS',
  //   }
  // });
  const [createRole, { loading: createLoading }] = useMutation(CREATE_ROLE, {
    refetchQueries: [{ query: QUERY_ROLES }],
    onCompleted(data) {
      popModal();
    },
    onError(error) {
      console.error(error);
      setErrorMsg(getErrorMessage(error));
    },
  });
  // React.useEffect(() => {
  //   if (checkUserData?.userExists?.userId) {
  //     setUserId(checkUserData.userExists.userId);
  //   }
  // }, [checkUserData])

  const popModal = () => {
    dispatch(AppActions.popModal());
  };

  const nextAction = () => {
    const { error } = Validation.email.validate(email);
    if (error) {
      setValidationError(error.message);
    } else {
      createRole({
        variables: {
          role: {
            userId: '',
            userEmail: email,
            role: roleType,
            orgId: data.organization._id,
          },
          update: false,
        },
      });
    }
  };

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
      <ModalHeader title="Add team member" close={popModal} />
      <ModalContent>
        {loading || createLoading ? (
          <LoaderContainer>
            <Loader size={LoaderSizes.Large} color={Colors.Orange} />
          </LoaderContainer>
        ) : (
          <Container>
            <Input
              label="Email address"
              type="email"
              placeholder="Enter an email address"
              size={InputSizes.Large}
              value={email}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                if (validationError) setValidationError("");
                if (errorMsg) setErrorMsg("");
                setEmail(event.currentTarget.value);
              }}
              icon={Icons.EnvelopeLight}
              onClear={() => {
                setEmail("");
              }}
              margin="0px 0px 10px 0px"
              onEnter={() => (email ? nextAction() : null)}
              validationError={validationError}
              autoFocus
            />
            <Spacer />
            <Dropdown
              value={StringUtil.capitalizeFirstLetter(roleType).replace('_', ' ')}
              items={items}
              onChange={(role: RolesEnum) => {
                setRoleType(role);
              }}
              label="Role"
            />
            {errorMsg && <Error margin="10px 0px 0px 0px">{errorMsg}</Error>}
          </Container>
        )}
      </ModalContent>
      <ModalFooter>
        <div />
        {!loading && !createLoading && (
          <Button
            type={ButtonTypes.Thin}
            text="ADD TEAM MEMBER"
            state={email ? ButtonStates.Active : ButtonStates.Disabled}
            onClick={() => nextAction()}
          />
        )}
      </ModalFooter>
    </ModalContainer>
  );
};

export default AddRoleModal;
