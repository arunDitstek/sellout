import React, { Fragment } from "react";
import styled from "styled-components";
import CustomerTable from "../components/CustomerTable";
import PageLoader from "../components/PageLoader";
import useListCustomers from "../hooks/useListCustomers.hook";
import { TopLeftPaddedPage } from "../components/PageLayout";
import PageSearch from "../components/PageSearch";
import FilterButton from "../elements/FilterButton";
import { useMutation } from "@apollo/react-hooks";
import { Icons } from "@sellout/ui";
import GENERATE_USER_PROFILE_REPORT from "@sellout/models/.dist/graphql/mutations/generateUserProfileReport.mutation";
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";
import { media } from "@sellout/ui/build/utils/MediaQuery";
import { useDispatch } from "react-redux";
import * as AppActions from "../redux/actions/app.actions";
import { AppNotificationTypeEnum } from "../models/interfaces/IAppNotification";
const Spacer = styled.div`
  width: 8px;
  padding: 5px;
`;

const SearchContainer = styled.div`
  margin: 0px 24px 24px 0px;
  display: flex;
  ${media.mobile`
   display: block;
  `};
`;

const TableContainer = styled.div`
  display: flex;
  height: calc(100% - 74px);
  ${media.mobile`
  height: calc(100% - 160px);
`};
`;

type CustomerListProps = {};

const CustomerList: React.FC<CustomerListProps> = () => {
  /** Hooks */
  const [searchQuery, setSearchQuery] = React.useState("");
  const [disable, setDisable] = React.useState("false");
  const query = {
    name: searchQuery,
    email: searchQuery,
    phoneNumber: searchQuery,
    any: true,
  };
  const dispatch = useDispatch()
  const [generateUserProfileReport, { data, loading, error }] = useMutation(
    GENERATE_USER_PROFILE_REPORT,
    {
      variables: {
        query,
      },
      onCompleted(data) {
        const { url = '' } = data.generateUserProfileReport
        // To download with URL
        if (url) {
          window.location.href = url
        } else if (data?.generateUserProfileReport?.message) {
          // To display success toaster in case of Email sent to client 
          dispatch(AppActions.showNotification(data?.generateUserProfileReport?.message, AppNotificationTypeEnum.Success))
        }
        setDisable("false");
      },
      onError(error) {
        console.error(error);
      },
    }
  );
  console.log("data  ", loading, data)

  const {
    customers,
    loading: customersLoading,
    fetchMore,
  } = useListCustomers({
    variables: {
      pagination: {
        pageSize: 60,
        pageNumber: 1,
      },
      query,
    },
    context: {
      debounceKey: "QUERY_CUSTOMERS",
      debounceTimeout: 250,
    },
  });

  /** Render */
  return (
    <Fragment>
      <PageLoader nav={true} fade={Boolean(customers)} />
      {customers && (
        <TopLeftPaddedPage>
          <SearchContainer>
            <PageSearch
              setSearchQuery={setSearchQuery}
              searchQuery={searchQuery}
              loading={customersLoading}
              placeHolder="Search by Name, Email, Phone"
            />
            <Spacer />
            <FilterButton
              text="Export List"
              icon={Icons.DownloadReport}
              loading={loading}
              onClick={() => {
                if (disable == "false") {
                  setDisable("true");
                  generateUserProfileReport();
                }
              }}
            />
          </SearchContainer>
          <TableContainer>
            <CustomerTable
              customers={customers}
              fetchMore={fetchMore}
              paginationType={PaginationTypes.Customers}
            />
          </TableContainer>
        </TopLeftPaddedPage>
      )}
    </Fragment>
  );
};

export default CustomerList;
