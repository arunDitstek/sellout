import gql from "graphql-tag";
import Order from '../fragments/order.fragment';

const mutation = gql`
  mutation breakApartOrder($orderId: String!) {
    breakApartOrder(orderId: $orderId) {
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
          }
        }
        venue {
          _id
          name
          address {
            state
            city
            timezone
          }
        }
        organization {
          orgName
          ticketFormat
        }
      }
      state
      type
      ...OrderTickets
      ...OrderUpgrades
    }
  }
  ${Order.fragments.tickets}
  ${Order.fragments.upgrades}
`;

export default mutation;
