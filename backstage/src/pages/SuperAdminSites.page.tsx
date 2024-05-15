import React from 'react';
import styled from 'styled-components';
import { Page, PageTitle } from '../components/PageLayout';
import LIST_WEBFLOW_SITES from '@sellout/models/.dist/graphql/queries/webFlowSites.query';
import { useQuery, useMutation } from '@apollo/react-hooks';
import PageLoader from "../components/PageLoader";
import SuperAdminWebFlowTable from '../components/SuperAdminWebFlowTable';

const TableContainer = styled.div`
  height: calc(100% - 60px);
`;

type SuperAdminSitesProps = {}

const SuperAdminSites: React.FC<SuperAdminSitesProps> = () => {
  /** Hooks */
  const { data } = useQuery(LIST_WEBFLOW_SITES);

  /* Render */
  return (
    <>
      <PageLoader nav sideNav fade={Boolean(data?.webFlowSites?.length)} />
      {data?.webFlowSites?.length && (
        <Page>
          <PageTitle>
            Sites
          </PageTitle>
          <TableContainer>
            <SuperAdminWebFlowTable sites={data?.webFlowSites} />
          </TableContainer>
        </Page>
      )}
    </>
  );
};

export default SuperAdminSites;