import gql from "graphql-tag";

const query = gql`
  query artist($artistId: String) {
    artist(artistId: $artistId) {
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

export default query;
