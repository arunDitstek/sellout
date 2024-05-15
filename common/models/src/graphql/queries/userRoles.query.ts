import gql from 'graphql-tag';

const query = gql`
  query userRoles {
    userRoles {
      _id
      userId
      userEmail
      user {
        _id
        firstName
        lastName
        email
      }
      orgId
      org {
        userId
        orgName
        orgLogoUrl
        stripeId
      }
      role
      createdAt
      createdBy
      acceptedAt
    }
  }
`;

export default query;