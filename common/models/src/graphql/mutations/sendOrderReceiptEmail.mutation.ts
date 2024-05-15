import gql from 'graphql-tag';

const query = gql`
  mutation sendOrderReceiptEmail($orderId: String!) {
    sendOrderReceiptEmail(orderId: $orderId)
  }
`;

export default query;
