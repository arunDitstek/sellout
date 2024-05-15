import gql from 'graphql-tag';

const query = gql`
  mutation setUserPassword($password: String!) {
    setUserPassword(password: $password) {
      _id
    }
  }
`;

export default query;
