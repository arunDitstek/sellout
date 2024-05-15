import gql from 'graphql-tag';

const mutation = gql`
  mutation updatePlatformFee($fee: FeeInput!) {
    updatePlatformFee(fee: $fee) {
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