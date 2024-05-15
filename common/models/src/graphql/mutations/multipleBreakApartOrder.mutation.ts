import gql from "graphql-tag";
import Order from '../fragments/order.fragment';

const mutation = gql`
mutation multipleBreakApartOrder($orderId: [String]!) {
    multipleBreakApartOrder(orderId: $orderId) {
      _id
    userId
    organization {
      orgName
      ticketFormat
    }
    user {
      email
      firstName
      lastName
    }
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
        __typename
      }
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
