import gql from 'graphql-tag';

const query = gql`
  mutation verifyUserPhoneAuthentication($email: String, $phoneNumber: String, $phoneVerificationToken: String!){
    verifyUserPhoneAuthentication(email: $email, phoneNumber: $phoneNumber, phoneVerificationToken: $phoneVerificationToken) {
      token,
      user {
        orgContextId
        role {
          role
          __typename
        }
      }
    }
  }
`;

export default query;
