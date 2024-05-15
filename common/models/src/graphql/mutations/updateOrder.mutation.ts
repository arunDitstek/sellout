import gql from 'graphql-tag';

const mutation = gql`
mutation updateOrder($params: UpdateOrderInput) {
    updateOrder(params: $params) {
      _id
    }
  }
  
`;
export default mutation;
