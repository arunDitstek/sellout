import gql from "graphql-tag";
import Event from "../fragments/event.fragment";

const query = gql`
  query event($eventId: String!) {
    event(eventId: $eventId) {
      _id
      orgId
      type
      name
      seasonId
      subtitle
      description
      userAgreement
      processAs
      cancel
      posterImageUrl
      venueId
      createdAt
      publishable
      seatingChartKey
      seatingPublicKey
      age
      isMultipleDays
      totalDays
      taxDeduction
      sendQRCode
      organization {
        orgName
        stripeId
        googleAnalyticsId
        facebookPixelId
        isTegIntegration
        validateMemberId
        tegClientID
        tegSecret
        tegURL
      }
      venue {
        _id
        name
        address {
          state
          city
          timezone
        }
        imageUrls
      }
      published
      taxDeduction
      salesBeginImmediately
      isGuestTicketSale
      guestTicketPerMember
      ...EventSchedule
      ...Location
      ...Performances
      ...TicketTypes
      ...EventUpgrades
      ...EventPromotions
      ...EventCustomFields
      ...Fees
    }
  }

  ${Event.fragments.schedule}
  ${Event.fragments.location}
  ${Event.fragments.performances}
  ${Event.fragments.ticketTypes}
  ${Event.fragments.upgrades}
  ${Event.fragments.purchasePortalPromotions}
  ${Event.fragments.customFields}
  ${Event.fragments.fees}
`;

export default query;
