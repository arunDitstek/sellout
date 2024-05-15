import gql from "graphql-tag";

const query = gql`
  query getStripeCardByMethod($paymentMethodId: String!) {
    getStripeCardByMethod(paymentMethodId: $paymentMethodId) {
      brand
      last4
      expMonth
      expYear
      funding
      country
      paymentMethodId
      type
    }
  }
`;

export default query;
