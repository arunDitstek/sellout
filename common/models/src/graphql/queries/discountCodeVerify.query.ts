import gql from "graphql-tag";

const query = gql`
 query eventDiscounts($eventId: String, $seasonId: String, $discountCode: String!,$userId: String,$selectedTicket:[String]) {
  eventDiscounts(eventId: $eventId, seasonId: $seasonId, discountCode: $discountCode, userId: $userId,selectedTicket:$selectedTicket) {
    promoType
    active
    startsAt
    endsAt
    remainingQty
    overRideMax
    discountType
    discountValue
    appliesTo
    ticketTypeIds
    selectedTicket
  }
}

`;

export default query;
