import gql from 'graphql-tag';

const mutation  = gql`
  mutation updateBasicUserInfo ($firstName: String, $lastName: String, $imageUrl: String) {
    updateBasicUserInfo (firstName: $firstName, lastName: $lastName, imageUrl: $imageUrl) {
      _id
    }
  }
`;

export default mutation;
