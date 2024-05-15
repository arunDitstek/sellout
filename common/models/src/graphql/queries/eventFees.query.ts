import gql from "graphql-tag";

const query = gql`
query eventFees($eventId: String!) {
    eventFees(eventId: $eventId) {
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
      __typename
    }
  }`;

export default query;
