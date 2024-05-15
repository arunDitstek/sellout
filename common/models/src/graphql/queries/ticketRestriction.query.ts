import gql from "graphql-tag";

const query = gql`
query ticketRestriction($query: TicketRestrictionInput) {
    ticketRestriction(query:$query){
        eventId
        seasonId
        guestTicketCounts{
            teiMemberId
            count
            inValid
        }
    }
}
`;

export default query;