import gql from "graphql-tag";

const query = gql`
  query userProfile {
    userProfile {
      user {
        _id
        firstName
        lastName
        phoneNumber
        email
      }
      stripeCustomerId
      stripeCustomer {
        paymentMethods {
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
    }
  }
`;

export default query;