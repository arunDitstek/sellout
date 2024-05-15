import gql from 'graphql-tag';

const mutation = gql`
  mutation deleteStripeTerminalReader($readerId: String!) {
    deleteStripeTerminalReader(readerId: $readerId)
  }
`;

export default mutation;
