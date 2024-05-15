import gql from "graphql-tag";
import Order from "../fragments/order.fragment";

const query = gql`
  query order($orderId: String) {
    order(orderId: $orderId) {
      _id
      userId
      printed
      email
      user {
        email
        firstName
        lastName
        phoneNumber
        userProfile {
          imageUrl
        }
      }
      orgId
      eventId
      seasonId
      hidden
      event {
        _id
        name
        subtitle
        seasonId
        isMultipleDays
        posterImageUrl
        sendQRCode
        ...EventPromotions
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
      processingFee {
        refund {
          refunded
          refundedAt
          refundedBy
          refundReason
          refundedAmount
          __typename
        }
        amount
      }
      promoterFee {
        refund {
          refunded
          refundedAt
          refundedBy
          refundReason
          refundedAmount
          __typename
        }
        amount
      }
      feeIds
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
        amount
      }
      createdAt
      stripeChargeId
      stripeCharge {
        brand
        last4
      }
      state
      refundedAmount
      refundReason
      promotionCode
      discountCode
      discountAmount
      type
      tax
      channel
      ipAddress
      address {
        lat
        lng
        zip
      }
      customFields {
        _id
        label
        value
        customFieldId
        type
      }
      createdBy
      creator {
        firstName
        lastName
      }
      qrCodeUrl
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
  ${Order.fragments.promotions}
`;

export default query;
