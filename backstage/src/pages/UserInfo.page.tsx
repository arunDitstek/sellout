import React from "react";
import {
  Container,
} from '../components/account/AccountStyle';
import UserInfoModal from '../components/account/UserInfoModal';

type UserInfoProps = {};
const UserInfo: React.FC<UserInfoProps> = () => {
  return (
    <Container>
      <UserInfoModal />
    </Container>
  )
};

export default UserInfo;