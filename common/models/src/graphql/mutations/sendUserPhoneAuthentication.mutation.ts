import gql from 'graphql-tag';

const query = gql`
  mutation sendUserPhoneAuthentication($email: String, $phoneNumber: String, $isLogin:Boolean) {
    sendUserPhoneAuthentication(email: $email, phoneNumber: $phoneNumber, isLogin: $isLogin)
  }
`;

export default query;
