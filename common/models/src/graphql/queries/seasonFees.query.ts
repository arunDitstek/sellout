import gql from "graphql-tag";

const query = gql`
query seasonFees($seasonId: String!) {
    seasonFees(seasonId: $seasonId) {
      _id
      name
      orgId
      seasonId
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
      paymentMethods
      disabled
      __typename
    }
  }`;

export default query;
