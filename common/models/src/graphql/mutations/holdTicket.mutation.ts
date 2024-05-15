import gql from "graphql-tag";

const mutation = gql`
  mutation holdTicket($eventId: String, $params: TicketHoldInput) {
    holdTicket(params: $params, eventId: $eventId) {
      _id
    }
  }
`;

export default mutation;
