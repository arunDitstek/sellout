import gql from "graphql-tag";

const mutation = gql`
  mutation createFee($fee: FeeInput!) {
    createFee(fee: $fee) {
      _id
      name
      orgId
      eventId
      seasonId
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
    }
  }
`;

export default mutation;
