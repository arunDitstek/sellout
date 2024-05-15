import React from "react";
import styled from "styled-components";
import { Page, PageTitle } from "../components/PageLayout";
import SuperAdminOrganizationsTable from "../components/SuperAdminOrganizationsTable";
import QUERY_ORGANIZATIONS from "@sellout/models/.dist/graphql/queries/organizations.query";
import { useQuery } from "@apollo/react-hooks";
import PageLoader from "../components/PageLoader";
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";
import PageSearch from "../components/PageSearch";
import { SearchContainer } from "./OrderList.page";
import GET_PLATFORM_SETTINGS from "@sellout/models/.dist/graphql/queries/platformSettings.query";


const TableContainer = styled.div`
  height: calc(100% - 60px);
`;

type SuperAdminOrganizationsProps = {}


const SuperAdminOrganizations: React.FC<SuperAdminOrganizationsProps> = () => {

   /* State */
  const [searchQuery, setSearchQuery] = React.useState("");

  const query = {
    orgQuery: searchQuery,
    orgIds: [searchQuery],
    any: true,
  };
  /** Hooks */
  const { data, fetchMore, loading } = useQuery(QUERY_ORGANIZATIONS, {
    variables: {
      pagination: {
        pageSize: 60,
        pageNumber: 1,
      },
      query,
    },
    context: {
      debounceKey: "QUERY_ORGANIZATION",
      debounceTimeout: 250,
    },
  });
  const { data: platformData } = useQuery(GET_PLATFORM_SETTINGS);

  /* Render */
  return (
    <>
      <PageLoader nav sideNav fade={Boolean(data?.organizations)} />
      <Page>
        <PageTitle>Organizations</PageTitle>
        <SearchContainer>   
          <PageSearch
            setSearchQuery={setSearchQuery}
            searchQuery={searchQuery}
            loading={loading}
            placeHolder="Search by Org ID, Organizations Name"
          />
        </SearchContainer>
        <TableContainer>
          <SuperAdminOrganizationsTable
            organizations={data?.organizations}
            selloutWebFlowSiteId={platformData?.platformSettings?.webFlowSiteId}
            fetchMore={fetchMore}
            paginationType={PaginationTypes.Organizations}
          />
        </TableContainer>
      </Page>
    </>
  );
};

export default SuperAdminOrganizations;
