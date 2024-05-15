import gql from "graphql-tag";

const query = gql`
  query Profile {
    user {
      _id
      firstName
      lastName
      email
      emailVerifiedAt
      phoneNumber
      phoneNumberVerifiedAt
      orgContextId
      phoneNumberWaitingForVerify
      emailWaitingForVerify
      preferredLogin
      secondaryEmails
      userProfile {
        imageUrl
      }
      role {
        role
      }
    }
    userProfile {
      userId
      firstName
      lastName
      email
      phoneNumber
      authyId
      stripeCustomerId
      imageUrl
      address {
        address1
        address2
        city
        state
        zip
        country
        phone
        placeName
      }
    }
    organization {
      _id
      userId
      createdAt
      authyId
      stripeId
      isSeasonTickets
      isTegIntegration
      validateMemberId
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
      address {
        address1
        address2
        placeName
        city
        state
        zip
        country
        phone
      }
      facebookPixelId
      googleAnalyticsId
      tegClientID
      tegSecret
      tegURL
      ticketFormat
    }
    platformSettings {
      stripeClientId
      stripeRedirectUrl
      webFlowSiteId
    }
  }
`;

export default query;
