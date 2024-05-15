import gql from "graphql-tag";

export const query = gql`
query notifyEvent($eventId:String,$email:String){
    notifyEvent(eventId:$eventId,email:$email){
        _id
    }
}
`
export default query;