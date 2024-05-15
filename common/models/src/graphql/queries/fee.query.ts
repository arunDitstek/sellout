import gql from "graphql-tag";

const query = gql`
  query fee($feeId: String!) {
    fee(feeId: $feeId) {
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
    }
  }
`;

export default query;
