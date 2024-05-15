import gql from 'graphql-tag';

const query = gql`
  query listStripeTerminalReaders {
    listStripeTerminalReaders {
      id
      label
      type
      location
      serialNumber
      status
      ipAddress
    }
  }
`;

export default query;
