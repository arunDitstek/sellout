import gql from 'graphql-tag';

const mutation = gql`
  mutation createOrder($params: OrderInput!) {
    createOrder(params: $params) {
      _id
      userId
      orgId
      eventId
      createdAt
      stripeChargeId
      feeIds
      tickets {
        _id
        name
        ticketTypeId
        ticketTierId
        price
        origionalPrice
        seat
        refund {
          refunded
          refundedAt
          refundedBy
          refundedAmount
        }
        scan {
          scanned
          scannedAt
          scannedBy
        }
        values
      }
      upgrades {
        _id
        name
        upgradeId
        price
        refund {
          refunded
          refundedAt
          refundedBy
          refundedAmount
        }
        scan {
          scanned
          scannedAt
          scannedBy
        }
      }
    }
  }
`;

export default mutation;
