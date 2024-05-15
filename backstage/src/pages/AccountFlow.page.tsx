import React from 'react';
import styled from 'styled-components';
import AccountModal from '../components/account/AccountModal';

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type AccountFlowProps = {
  match: any;
};

const AccountFlow: React.FC<AccountFlowProps> = ({ match }) => (
  <Container>
    <AccountModal />
  </Container>
);

export default AccountFlow;
