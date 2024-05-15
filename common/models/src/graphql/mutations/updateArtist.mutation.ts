import gql from 'graphql-tag';

const mutation = gql`
  mutation updateArtist($artist: ArtistInput!) {
    updateArtist(artist: $artist) {
      _id
      orgId
      type
      name
      genres
      socialAccounts {
        _id
        platform
        link
      }
      pressKits {
        _id
        title
        description
        posterImageUrls
        links {
          platform
          link
        }
      }
      contacts {
        _id
        firstName
        lastName
        title
        company
        email
        phoneNumber
      }
      createdAt
    }
  }
`;

export default mutation;
