import gql from "graphql-tag";

const query = gql`
  query role($roleId: String!) {
    role(roleId: $roleId) {
      _id
      userId
      userEmail
      orgId
      org {
        orgName
        orgLogoUrl
      }
      role
      createdAt
      createdBy
      acceptedAt
      user {
        _id
        firstName
        lastName
        email
      }
    }
  }
`;

export default query;