import React, { Fragment } from "react";
import styled from "styled-components";
import * as Time from "@sellout/utils/.dist/time";
import { Colors, Loader, LoaderSizes } from "@sellout/ui";
import { setToken } from "../utils/Auth";
import ScrollTable, {
  ScrollTableBody,
  ScrollTableBodyCell,
  ScrollTableBodyRow,
  ScrollTableHeader,
  ScrollTableHeaderCell,
  ScrollTableNoContent,
  ScrollTableSpace,
} from "./ScrollableTable";
import SET_USER_ORG_CONTEXT_ID from "@sellout/models/.dist/graphql/mutations/setUserOrgContextId.mutation";
import { useMutation } from "@apollo/react-hooks";
import TextButton, {
  TextButtonSizes,
} from "@sellout/ui/build/components/TextButton";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import * as AppActions from "../redux/actions/app.actions";
import CREATE_WEBFLOW_SITE from "@sellout/models/.dist/graphql/mutations/createWebFlowSite.mutation";
import QUERY_ORGANIZATIONS from "@sellout/models/.dist/graphql/queries/organizations.query";
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";

const Container = styled.div`
  display: flex;
  height: fit-content;
  max-height: 100%;
  width: 100%;
  padding-bottom: 30px;
`;

const NoContentHead = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.Grey1};
  margin-bottom: 5px;
`;

const NoContentBody = styled.div`
  font-weight: 500;
  font-size: 1.8rem;
  color: ${Colors.Grey3};
`;

const LoaderContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${Colors.White};
  border-radius: 0px 0px 10px 10px;
  padding: 10px 0px;
`;

const TableHeader: React.FC = () => (
  /** Render */
  <ScrollTableHeader>
    <ScrollTableHeaderCell flex="1">Org Id</ScrollTableHeaderCell>
    <ScrollTableSpace />
    <ScrollTableHeaderCell flex="1">Name</ScrollTableHeaderCell>
    <ScrollTableSpace />
    <ScrollTableHeaderCell flex="1">Owner Email</ScrollTableHeaderCell>
    <ScrollTableSpace />
    <ScrollTableHeaderCell flex="1">Created</ScrollTableHeaderCell>
    <ScrollTableSpace />
    <ScrollTableHeaderCell flex="1">Actions</ScrollTableHeaderCell>
    <ScrollTableSpace />
  </ScrollTableHeader>
);

type TableRowsProps = {
  organizations: any;
  selloutWebFlowSiteId: string;
};

const TableRows: React.FC<TableRowsProps> = ({
  organizations,
  selloutWebFlowSiteId,
}) => {
  /** Hooks */
  const dispatch = useDispatch();
  const setOrgId = (orgId: string) => dispatch(AppActions.setOrgId(orgId));
  const history = useHistory();
  const [addSelloutSite] = useMutation(CREATE_WEBFLOW_SITE, {
    refetchQueries: [{ query: QUERY_ORGANIZATIONS }],
  });
  const [setUserOrgContextId] = useMutation(SET_USER_ORG_CONTEXT_ID, {
    onCompleted(data) {
      const { token } = data.setUserOrgContextId;
      setToken(token);
      window.location.href = "/admin/dashboard";
    },
  });

  /** Render */
  return (
    <>
      {organizations?.map((organization: any, index: number) => {
        let {
          _id,
          orgName,
          createdAt,
          webFlow: { sites = [] },
        } = organization;

        const email =
          organization.user && organization.user.email
            ? organization.user.email
            : "Unknown User";
        const hasPublishPermission = sites.find(
          (site: any) => site.webFlowId === selloutWebFlowSiteId
        );
        orgName = orgName || "Unknown Name";

        return (
          <ScrollTableBodyRow key={index} height="40px">
            <ScrollTableBodyCell flex="1">{_id}</ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell flex="1">{orgName}</ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell flex="1">{email}</ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell flex="1">
              {Time.format(createdAt)}
            </ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell flex="1">
              <TextButton
                size={TextButtonSizes.Small}
                children="Login"
                margin="0px 5px 0px 0px"
                onClick={() => {
                  setUserOrgContextId({
                    variables: {
                      orgId: _id,
                    },
                  });
                }}
              />
              <TextButton
                size={TextButtonSizes.Small}
                children="View settings"
                margin="0px 5px 0px 0px"
                onClick={() => {
                  setOrgId(_id);
                  history.push(
                    `/admin/dashboard/super/organizations/settings?orgId=${_id}`
                  );
                }}
              />
              {!hasPublishPermission && (
                <TextButton
                  size={TextButtonSizes.Small}
                  children="Grant publish permissions"
                  margin="0px 5px 0px 0px"
                  onClick={() =>
                    addSelloutSite({
                      variables: {
                        orgId: _id,
                        webFlowId: selloutWebFlowSiteId,
                      },
                    })
                  }
                />
              )}
            </ScrollTableBodyCell>
            <ScrollTableSpace />
          </ScrollTableBodyRow>
        );
      })}
    </>
  );
};

type SuperAdminOrganizationsTableProps = {
  organizations: any;
  selloutWebFlowSiteId: string;
  fetchMore?: Function;
  paginationType?: PaginationTypes;
};

const SuperAdminOrganizationsTable: React.FC<
  SuperAdminOrganizationsTableProps
> = ({ organizations, selloutWebFlowSiteId, fetchMore, paginationType }) => {
  const scrollContainer = React.useRef<any>(null);

  if (organizations?.length <= 0) {
    return (
      <Container>
        <ScrollTable>
          <TableHeader />
          <ScrollTableBody>
            <ScrollTableNoContent>
              <NoContentHead>No organizations yet</NoContentHead>
              <NoContentBody>This is a problem...</NoContentBody>
            </ScrollTableNoContent>
          </ScrollTableBody>
        </ScrollTable>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <ScrollTable
          fetchMore={fetchMore}
          paginationType={paginationType}
          updateQuery={(prev: any, { fetchMoreResult }: any) => {
            if (!fetchMoreResult) return prev;
            return {
              ...prev,
              organizations: [
                ...prev.organizations,
                ...fetchMoreResult.organizations,
              ],
            };
          }}
          scrollContainer={scrollContainer}
        >
          {(loading: boolean) => {
            return (
              <Fragment>
                <TableHeader />
                <ScrollTableBody ref={scrollContainer}>
                  <TableRows
                    organizations={organizations}
                    selloutWebFlowSiteId={selloutWebFlowSiteId}
                  />
                  {loading && (
                    <LoaderContainer>
                      <Loader size={LoaderSizes.Large} color={Colors.Orange} />
                    </LoaderContainer>
                  )}
                </ScrollTableBody>
              </Fragment>
            );
          }}
        </ScrollTable>
      </Container>
    </>
  );
};

export default SuperAdminOrganizationsTable;
