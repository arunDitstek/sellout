import gql from 'graphql-tag';

const mutation = gql`
  mutation acceptRole($roleId: String!, $accept: Boolean!) {
    acceptRole(roleId: $roleId, accept: $accept) {
      _id
      userId
      userEmail
      token
      orgId
      role
      acceptedAt
    }
  }
`;

export default mutation;
