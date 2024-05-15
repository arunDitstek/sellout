import gql from 'graphql-tag';

const mutation = gql`
  mutation verifyUserPhoneNumber($phoneVerificationToken: String!) {
    verifyUserPhoneNumber(phoneVerificationToken: $phoneVerificationToken) {
      phoneVerified
    }
  }
`;

export default mutation;