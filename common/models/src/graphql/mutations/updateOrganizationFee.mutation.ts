import gql from 'graphql-tag';

const mutation = gql`
  mutation updateOrganizationFee($orgId: String!, $fee: FeeInput!) {
    updateOrganizationFee(orgId: $orgId, fee: $fee) {
      _id
      name
      orgId
      eventId
      type
      value
      appliedTo
      appliedBy
      minAppliedToPrice
      maxAppliedToPrice
      filters
      createdBy
      createdAt
      updatedBy
      updatedAt
      disabled
      paymentMethods
    }
  }
`;

export default mutation;