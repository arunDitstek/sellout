import gql from 'graphql-tag';

const mutation = gql`
  mutation setUserOrgContextId($orgId: String) {
    setUserOrgContextId(orgId: $orgId) {
      token
    }
  }
`;

export default mutation;