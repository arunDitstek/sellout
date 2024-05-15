import gql from "graphql-tag";
import Season from "../fragments/season.fragment";

const query = gql`
  query season($seasonId: String!) {
    season(seasonId: $seasonId) {
      _id
      orgId
      name
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
      sendQRCode
      hasOrders
      taxDeduction
      organization {
        orgName
        stripeId
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
      isGuestTicketSale
      published
      salesBeginImmediately
      ...SeasonSchedule
      ...Location
      ...Performances
      ...TicketTypes
      ...TicketHolds
      ...SeasonUpgrades
      ...SeasonPromotions
      ...SeasonCustomFields
      ...TicketExchange
      ...Fees
      ...Artists
      ...WebFlowEntity
      ...Analytics
      ...SeasonEvents
    }
  }

  ${Season.fragments.schedule}
  ${Season.fragments.location}
  ${Season.fragments.performances}
  ${Season.fragments.ticketTypes}
  ${Season.fragments.holds}
  ${Season.fragments.upgrades}
  ${Season.fragments.promotions}
  ${Season.fragments.customFields}
  ${Season.fragments.exchange}
  ${Season.fragments.fees}
  ${Season.fragments.artists}
  ${Season.fragments.webFlowEntity}
  ${Season.fragments.analytics}
  ${Season.fragments.Events}
`;

export default query;
