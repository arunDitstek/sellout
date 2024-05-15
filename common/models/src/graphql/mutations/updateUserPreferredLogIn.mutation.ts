import gql from "graphql-tag";

const mutation = gql`
  mutation updateUserPreferredLogin($preferredLogin: String!) {
    updateUserPreferredLogin(preferredLogin: $preferredLogin) {
      _id
      email
      preferredLogin
    }
  }
`;

export default mutation;
