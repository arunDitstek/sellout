import gql from 'graphql-tag';

const mutation = gql`
mutation salesReport($params: SalesReportInput) {
    salesReport(params: $params) {
      _id
    }
  }
`;
export default mutation;
