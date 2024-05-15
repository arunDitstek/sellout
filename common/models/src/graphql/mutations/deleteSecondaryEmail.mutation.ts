import gql from "graphql-tag";

const mutation = gql`
  mutation deleteSecondaryEmail($email: String!) {
    deleteSecondaryEmail(email: $email) {
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
