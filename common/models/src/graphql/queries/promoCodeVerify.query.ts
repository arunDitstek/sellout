import gql from "graphql-tag";

const query = gql`
  query eventTickets($eventId: String, $seasonId: String, $promoCode: String!) {
    eventTickets(
      eventId: $eventId
      seasonId: $seasonId
      promoCode: $promoCode
    ) {
      promoType
      eventTickets {
        _id
        name
        description
        totalQty
        remainingQty
        performanceIds
        tiers {
          _id
          name
          price
          startsAt
          endsAt
          totalQty
          remainingQty
        }
        purchaseLimit
        visible
        values
        dayIds
      }
      eventUpgrades {
        _id
        name
        price
        totalQty
        remainingQty
        purchaseLimit
        complimentary
        complimentaryWith
        complimentaryQty
        ticketTypeIds
        imageUrl
        description
        rollFees
        visible
      }
      active
      startsAt
      endsAt
      remainingQty
      overRideMax
      overRideMaxUpg
    }
  }
`;

export default query;
