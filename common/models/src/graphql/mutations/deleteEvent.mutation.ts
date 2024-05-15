import gql from "graphql-tag";

const mutation = gql`
  mutation refundEventOrders(
    $eventId: String!
    $dryRun: Boolean!
    $refundReason: String
    $eventType: String
  ) {
    refundEventOrders(
      eventId: $eventId
      dryRun: $dryRun
      refundReason: $refundReason
      eventType: $eventType
    ) {
      allRefunded
    }
  }
`;

export default mutation;
