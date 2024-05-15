import gql from 'graphql-tag';

const mutation = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export default mutation;
