import gql from 'graphql-tag';

interface OrderFragments {
  tickets: object;
  upgrades: object;
  promotions: object;
}

interface OrderFragment {
  fragments: OrderFragments;
}

const Order: OrderFragment = {
  fragments: {
    tickets: {},
    upgrades: {},
    promotions: {}
  }
};

export default Order;

Order.fragments = {
  tickets: gql`
    fragment OrderTickets on Order {
      tickets {
        _id
        name
        ticketTypeId
        ticketTierId
        price
        values
        seat
        dayIds
        qrCodeUrl
        paymentId
        state
        refund {
          refunded
          refundedAt
          refundedBy
          refundReason
          refundedAmount
        }
        scan {
          scanned
          scannedAt
          scannedBy
          startsAt
        }
      }
    }
  `,
  upgrades: gql`
    fragment OrderUpgrades on Order {
      upgrades {
        _id
        name
        upgradeId
        price
        qrCodeUrl
        paymentId
        state
        refund {
          refunded
          refundedAt
          refundedBy
          refundReason
          refundedAmount
        }
        scan {
          scanned
          scannedAt
          scannedBy
          startsAt
        }
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
};
