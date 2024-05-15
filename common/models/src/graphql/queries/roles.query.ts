import gql from "graphql-tag";

const query = gql`
  query roles($query: QueryInput, $pagination: PaginationInput) {
    roles(query: $query, pagination: $pagination) {
      _id
      userId
      userEmail
      user {
        _id
        firstName
        lastName
        email
        userProfile {
          imageUrl
          authyId
        }
      }
      orgId
      role
      createdAt
      createdBy
      acceptedAt
    }
  }
`;

export default query;