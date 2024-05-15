import gql from 'graphql-tag';

const mutation = gql`
  mutation verifyUserEmail($emailVerificationToken: String!) {
    verifyUserEmail(emailVerificationToken: $emailVerificationToken) {
      emailVerified
    }
  }
`;

export default mutation;