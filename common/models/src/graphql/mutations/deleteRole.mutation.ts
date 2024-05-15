import gql from 'graphql-tag';

const mutation = gql`
  mutation deleteRole($roleId: String!) {
    deleteRole(roleId: $roleId)
  }
`;

export default mutation;
