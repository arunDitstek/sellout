import gql from 'graphql-tag';

const mutation = gql`
mutation generateActivityReport($query: OrderQueryInput) {
    generateActivityReport(query: $query) {
      url
      message
      __typename
    }
  }
  
`;

export default mutation;
