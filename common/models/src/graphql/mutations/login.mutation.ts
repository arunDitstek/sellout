import gql from 'graphql-tag';

const mutation = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        _id
        firstName
        lastName
        email
        phoneNumber
        createdAt
      }
      token
    }
  }
`;

export default mutation;
