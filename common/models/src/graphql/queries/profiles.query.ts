import gql from "graphql-tag";

const query = gql`
  query userProfiles($query: UserProfileQueryInput, $pagination: PaginationInput) {
    userProfiles(query: $query, pagination: $pagination) {
      _id
      userId
      imageUrl
      firstName
      lastName
      email
      phoneNumber
      authyId
      stripeCustomerId
      address {
        address1
        address2
        city
        state
        zip
        country
        phone
        placeName
      }
    }
  }
`;

export default query;