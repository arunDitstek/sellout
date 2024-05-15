import gql from 'graphql-tag';

const mutation = gql`
  mutation updateGuestOrder($params: UpdateGuestOrderInput) {
  updateGuestOrder(params: $params) {
    _id
    email
  }
}
`;
export default mutation;
