import gql from "graphql-tag";

const mutation = gql`
  mutation createOrganizationFee($orgId: String!, $fee: FeeInput!) {
    createOrganizationFee(orgId: $orgId, fee: $fee) {
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
      paymentMethods
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
