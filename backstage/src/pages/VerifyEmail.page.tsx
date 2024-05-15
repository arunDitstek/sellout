import React from "react";
import VerifyEmailModal from '../components/account/VerifyEmailModal';
import {
  Container,
} from '../components/account/AccountStyle';

type OnboardingInviteProps = {};
const OnboardingInvite: React.FC<OnboardingInviteProps> = () => {
  return (
    <Container>
      <VerifyEmailModal />
    </Container>
  )
};

export default OnboardingInvite;