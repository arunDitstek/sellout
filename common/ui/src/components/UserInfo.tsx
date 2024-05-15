import React from 'react';
import styled from 'styled-components';
import { Colors } from "../Colors";
import UserImage from './UserImage';

export const Container = styled.div`
  display: flex;
`;

export const Details = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export const Name = styled.div`
  font-size: 1.4rem;
  color: ${Colors.Grey1};
  font-weight: 600;
`;

export const Email = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey2};
`;

const PhoneNumber = styled.div`
  font-size: 1.2rem;
  color: ${Colors.Grey2};
`;

export enum UserInfoSizeEnum {
  Regular = 'Regular',
  Large = 'Large',
};

type UserInfoPropTypes = {
  user?: any;
  size?: UserInfoSizeEnum;
  invert?: boolean;
};

const UserInfo: React.FC<UserInfoPropTypes> = ({
  user = {},
  size = UserInfoSizeEnum.Regular,
  invert = false,
}) => {
  const {
    firstName,
    lastName,
    email,
    phoneNumber,
    userProfile: {
      imageUrl = '',
    } = {},
  } = user;
  const isLarge = size === UserInfoSizeEnum.Large;
  const UserName = React.memo(() => <Name>{firstName}&nbsp;{lastName}</Name>);
  const UserEmail = React.memo(() => <Email>{email}</Email>);
  const UserPhoneNumber = React.memo(() => <PhoneNumber>{phoneNumber}</PhoneNumber>);
  const height = isLarge ? '50px' : '36px';
  return (
    <Container>
      <UserImage
        imageUrl={imageUrl}
        height={height}
        size={isLarge ? "1.8rem" : "1.4rem"}
        firstName={firstName}
        lastName={lastName}
        invert={invert}
      />
      <Details>
        {firstName && lastName && <UserName />}
        {email && <UserEmail />}
        {isLarge && phoneNumber && <UserPhoneNumber />}
      </Details>
    </Container>
  );
}

export default UserInfo;

