import gql from "graphql-tag";

const query = gql`
  query venue($venueId: String) {
    venue(venueId: $venueId) {
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
      tax
      url
      imageUrls
      venueGlobalId
    }
  }
`;

export default query;