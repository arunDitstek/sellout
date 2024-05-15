import gql from "graphql-tag";

const query = gql`
  query Analytics($query: AnalyticsQueryInput!) {
    orderAnalytics(query: $query) {
      label
      type
      interval
      intervalOptions
      coordinates {
        x
        y
      }
      segments {
        label
        type
        coordinates {
          x
          y
        }
      }
    }
  }
`;

export default query;
