import gql from 'graphql-tag';

const mutation = gql`
  mutation updateUserPhoneNumber ($newPhoneNumber: String!) {
    updateUserPhoneNumber (newPhoneNumber: $newPhoneNumber) {
      _id
      firstName
      lastName
      email
      emailVerifiedAt
      phoneNumber
      phoneNumberVerifiedAt
      orgContextId
      phoneNumberWaitingForVerify
      emailWaitingForVerify
      userProfile {
        imageUrl
      }
    }
  }
`;

export default mutation;