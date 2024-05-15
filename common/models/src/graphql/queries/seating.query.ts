import gql from 'graphql-tag';

const query = gql`
  query seating {
    organization {
      _id
      seating {
        publicKey
        secretKey
        designerKey
      }
    }
  }
`;

export default query;
