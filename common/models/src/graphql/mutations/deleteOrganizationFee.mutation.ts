import gql from 'graphql-tag';

const mutation = gql`
  mutation deleteOrganizationFee($orgId: String!, $feeId: String!) {
    deleteOrganizationFee(orgId: $orgId, feeId: $feeId)
  }
`;

export default mutation;