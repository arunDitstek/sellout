import gql from 'graphql-tag';

const query = gql`
  mutation remapWebFlowSite($webFlowId: String!) {
    remapWebFlowSite(webFlowId: $webFlowId) {
      _id
      orgId
      sites {
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
      entities {
        _id
        name
        selloutId
        entityType
        alwaysPublishTo
        webFlowIds {
          webFlowSiteId
          webFlowEntityId
          slug
        }
      }
    }
  }
`;

export default query;