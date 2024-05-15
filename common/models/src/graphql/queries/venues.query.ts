
import gql from "graphql-tag";

const query = gql`
  query venues($query: VenueQueryInput, $pagination: PaginationInput) {
    venues(query: $query, pagination: $pagination) {
      _id
      orgId
      name
      description
      capacity
      address {
        address1
        address2
        city
        state
        zip
        country
        phone
        lat
        lng
        placeId
        placeName
        timezone
      }
      url
      tax
      imageUrls
      venueGlobalId
    }
  }
`;

export default query;