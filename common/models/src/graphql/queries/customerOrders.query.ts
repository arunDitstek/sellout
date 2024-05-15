import gql from "graphql-tag";
import Event from "../fragments/event.fragment";

// This one is for the recent orders card on the customer overview page in backstage.
const query = gql`
  query orders($query: OrderQueryInput, $pagination: PaginationInput) {
    orders(query: $query, pagination: $pagination) {
      _id
      event {
        _id
        name
        subtitle
        posterImageUrl
        hasOrders
        schedule {
          startsAt
        }
        venue {
          name
          address {
            state
            city
          }
        }
        published
        ...EventSchedule
        ...TicketTypes
        ...EventUpgrades
        ...WebFlowEntity
      }
    }
  }

  ${Event.fragments.schedule}
  ${Event.fragments.ticketTypes}
  ${Event.fragments.upgrades}
  ${Event.fragments.webFlowEntity}
`;

export default query;
