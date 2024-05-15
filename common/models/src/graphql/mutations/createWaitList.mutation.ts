import gql from "graphql-tag";

const mutation = gql`
mutation createWaitList($params: WaitListInput!, $eventId: String, $orgId: String, $type: String ) {
    createWaitList(params: $params, eventId:$eventId, orgId:$orgId, type:$type) {
  _id
  }
  }
  `;

export default mutation;