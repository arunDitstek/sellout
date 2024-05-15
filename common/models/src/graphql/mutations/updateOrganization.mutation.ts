import gql from "graphql-tag";

const mutation = gql`
  mutation updateOrganization($organization: OrganizationInput!) {
    updateOrganization(organization: $organization) {
      _id
      isSeasonTickets
      isTegIntegration
      validateMemberId
      tegClientID
      tegSecret
      tegURL
      ticketFormat
    }
  }
`;

export default mutation;
