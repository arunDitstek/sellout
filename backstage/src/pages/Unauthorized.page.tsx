import React from 'react';
import styled from 'styled-components';
import Button, { ButtonTypes, ButtonStates } from "@sellout/ui/build/components/Button";
import { Icon, Icons, Colors } from '@sellout/ui';
import { useHistory } from 'react-router-dom';
import TextButton, { TextButtonSizes } from '@sellout/ui/build/components/TextButton';

const Page = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  max-width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const Title = styled.div`
  color: ${Colors.Grey1};
  font-weight: 600;
  font-size: 2.4rem;
  margin-bottom: 10px;
`;

const Subtitle = styled.div`
  margin-top: 5px;
  display: flex;
  font-weight: 500;
  font-size: 1.4rem;
  color: ${Colors.Grey3};
`;

type NotFound404Props = {};

const NotFound404: React.FC<NotFound404Props> = () => {
  /** Hooks */
  const history = useHistory();

  /** Render */
  return (
    <Page>
      <Container>
        <Icon
          icon={Icons.Lock}
          color={Colors.Grey3}
          size={96}
          margin="0px 0px 40px 0px"
        />
        <Title>
          You do not have permission to view this page
        </Title>
        <Subtitle>
          If you feel you have reached this page in error, please contact your account administrator.
        </Subtitle>
        <Button
          type={ButtonTypes.Regular}
          state={ButtonStates.Active}
          text="BACK TO EVENTS"
          onClick={() => history.push('/admin/dashboard/events')}
          margin="30px 0px 0px 0px"
        />
      </Container>
    </Page>
  );
};

export default NotFound404;