import gql from "graphql-tag";
import Order from "../fragments/order.fragment";

const query = gql`
  query orders($query: OrderQueryInput, $pagination: PaginationInput) {
    orders(query: $query, pagination: $pagination) {
      _id
      userId
      printed
      user {
        email
        firstName
        lastName
        createdAt
      }
      orgId
      eventId
      seasonId
      venueIds
      eventName
      hidden
      event {
        _id
        name
        seasonId
        subtitle
        posterImageUrl
        isMultipleDays
        schedule {
          startsAt
          endsAt
          __typename
        }
        performances {
          schedule {
            doorsAt
            startsAt
          }
        }
        sendQRCode
        venueId
        venue {
          _id
          name
          address {
            state
            city
            timezone
          }
        }
      }
      season {
        _id
        name
        subtitle
        posterImageUrl
        sendQRCode
        performances {
          schedule {
            doorsAt
            startsAt
          }
        }
        schedule {
          startsAt
          endsAt
        }
        venueId
        venue {
          _id
          name
          address {
            state
            city
            timezone
          }
        }
      }
      fees {
        _id
        name
        orgId
        eventId
        type
        value
        minAppliedToPrice
        maxAppliedToPrice
        filters
        appliedTo
        appliedBy
        createdBy
        createdAt
        updatedBy
        updatedAt
        disabled
        amount
      }
      createdAt
      stripeChargeId
      state
      refundedAmount
      promotionCode
      type
      channel
      tax
      ipAddress
      address {
        lat
        lng
        zip
      }
      payments {
        _id
        paymentIntentId
        amount
        transferAmount
        feeAmount
        feeIds
        createdAt
        createdBy
        promotionCode
        paymentMethodType
      }
      ...OrderTickets
      ...OrderUpgrades
    }
  }
  ${Order.fragments.tickets}
  ${Order.fragments.upgrades}
`;

export default query;
