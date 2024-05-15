import gql from 'graphql-tag';

const query = gql`
  mutation createWebFlowSite($webFlowId: String!, $orgId: String!) {
    createWebFlowSite(webFlowId: $webFlowId, orgId: $orgId) {
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
      createdAt
      updatedAt
    }
  }
`;

export default query;
