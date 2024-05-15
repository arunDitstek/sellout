import gql from 'graphql-tag';

const mutation = gql`
  mutation updateEventOrSeasonFee($orgId: String,$eventId: String,$seasonId: String, $fee: FeeInput!) {
    updateEventOrSeasonFee(orgId: $orgId,eventId: $eventId,seasonId: $seasonId, fee: $fee) {
      _id
      name
      orgId
      eventId
      seasonId
      type
      value
      appliedTo
      appliedBy
      minAppliedToPrice
      maxAppliedToPrice
      filters
      paymentMethods
      createdBy
      createdAt
      updatedBy
      updatedAt
      disabled
    }
  }
`;

export default mutation;