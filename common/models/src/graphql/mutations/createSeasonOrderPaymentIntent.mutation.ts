import gql from "graphql-tag";

const mutation = gql`
  mutation createSeasonOrderPaymentIntent(
    $params: OrderSeasonPaymentIntentInput!
  ) {
    createSeasonOrderPaymentIntent(params: $params) {
      paymentIntentId
      clientSecret
    }
  }
`;

export default mutation;
