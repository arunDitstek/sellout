import gql from 'graphql-tag';

// need to update this mutation to delete userProfiles
const mutation = gql`
  mutation deleteUnverifiedUser($userId: String, $email: String, $phoneNumber: String) {
    deleteUnverifiedUser(userId: $userId, email: $email, phoneNumber: $phoneNumber)
  }
`;

export default mutation;
