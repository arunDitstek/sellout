import gql from 'graphql-tag';

const mutation = gql`
  mutation updateUserEmail ($newEmail: String!) {
    updateUserEmail (newEmail: $newEmail) {
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