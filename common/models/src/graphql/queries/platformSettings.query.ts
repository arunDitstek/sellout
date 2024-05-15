import gql from "graphql-tag";

const query = gql`
query organization {
    platformSettings {
      stripeClientId
      stripeRedirectUrl
      webFlowSiteId
    }
  }
`;

export default query;
