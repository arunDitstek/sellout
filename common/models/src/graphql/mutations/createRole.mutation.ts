import gql from 'graphql-tag';

const mutation = gql`
  mutation createRole($role: RoleInput!, $update: Boolean) {
    createRole(role: $role, update: $update) {
      _id
      userId
      userEmail
      orgId
      role
    }
  }
`;

export default mutation;
