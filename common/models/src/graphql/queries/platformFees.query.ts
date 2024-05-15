import gql from 'graphql-tag';

const query = gql`
  query platformFees {
    platformFees {
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