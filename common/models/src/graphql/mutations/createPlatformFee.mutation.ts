import gql from "graphql-tag";

const query = gql`
  mutation createPlatformFee($fee: FeeInput!) {
    createPlatformFee(fee: $fee) {
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

export default query;
