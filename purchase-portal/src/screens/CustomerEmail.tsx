import React, { Fragment } from 'react';
import styled from 'styled-components';
import { useQuery } from '@apollo/react-hooks';
import { useSelector, useDispatch } from 'react-redux';
import { PurchasePortalState } from "../redux/store";
import { IEventGraphQL } from "@sellout/models/.dist/interfaces/IEvent";
import { Colors } from "@sellout/ui/build/Colors";
import Icon, { Icons } from "@sellout/ui/build/components/Icon";
import UserInfo, { UserInfoSizeEnum } from '@sellout/ui/build/components/UserInfo';
import Label from "@sellout/ui/build/components/Label";
import ScreenHeader from '../components/ScreenHeader';
import Input, { InputSizes } from '@sellout/ui/build/components/Input';
import ICreateUserParams from '../models/interfaces/ICreateUserParams';
import * as AppActions from '../redux/actions/app.actions';
import * as UserActions from '../redux/actions/user.actions';
import { ScreenEnum, ErrorKeyEnum } from '../redux/reducers/app.reducer';
import USER_EXISTS from '@sellout/models/.dist/graphql/queries/userExists.query';
import * as Validation from '@sellout/ui/build/utils/Validation';
import LIST_CUSTOMERS from '@sellout/models/.dist/graphql/queries/customerProfile.query';
import { IUserProfileGraphQL } from '@sellout/models/.dist/interfaces/IUserProfile';

const Container = styled.div`
  position: relative;
  top: -50px;
  background-color: ${Colors.White};
  border-radius: 15px 15px 0 0;
  overflow: hidden;
  height: max-content;
  padding-bottom: 30px;
`;

const Content = styled.div`
  margin: 24px 0 0;
  padding: 0 24px;
`;

type CustomerEmailProps = {
  event: Required<IEventGraphQL>;
};

const CustomerEmail: React.FC<CustomerEmailProps> = ({ event }) => {
  /** State **/
  const [showVerify, setShowVerify] = React.useState(false);
  
  const { app, user } = useSelector((state: PurchasePortalState) => state);
  const { errors } = app;
  const {
    lastCheckedEmail,
    confirmEmail,
    createUserParams: {
      email,
    }
  } = user;
  const [lastChecked] = React.useState(lastCheckedEmail);
  
  /** Actions **/
  const dispatch = useDispatch();
  const setCreateUserParams = (params: Partial<ICreateUserParams>) =>
    dispatch(UserActions.setCreateUserParams(params))
  const getUserProfileSuccess = (userProfile: IUserProfileGraphQL) =>
    dispatch(UserActions.getUserProfileSuccess(userProfile))

  /** GraphQL **/
  const { data, loading, error } = useQuery(LIST_CUSTOMERS, {
    variables: {
      query: {
        email,
      },
      pagination: {
        pageSize: 2,
        pageNumber: 1,
      }
    },
    context: {
      debounceKey: "LIST_CUSTOMERS"
    },
    onCompleted: (data) => {
      const userProfiles = data?.userProfiles ?? [];
      const userProfile = userProfiles?.[0];
      if(userProfiles.length === 1 && userProfile) {
        getUserProfileSuccess(userProfile);
      }
    }
  });

  const userProfiles = data?.userProfiles ?? [];
  const userProfile = userProfiles?.[0]
  const showUserProfile = userProfiles.length === 1 && userProfile;


  /** Render **/
  return (
    <Container>
      <ScreenHeader title="Customer email" />
      <Content>
        <Input
          autoFocus
          type="email"
          label="Customer email address"
          placeholder="Enter customer email address"
          size={InputSizes.Large}
          value={email}
          width="100%"
          onChange={(event: React.FormEvent<HTMLInputElement>) => {
            const email = event.currentTarget.value;
            const message = Validation.email.validate(email)?.error?.message || '';
            setCreateUserParams({ email });
          }}
          icon={Icons.EnvelopeLight}
          onClear={() => {
            setCreateUserParams({ email: '' });
          }}
          margin="0px 0px 30px 0px"
          loading={loading}
        />
        {showUserProfile && (
          <Fragment>
            <Label text="Is this the customer?" />
            <UserInfo 
              user={userProfile.user}
              size={UserInfoSizeEnum.Large}
            />
          </Fragment>
        )}
      </Content>
    </Container>
  );
};

export default CustomerEmail;
