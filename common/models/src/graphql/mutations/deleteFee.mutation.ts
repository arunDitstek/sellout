import gql from 'graphql-tag';

const mutation = gql`
  mutation disableFee($feeId: String!) {
    disableFee(feeId: $feeId)
  }
`;

export default mutation;
