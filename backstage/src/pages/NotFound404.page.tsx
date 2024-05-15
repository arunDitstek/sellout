import React from 'react';
import styled from 'styled-components';
import Spaceman from '../assets/images/not-found-spaceman.png'
import Button, { ButtonTypes, ButtonStates } from "@sellout/ui/build/components/Button";
import { Colors } from '@sellout/ui';
import { useHistory } from 'react-router-dom';
import TextButton, { TextButtonSizes } from '@sellout/ui/build/components/TextButton';
import * as Intercom from '../utils/Intercom';
import { media } from '@sellout/ui/build/utils/MediaQuery';

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
  background: ${Colors.White};
  padding: 32px;
  border-radius: 16px;
  border: 1px solid ${Colors.Grey7};
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.05);
`;

const Image = styled.img`
  width: 400px;
  height: auto;
  ${media.mobile`
    width: 100%;
  `};
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
        <Image src={Spaceman} />
        <Title>
          Uh oh, that page doesn't exist
        </Title>
        <Subtitle>
          We're sorry, the page may have been moved or deleted.
        </Subtitle>
        <Subtitle>
            If you believe that you have reached this in error, please&nbsp;&nbsp;
          <TextButton
            size={TextButtonSizes.Regular}
            children="Contact Support"
            onClick={() => Intercom.toggle()}
          />
        </Subtitle>
        <Button
          type={ButtonTypes.Regular}
          state={ButtonStates.Active}
          text="Take me home"
          loading={false}
          onClick={() => history.push('/admin/dashboard')}
          margin="30px 0px 0px 0px"
        />
      </Container>
    </Page>
  );
};

export default NotFound404;