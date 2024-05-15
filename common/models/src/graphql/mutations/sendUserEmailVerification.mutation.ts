
import gql from 'graphql-tag';

const query = gql`
  mutation sendUserEmailVerification {
    sendUserEmailVerification {
      sent
    }
  }
`;

export default query;