import gql from 'graphql-tag';

const mutation = gql`
  mutation generateUserProfileReport($query: UserProfileQueryInput) {
    generateUserProfileReport(query: $query) {
      url
      message
    }
  }
`;


export default mutation;