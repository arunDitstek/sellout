import gql from "graphql-tag";
import Event from "../fragments/event.fragment";

const mutation = gql`
  mutation updateEvent($event: EventInput!) {
    updateEvent(event: $event) {
      _id
      orgId
      type
      name
      seasonId
      subtitle
      description
      userAgreement
      processAs
      posterImageUrl
      venueId
      createdAt
      publishable
      seatingChartKey
      age
      isMultipleDays
      totalDays
      cancel
      sendQRCode
      hasOrders
      taxDeduction
      subscription {
        _id
      email
      frequency
      }
      organization {
        orgName
        stripeId
      }
      waitList {
        name
        phoneNumber
        email
        createdAt
      }
      venue {
        _id
        name
        tax
        address {
          state
          city
          timezone
        }
        imageUrls
      }
      stub
      published
      taxDeduction
      ticketDeliveryType
      physicalDeliveryInstructions
      salesBeginImmediately
      isGuestTicketSale
      guestTicketPerMember
      ...EventSchedule
      ...Location
      ...Performances
      ...TicketTypes
      ...TicketHolds
      ...EventUpgrades
      ...EventPromotions
      ...EventCustomFields
      ...TicketExchange
      ...Fees
      ...Artists
      ...WebFlowEntity
      ...Analytics
    }
  }

  ${Event.fragments.schedule}
  ${Event.fragments.location}
  ${Event.fragments.performances}
  ${Event.fragments.ticketTypes}
  ${Event.fragments.holds}
  ${Event.fragments.upgrades}
  ${Event.fragments.promotions}
  ${Event.fragments.customFields}
  ${Event.fragments.exchange}
  ${Event.fragments.fees}
  ${Event.fragments.artists}
  ${Event.fragments.webFlowEntity}
  ${Event.fragments.analytics}
`;

export default mutation;
