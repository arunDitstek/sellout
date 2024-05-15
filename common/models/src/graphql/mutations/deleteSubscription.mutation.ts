import gql from 'graphql-tag';

// need to update this mutation to delete userProfiles
const mutation = gql`
mutation deleteSubscription($eventId: String, $subscriptionId:String) {
    deleteSubscription(eventId: $eventId, subscriptionId:$subscriptionId){
        _id
    }
  }
`;

export default mutation;
