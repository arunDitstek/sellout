import gql from 'graphql-tag';

const mutation = gql`
  mutation attachStripePaymentMethod($paymentMethodId: String!) {
    attachStripePaymentMethod(paymentMethodId: $paymentMethodId) {
      paymentMethodId
      brand
      last4
      expMonth
      expYear
      funding
      country
      type
    }
  }
`;

export default mutation;
