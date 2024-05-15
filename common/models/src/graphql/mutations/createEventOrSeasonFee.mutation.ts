import gql from "graphql-tag";

const mutation = gql`
  mutation createEventOrSeasonFee(
    $orgId: String
    $eventId: String
    $seasonId: String
    $fee: FeeInput!
  ) {
    createEventOrSeasonFee(
      orgId: $orgId
      eventId: $eventId
      seasonId: $seasonId
      fee: $fee
    ) {
      _id
      name
      eventId
      seasonId
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
      __typename
    }
  }
`;

export default mutation;
