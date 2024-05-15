import gql from "graphql-tag";

const query = gql`
  query context {
    userProfile {
      userId
      firstName
      lastName
      email
      phoneNumber
      imageUrl
    }
    organization {
      _id
      userId
      createdAt
      authyId
      stripeId
      stripeConnectAccount {
        name
        country
        email
        payoutsEnabled
        stripeAccountId
      }
      seating {
        publicKey
        secretKey
        designerKey
      }
      orgName
      orgUrls
      orgLogoUrl
      orgColorHex
      bio
      email
      phoneNumber
    }
  }
`;

export default query;
