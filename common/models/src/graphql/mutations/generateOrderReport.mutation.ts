import gql from "graphql-tag";

const mutation = gql`
  mutation generateOrderReport($query: OrderQueryInput) {
    generateOrderReport(query: $query) {
      url
      message
    }
  }
`;

export default mutation;
