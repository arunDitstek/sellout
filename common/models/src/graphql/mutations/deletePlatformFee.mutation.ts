import gql from 'graphql-tag';

const mutation = gql`
  mutation deletePlatformFee($feeId: String!) {
    deletePlatformFee(feeId: $feeId)
  }
`;

export default mutation;