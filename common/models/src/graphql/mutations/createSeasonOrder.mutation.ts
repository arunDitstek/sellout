import gql from "graphql-tag";

const mutation = gql`
  mutation createSeasonOrder($params: OrderSeasonInput!) {
    createSeasonOrder(params: $params) {
      _id
      userId
      orgId
      seasonId
      createdAt
      stripeChargeId
      feeIds
      tickets {
        _id
        name
        ticketTypeId
        ticketTierId
        price
        seat
        refund {
          refunded
          refundedAt
          refundedBy
          refundedAmount
          __typename
        }
        scan {
          scanned
          scannedAt
          scannedBy
          __typename
        }
        values
        __typename
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
          __typename
        }
        scan {
          scanned
          scannedAt
          scannedBy
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

export default mutation;
