import gql from "graphql-tag";

const mutation = gql`
mutation generateWaitListReport($eventId:String) {
    generateWaitListReport(eventId:$eventId) {
      url
    }
  }
`;

export default mutation;
