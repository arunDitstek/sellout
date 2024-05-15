import React from 'react';
import styled from 'styled-components';
import { Colors } from "@sellout/ui";
import UserImage from '@sellout/ui/build/components/UserImage';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Name = styled.div`
  font-size: 1.8rem;
  color: ${Colors.Grey1};
  font-weight: 600;
  margin-bottom: 5px;
`;

const Email = styled.div`
  font-size: 1.4rem;
  color: ${Colors.Grey2};
  margin-bottom: 5px;
`;

const PhoneNumber = styled.div`
  font-size: 1.4rem;
  color: ${Colors.Grey2};
`;

type UserInfoPropTypes = {
  user?: any;
  invert?: boolean;
};

const VerticalUserInfo: React.FC<UserInfoPropTypes> = ({
  user = {},
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

  const UserName = React.memo(() => <Name>{firstName}&nbsp;{lastName}</Name>);
  const UserEmail = React.memo(() => <Email>{email}</Email>);
  const UserPhoneNumber = React.memo(() => <PhoneNumber>{phoneNumber}</PhoneNumber>);

  return (
    <Container>
      <UserImage
        imageUrl={imageUrl}
        margin="0px 0px 10px 0px"
        height="64px"
        size="2.4rem"
        firstName={firstName}
        lastName={lastName}
        invert={invert}
      />
      <Details>
        <UserName />
        <UserEmail />
        <UserPhoneNumber />
      </Details>
    </Container>
  );
}

export default VerticalUserInfo;

