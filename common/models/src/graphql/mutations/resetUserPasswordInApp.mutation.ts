import gql from 'graphql-tag';

const mutation = gql`
  mutation resetUserPasswordInApp($oldPassword: String!, $newPassword: String!) {
    resetUserPasswordInApp(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;

export default mutation;