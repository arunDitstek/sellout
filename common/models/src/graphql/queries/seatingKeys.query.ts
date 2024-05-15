import gql from "graphql-tag";

const query = gql`
  query seating($orgId: String) {
    seating(orgId: $orgId) {
      secretKey
    }
  }
`;

export default query;
