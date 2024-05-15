import gql from 'graphql-tag';

const mutation = gql`
  mutation createOrderPaymentIntent($params: OrderPaymentIntentInput!) {
    createOrderPaymentIntent(params: $params) {
      paymentIntentId
      clientSecret
    }
  }
`;

export default mutation;
