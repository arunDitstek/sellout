import gql from "graphql-tag";

const query = gql`
  query userProfilesAdmin(
    $query: UserProfileQueryInput
    $pagination: PaginationInput
  ) {
    userProfilesAdmin(query: $query, pagination: $pagination) {
      _id
      userId
      imageUrl
      user {
        _id
        email
        firstName
        lastName
        phoneNumber
        __typename
      }
      stripeCustomerId
      analytics {
        label
        type
        interval
        intervalOptions
        coordinates {
          x
          y
          __typename
        }
        segments {
          label
          type
          coordinates {
            x
            y
            __typename
          }
          __typename
        }
        __typename
      }
      metrics {
        lifeTimeValue
        eventIds
        } 
      __typename
    }
  }
`;

export default query;
