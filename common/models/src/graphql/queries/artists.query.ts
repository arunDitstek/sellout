import gql from "graphql-tag";

const query = gql`
  query artists($query: ArtistQueryInput, $pagination: PaginationInput) {
    artists(query: $query, pagination: $pagination) {
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

