import gql from "graphql-tag";

interface EventFragments {
  schedule: object;
  location: object;
  performances: object;
  ticketTypes: object;
  holds: object;
  upgrades: object;
  promotions: object;
  customFields: object;
  fees: object;
  exchange: object;
  metrics: object;
  webFlowEntity: object;
  artists: object;
  analytics: object;
  purchasePortalPromotions: object;
}

interface EventFragment {
  fragments: EventFragments;
}

const Event: EventFragment = {
  fragments: {
    schedule: {},
    location: {},
    performances: {},
    ticketTypes: {},
    holds: {},
    upgrades: {},
    promotions: {},
    customFields: {},
    fees: {},
    exchange: {},
    metrics: {},
    webFlowEntity: {},
    artists: {},
    analytics: {},
    purchasePortalPromotions: {},
  },
};

Event.fragments = {
  schedule: gql`
    fragment EventSchedule on Event {
      schedule {
        announceAt
        ticketsAt
        ticketsEndAt
        startsAt
        endsAt
      }
    }
  `,
  location: gql`
    fragment Location on Event {
      location {
        address1
        address2
        city
        state
        zip
        country
        phone
      }
    }
  `,
  performances: gql`
    fragment Performances on Event {
      performances {
        _id
        name
        headliningArtistIds
        openingArtistIds
        venueId
        venueStageId
        price
        posterImageUrl
        videoLink
        songLink
        schedule {
          doorsAt
          startsAt
          endsAt
        }
      }
    }
  `,
  ticketTypes: gql`
    fragment TicketTypes on Event {
      ticketTypes {
        _id
        name
        totalQty
        remainingQty
        purchaseLimit
        performanceIds
        visible
        description
        rollFees
        values
        dayIds
        tiers {
          _id
          name
          price
          startsAt
          endsAt
          totalQty
          remainingQty
        }
      }
    }
  `,
  holds: gql`
    fragment TicketHolds on Event {
      holds {
        _id
        name
        qty
        ticketTypeId
        ticketType
        totalHeld
        totalCheckedIn
        totalReleased
        totalOutstanding
      }
    }
  `,
  upgrades: gql`
    fragment EventUpgrades on Event {
      upgrades {
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
    }
  `,
  promotions: gql`
    fragment EventPromotions on Event {
      promotions {
        _id
        code
        type
        totalQty
        remainingQty
        ticketTypeIds
        upgradeIds
        active
        startsAt
        endsAt
        useLimit
        overRideMax
        overRideMaxUpg
        discountType
        discountValue
        appliesTo
      }
    }
  `,
  customFields: gql`
    fragment EventCustomFields on Event {
      customFields {
        _id
        label
        type
        minLength
        maxLength
        minValue
        maxValue
        options
        required
        active
      }
    }
  `,
  fees: gql`
    fragment Fees on Event {
      fees {
        _id
        name
        orgId
        eventId
        type
        value
        appliedTo
        appliedBy
        minAppliedToPrice
        maxAppliedToPrice
        filters
        createdBy
        createdAt
        updatedBy
        updatedAt
        disabled
        paymentMethods
      }
    }
  `,
  artists: gql`
    fragment Artists on Event {
      artists {
        _id
        name
        genres
        socialAccounts {
          _id
          platform
          link
        }
        pressKits {
          _id
          title
          description
          posterImageUrls
          links {
            platform
            link
          }
        }
      }
    }
  `,
  exchange: gql`
    fragment TicketExchange on Event {
      exchange {
        allowed
        percent
      }
    }
  `,
  metrics: gql`
    fragment Metrics on Event {
      metrics {
        lifeTimeTicketsPurchased
        lifeTimeTicketsRefunded
        lifeTimeUpgradesPurchased
        lifeTimeUpgradesRefunded
        lifeTimeValue
        lifeTimeValueRefunded
      }
    }
  `,
  webFlowEntity: gql`
    fragment WebFlowEntity on Event {
      webFlowEntity {
        _id
        name
        selloutId
        entityType
        alwaysPublishTo
        webFlowIds {
          webFlowSiteId
          webFlowEntityId
          slug
          webFlowSite {
            name
            webFlowId
            enabled
            previewUrl
            domains {
              name
              lastPublishedAt
            }
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
  analytics: gql`
    fragment Analytics on Event {
      analytics {
        label
        type
        interval
        intervalOptions
        coordinates {
          x
          y
        }
        segments {
          label
          type
          coordinates {
            x
            y
          }
        }
      }
    }
  `,
  purchasePortalPromotions: gql`
    fragment EventPromotions on Event {
      promotions {
        _id
        type
        totalQty
        remainingQty
        ticketTypeIds
        upgradeIds
        active
        startsAt
        endsAt
        useLimit
        overRideMax
        overRideMaxUpg
        discountType
        discountValue
        appliesTo
      }
    }
  `,
};

export default Event;

// Event.fragments.event = gql`
//   fragment Event on Event {
//     _id
//     orgId
//     type
//     name
//     subtitle
//     description
//     posterImageUrl
//     venueId
//     createdAt
//     publishable
//     ...EventSchedule
//     ...Location
//     ...Performances
//     ...TicketTypes
//     ...TicketHolds
//     ...EventUpgrades
//     ...EventPromotions
//     ...EventCustomFields
//     ...TicketExchange
//     ...Fees
//   }

//   ${Event.fragments.schedule}
//   ${Event.fragments.location}
//   ${Event.fragments.performances}
//   ${Event.fragments.ticketTypes}
//   ${Event.fragments.holds}
//   ${Event.fragments.upgrades}
//   ${Event.fragments.promotions}
//   ${Event.fragments.customFields}
//   ${Event.fragments.exchange}
//   ${Event.fragments.fees}
// `,
