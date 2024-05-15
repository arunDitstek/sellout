import gql from "graphql-tag";

const query = gql`
  query organizations(
    $query: OrganizationQueryInput
    $pagination: PaginationInput
  ) {
    organizations(query: $query, pagination: $pagination) {
      _id
      orgName
      orgUrls
      orgLogoUrl
      createdAt
      address {
        address1
        address2
        city
        state
        zip
        country
        placeName
      }
      user {
        email
      }
      seating {
        publicKey
        secretKey
        designerKey
      }
      webFlow {
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
      }
    }
  }
`;

export default query;
