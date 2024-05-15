import React, { Fragment, useEffect } from "react";
import styled from "styled-components";
import * as Price from "@sellout/utils/.dist/price";
import { Colors, Loader, LoaderSizes } from "@sellout/ui";
import ScrollTable, {
  ScrollTableBody,
  ScrollTableBodyCell,
  ScrollTableBodyRow,
  ScrollTableHeader,
  ScrollTableHeaderCell,
  ScrollTableNoContent,
  ScrollTableSpace,
} from "./ScrollableTable";
import UserImage from "@sellout/ui/build/components/UserImage";
import useNavigateToCustomerDetails from "../hooks/useNavigateToCustomerDetails.hook";
import AnalyticsUtil from "@sellout/models/.dist/utils/AnalyticsUtil";
import { UserAnalyticsSegmentsIndexEnum } from "@sellout/models/.dist/interfaces/IAnalytics";
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";

const NoContentHead = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.Grey1};
  margin-bottom: 5px;
`;

const LoaderContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${Colors.White};
  border-radius: 0;
  // const eventState = useSelector((state: BackstageState) => state.event);
  // const { eventId, eventsCache } = eventState;
  padding: 10px 0px;
`;

const TableHeader: React.FC = () => (
  <ScrollTableHeader>
    <ScrollTableHeaderCell flex="1">Name</ScrollTableHeaderCell>
    <ScrollTableSpace />
    <ScrollTableHeaderCell flex="1">Email</ScrollTableHeaderCell>
    <ScrollTableSpace />
    <ScrollTableHeaderCell flex="1">Phone</ScrollTableHeaderCell>
    <ScrollTableSpace />
    <ScrollTableHeaderCell flex="1">Events</ScrollTableHeaderCell>
    <ScrollTableSpace />
    <ScrollTableHeaderCell flex="1">LTV</ScrollTableHeaderCell>
  </ScrollTableHeader>
);

type TableRowProps = {
  customers: any;
};

const TableRows: React.FC<TableRowProps> = ({ customers }) => {
  const navigateToCustomerDetails = useNavigateToCustomerDetails();

  return customers.map((profile: any, index: number) => {
    const {
      user: { firstName, lastName, email, phoneNumber },
      imageUrl,
      userId,
      analytics,
      metrics
    } = profile;
    

    // const eventsAttended = AnalyticsUtil.getTotalValue(
    //   analytics.segments[UserAnalyticsSegmentsIndexEnum.EventsAttendedCount]
    //     .coordinates
    // );
  

    const onClick = () => navigateToCustomerDetails(userId);

    return (
      <ScrollTableBodyRow key={index} height="40px" onClick={(e) => onClick()}>
        <ScrollTableBodyCell flex="1">
          <UserImage
            height="25px"
            size="1rem"
            imageUrl={imageUrl}
            firstName={firstName}
            lastName={lastName}
            margin="0 10px 0 0"
          />
          <div>{`${firstName} ${lastName}`}</div>
        </ScrollTableBodyCell>
        <ScrollTableSpace />
        <ScrollTableBodyCell flex="1">{email}</ScrollTableBodyCell>
        <ScrollTableSpace />
        <ScrollTableBodyCell flex="1">{phoneNumber}</ScrollTableBodyCell>
        <ScrollTableSpace />
        <ScrollTableBodyCell flex="1">{metrics && metrics[0] &&metrics[0]?.eventIds && metrics[0]?.eventIds.length || 0 || 0}</ScrollTableBodyCell>
        <ScrollTableSpace />
        <ScrollTableBodyCell flex="1">
          ${Price.output(metrics && metrics[0]?.lifeTimeValue || 0, true)}
        </ScrollTableBodyCell>
      </ScrollTableBodyRow>
    );
  });
};

type CustomerTableProps = {
  customers: any;
  fetchMore?: Function;
  paginationType?: PaginationTypes;
};
const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  fetchMore,
  paginationType,
}) => {
  const scrollContainer = React.useRef<any>(null);
  const [length, setLength] = React.useState(0);

  useEffect(() => {
    setLength(customers.length);
  }, [customers.length]);

  /** Render */
  if (customers?.length <= 0) {
    return (
      <ScrollTable>
        <TableHeader />
        <ScrollTableBody>
          <ScrollTableNoContent>
            <NoContentHead>No customers yet</NoContentHead>
          </ScrollTableNoContent>
        </ScrollTableBody>
      </ScrollTable>
    );
  }

  return (
    <ScrollTable
      fetchMore={fetchMore}
      paginationType={paginationType}
      updateQuery={(prev: any, { fetchMoreResult }: any) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          userProfilesAdmin: [
            ...prev.userProfilesAdmin,
            ...fetchMoreResult.userProfilesAdmin,
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
              <TableRows customers={customers} />
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
  );
};

export default CustomerTable;
