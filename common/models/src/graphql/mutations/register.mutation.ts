import gql from 'graphql-tag';

const mutation = gql`
  mutation Register($user: UserInput!) {
    register(user: $user) {
      registered
      emailVerified
      userProfile {
        user {
          _id
          firstName
          lastName
          phoneNumber
          email
          preferredLogin
          orgContextId
          role {
            role
          }
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
  }
`;

export default mutation;
