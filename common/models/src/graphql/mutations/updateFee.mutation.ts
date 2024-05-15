import gql from 'graphql-tag';

const mutation = gql`
  mutation updateFee($fee: FeeInput!) {
    updateFee(fee: $fee) {
      _id
      name
      orgId
      eventId
      type
      value
      appliedTo
      appliedBy
      minAppliedToPrice
      maxAppliedToPrice
      filters
      createdBy
      createdAt
      updatedBy
      updatedAt
      disabled
    }
  }
`;
export default mutation;
