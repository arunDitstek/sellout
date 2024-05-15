import gql from "graphql-tag";

const query = gql`
  query userProfiles($query: UserProfileQueryInput) {
    userProfiles(query: $query) {
      _id
      userId
      imageUrl
      user {
        _id
        email
        firstName
        lastName
        phoneNumber
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
      analytics {
        label
        type
        interval
        intervalOptions
        coordinates {
          x
          y
        }
        segments {
          label
          type
          coordinates {
            x
            y
          }
        }
      }
      metrics {
        lifeTimeValue
        lifeTimeTicketsPurchased
        eventIds
      }
    }
  }
`;

export default query;