import gql from "graphql-tag";

const query = gql`
  query fees($feeIds: [String]!,$orgId: String) {
    fees(feeIds: $feeIds,orgId:$orgId) {
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
