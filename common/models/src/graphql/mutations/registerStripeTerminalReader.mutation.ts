import gql from 'graphql-tag';

const mutation = gql`
  mutation registerStripeTerminalReader($label: String, $registrationCode: String) {
    registerStripeTerminalReader(label: $label, registrationCode: $registrationCode) {
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

export default mutation;
