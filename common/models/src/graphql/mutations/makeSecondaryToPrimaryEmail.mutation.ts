import gql from "graphql-tag";

const mutation = gql`
  mutation makeSecondaryEmailPrimary($email: String!) {
    makeSecondaryEmailPrimary(email: $email) {
      _id
      firstName
      lastName
      phoneNumber
      secondaryEmails
      email
      __typename
    }
  }
`;

export default mutation;
