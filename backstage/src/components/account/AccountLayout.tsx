import React from "react";
import styled from "styled-components";
import ConcertVideo from './../../assets/videos/bg-video-4.mp4';
import * as Intercom from '../../utils/Intercom';
import { useMobileMedia } from '@sellout/ui/build/utils/MediaQuery';

const Container = styled.div`
  position: absolute;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.8);
`;

const Content = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BackgroundVideo = styled.video`
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
  z-index: -1;
`;

type AccountLayoutProps = {
  children: React.ReactNode,
};

const AccountLayout: React.FC<AccountLayoutProps> = ({ children })  => {
  
  const isMobile = useMobileMedia();
  React.useEffect(() => {
    Intercom.boot({}, {}, {}, isMobile);
  }, [isMobile]);

  return (
    <Container>
      <BackgroundVideo loop autoPlay muted>
        <source src={ConcertVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </BackgroundVideo>
      <Content>
       {children}
      </Content>
    </Container>
  );
};

export default AccountLayout;
