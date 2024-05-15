import gql from "graphql-tag";

const query = gql`
  query userExists(
    $email: String
    $phoneNumber: String
    $promoCode: String
    $eventId: String
    $seasonId: String
  ) {
    userExists(
      email: $email
      phoneNumber: $phoneNumber
      promoCode: $promoCode
      eventId: $eventId
      seasonId: $seasonId
    ) {
      userId
      firstName
      lastName
      email
      hasPassword
      phoneNumberVerifiedAt
      phoneNumber
      preferredLogin
      promoAvailable
      __typename
    }
  }
`;

export default query;
