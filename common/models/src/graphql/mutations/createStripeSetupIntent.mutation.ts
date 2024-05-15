import gql from 'graphql-tag';

const mutation = gql`
  mutation createStripeSetupIntent {
    createStripeSetupIntent
  }
`;

export default mutation;
