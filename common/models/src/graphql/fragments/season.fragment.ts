import gql from "graphql-tag";

interface SeasonFragments {
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
  Events: object;
}

interface SeasonFragment {
  fragments: SeasonFragments;
}

const Season: SeasonFragment = {
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
    Events: {},
  },
};

Season.fragments = {
  schedule: gql`
    fragment SeasonSchedule on Season {
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
    fragment Location on Season {
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
    fragment Performances on Season {
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
    fragment TicketTypes on Season {
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
    fragment TicketHolds on Season {
      holds {
        _id
        name
        qty
        ticketTypeId
      }
    }
  `,
  upgrades: gql`
    fragment SeasonUpgrades on Season {
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
    fragment SeasonPromotions on Season {
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
        discountType
        discountValue
      }
    }
  `,
  customFields: gql`
    fragment SeasonCustomFields on Season {
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
    fragment Fees on Season {
      fees {
        _id
        name
        orgId
        seasonId
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
    fragment Artists on Season {
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
    fragment TicketExchange on Season {
      exchange {
        allowed
        percent
      }
    }
  `,
  metrics: gql`
    fragment Metrics on Season {
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
    fragment WebFlowEntity on Season {
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
    fragment Analytics on Season {
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
    fragment SeasonPromotions on Season {
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
        discountType
        discountValue
      }
    }
  `,

  Events: gql`
    fragment SeasonEvents on Season {
      events {
        _id
        name
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
        schedule {
          announceAt
          ticketsAt
          ticketsEndAt
          startsAt
          endsAt
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
      }
    }
  `,
};

export default Season;
