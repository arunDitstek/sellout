import React from "react";
import { useMutation } from '@apollo/react-hooks';
import styled from 'styled-components';
import { Colors, Icon, Icons, Loader, LoaderSizes } from '@sellout/ui';
import { getErrorMessage } from '@sellout/ui/build/utils/ErrorUtil';
import Error from '../../elements/Error';
import url from 'url';
import {
  Container,
  LoaderContainer,
  LogoContainer,
  Body,
  Logo,
} from './AccountStyle';
import SelloutLogo from '../../assets/images/sellout-logo-long-white.svg';
import VERIFY_USER_EMAIL from '@sellout/models/.dist/graphql/mutations/verifyUserEmail.mutation';

const Title = styled.div`
  color: ${Colors.Grey1};
  margin: 15px 0px 5px 0px;
  font-size: 1.8rem;
  font-weight: 600;
`;

const Subtitle = styled.div`
  color: ${Colors.Grey2};
  font-size: 1.4rem;
`;

const AlignMiddle = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
`;

enum PageStateEnum {
  Error = 'Error',
  Success = 'Success',
};

type UserInfoModalProps = {};
const UserInfoModal: React.FC<UserInfoModalProps> = () => {
  const [pageState, setPageState] = React.useState(PageStateEnum.Error);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [verifyUserEmail, { loading }] = useMutation(VERIFY_USER_EMAIL, {
    onCompleted(data) {
      setPageState(PageStateEnum.Success);
    },
    onError(error) {
      setErrorMsg(getErrorMessage(error));
      setPageState(PageStateEnum.Error);
    }
  });
  const { query: { code } } = url.parse(window.location.toString(), true);

  React.useEffect(() => {
    if (code) {
      verifyUserEmail({
        variables: {
          emailVerificationToken: code,
        }
      });
    } else {
      setErrorMsg('No verification code provided');
    }
  }, [code, verifyUserEmail]);
  // http://localhost:3000/account/verifyEmail/?code=asdf

  return (
    <Container>
      <LogoContainer>
        <Logo src={SelloutLogo} />
      </LogoContainer>
      {loading ? (
        <LoaderContainer>
          <Loader size={LoaderSizes.Large} color={Colors.Orange} />
        </LoaderContainer>
      ) : (
        <>
          {pageState === PageStateEnum.Success ? (
            <Body>
              <AlignMiddle>
                <Icon
                  icon={Icons.CheckCircle}
                  color={Colors.Green}
                  size={64}
                />
                <Title>
                  Your email has been verified
                </Title>
                <Subtitle>
                  Please return to your original browser window or tab
                </Subtitle>
                {errorMsg && (
                  <Error margin="10px 0px 0px 0px">
                  {errorMsg}
                  </Error>
                )}
              </AlignMiddle>
            </Body>
          ) : (
            <Body>
              <AlignMiddle>
                <Icon
                  icon={Icons.Cancel}
                  color={Colors.Red}
                  size={64}
                />
                <Title>
                  There was an error verifying your email
                </Title>
                {errorMsg && (
                  <Error margin="10px 0px 0px 0px">
                  {errorMsg || 'Please contact support'}
                  </Error>
                )}
              </AlignMiddle>
            </Body>
          )}
        </>
      )}
    </Container>
  )
}

export default UserInfoModal;
