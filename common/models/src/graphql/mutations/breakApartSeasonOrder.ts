import gql from "graphql-tag";
import Order from "../fragments/order.fragment";

const mutation = gql`
  mutation breakApartSeasonOrder($orderId: String!) {
    breakApartSeasonOrder(orderId: $orderId) {
      _id
      event {
        _id
        isMultipleDays
        name
        subtitle
        performances {
          schedule {
            doorsAt
            startsAt
            __typename
          }
          __typename
        }
        venue {
          _id
          name
          address {
            state
            city
            timezone
            __typename
          }
          __typename
        }
        organization {
          orgName
          ticketFormat
          __typename
        }
        __typename
      }
      state
      type
      ...OrderTickets
      ...OrderUpgrades
      __typename
    }
  }

  ${Order.fragments.tickets}
  ${Order.fragments.upgrades}
`;

export default mutation;
