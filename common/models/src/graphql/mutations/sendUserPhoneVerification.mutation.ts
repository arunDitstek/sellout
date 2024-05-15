import gql from 'graphql-tag';

const mutation = gql`
  mutation sendUserPhoneVerification {
    sendUserPhoneVerification {
      sent
    }
  }
`;

export default mutation;