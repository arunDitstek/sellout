import gql from 'graphql-tag';

const query = gql`
  query organizationFees($orgId: String!) {
    organizationFees(orgId: $orgId) {
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
      isApplyPlatformFee
    }
  }
`;

export default query;