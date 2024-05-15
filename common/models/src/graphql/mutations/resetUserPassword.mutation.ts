import gql from 'graphql-tag';

const mutation = gql`
  mutation resetUserPassword($forgotPasswordCode: String!, $password: String!) {
    resetUserPassword(forgotPasswordCode: $forgotPasswordCode password: $password)
  }
`;

export default mutation
