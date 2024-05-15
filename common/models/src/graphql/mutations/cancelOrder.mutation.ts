import gql from "graphql-tag";

const mutation = gql`
mutation cancelOrder($orderId: String!, $ticketIds: [String], $upgradeIds: [String], $cancelReason: String) {
    cancelOrder(orderId:$orderId, ticketIds:$ticketIds, upgradeIds:$upgradeIds, cancelReason:$cancelReason){
        _id
    }
  }
`;

export default mutation;
