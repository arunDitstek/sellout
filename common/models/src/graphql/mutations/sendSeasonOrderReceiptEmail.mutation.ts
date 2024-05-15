import gql from 'graphql-tag';

const query = gql`
  mutation sendSeasonOrderReceiptEmail($orderId: String!) {
    sendSeasonOrderReceiptEmail(orderId: $orderId)
  }
`;

export default query;
