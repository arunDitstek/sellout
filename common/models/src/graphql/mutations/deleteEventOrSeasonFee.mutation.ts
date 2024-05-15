import gql from 'graphql-tag';

const mutation = gql`
mutation deleteEventOrSeasonFee($eventId: String, $seasonId: String, $feeId: String!, $orgId: String) {
  deleteEventOrSeasonFee(eventId: $eventId, seasonId: $seasonId, feeId: $feeId, orgId:$orgId)
}
`;

export default mutation;