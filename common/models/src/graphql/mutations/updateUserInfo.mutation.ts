import gql from "graphql-tag";

const mutation = gql`
  mutation updateUserInfo($_id: String, $email: String, $phoneNumber: String) {
    updateUserInfo(_id: $_id, email: $email, phoneNumber: $phoneNumber) {
      _id
      email
      phoneNumber
    }
  }
`;

export default mutation;
