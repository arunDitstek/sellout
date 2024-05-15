import gql from 'graphql-tag';

const query = gql`
  query webFlowSites {
    webFlowSites {
      name
      webFlowId
      enabled
      createdAt
      updatedAt
      previewUrl
      domains {
        lastPublishedAt
        name
      }
    }
  }
`;

export default query;