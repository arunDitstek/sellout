import gql from 'graphql-tag';

const mutation = gql`
  mutation createVenue($venue: VenueInput!) {
    createVenue(venue: $venue) {
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
      }
      url
      tax
      imageUrls
      venueGlobalId
    }
  }
`;

export default mutation;
