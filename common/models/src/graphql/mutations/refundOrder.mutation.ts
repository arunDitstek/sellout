import gql from "graphql-tag";
import Order from '../fragments/order.fragment';

const mutation = gql`
  mutation refundOrder(
    $orderId: String!
    $refundAmount: Int
    $processingFee: Boolean
    $ticketIds: [String]
    $upgradeIds: [String]
    $refundReason: String
    $promoterFee: Boolean
  ) {
    refundOrder(
      orderId: $orderId
      refundAmount: $refundAmount
      processingFee: $processingFee
      promoterFee: $promoterFee
      ticketIds: $ticketIds
      upgradeIds: $upgradeIds
      refundReason: $refundReason
    ) {
      _id
      userId
      user {
        email
        firstName
        lastName
        createdAt
        phoneNumber
        userProfile {
          imageUrl
        }
      }
      orgId
      eventId
      eventName
      # event {
      #   _id
      #   posterImageUrl
      #   schedule {
      #     startsAt
      #   }
        # venue {
        #   name
        #   address {
        #     state
        #     city
        #   }
        # }
      # }
      fees {
        _id
        name
        orgId
        eventId
        type
        value
        minAppliedToPrice
        maxAppliedToPrice
        filters
        appliedTo
        appliedBy
        createdBy
        createdAt
        updatedBy
        updatedAt
        disabled
      }
      createdAt
      stripeChargeId
      state
      refundedAmount
      refundReason
      promotionCode
      type
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
      createdBy
      creator {
        firstName
        lastName
      }
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
`;

export default mutation;
