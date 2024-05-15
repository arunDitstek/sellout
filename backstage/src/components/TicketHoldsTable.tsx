import { Fragment } from "react";
import ScrollTable, {
  ScrollTableBody,
  ScrollTableBodyCell,
  ScrollTableBodyRow,
  ScrollTableHeader,
  ScrollTableHeaderCell,
  ScrollTableNoContent,
  ScrollTableSpace,
} from "./ScrollableTable";
import React from "react";
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";
import { NoContentHead } from "./OrdersTable";
import { useDispatch } from "react-redux";
import * as AppActions from "../redux/actions/app.actions";
import { ModalTypes } from "./modal/Modal";
import ITicketHold from "@sellout/models/.dist/interfaces/ITicketHold";
import * as EventActions from "../redux/actions/event.actions";

type TableProps = {};
const TableHeader: React.FC<TableProps> = ({}) => {
  return (
    <ScrollTableHeader>
      <ScrollTableHeaderCell width="200px">Block Name</ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="200px">Ticket Type</ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="200px">Total Held</ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="200px">
        Total Checked In
      </ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="200px">
        Total Released
      </ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="200px">
        Total Outstanding
      </ScrollTableHeaderCell>
      <ScrollTableSpace />
    </ScrollTableHeader>
  );
};

type TableRowsProps = {
  holdTickets: ITicketHold[];
} & TableProps;

const TableRows: React.FC<TableRowsProps> = ({ holdTickets }) => {
  const dispatch = useDispatch();

  return (
    <>
      {holdTickets?.map((holdTicket: any) => {
        const onClick = () => {
          dispatch(EventActions.setTicketHoldId(holdTicket?._id));
          dispatch(AppActions.pushModal(ModalTypes.UpdateTicketBlockModal));
        };
        return (
          <ScrollTableBodyRow
            key={holdTicket._id}
            height="40px"
            onClick={(e) => onClick()}
          >
            <ScrollTableBodyCell width="200px">
            {holdTicket.name}
            </ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell width="200px">
              {holdTicket?.ticketType}
            </ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell width="200px">
              {holdTicket.totalHeld}
            </ScrollTableBodyCell>
            <ScrollTableSpace />

            <ScrollTableBodyCell width="200px">
              {holdTicket.totalCheckedIn}
            </ScrollTableBodyCell>
            <ScrollTableSpace />

            <ScrollTableBodyCell width="200px">
              {holdTicket.totalReleased}
            </ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell width="200px">
              {holdTicket.totalOutstanding}
            </ScrollTableBodyCell>
            <ScrollTableSpace />
          </ScrollTableBodyRow>
        );
      })}
    </>
  );
};

type OrdersTableProps = {
  holdTickets: any;
  fetchMore?: Function;
  refetch?: Function;
  paginationType?: PaginationTypes;
  batchPrint?: boolean;
} & TableProps;

const TicketHoldsTable: React.FC<OrdersTableProps> = ({
  holdTickets,
  fetchMore,
  paginationType,
}) => {
  const scrollContainer = React.useRef<any>(null);

  /** Render */
  if (holdTickets?.length <= 0) {
    return (
      <ScrollTable>
        <TableHeader />
        <ScrollTableBody>
          <ScrollTableNoContent>
            <NoContentHead>No ticket holds</NoContentHead>
          </ScrollTableNoContent>
        </ScrollTableBody>
      </ScrollTable>
    );
  }

  return (
    <ScrollTable
      fetchMore={fetchMore}
      paginationType={paginationType}
      scrollContainer={scrollContainer}
      name={"holdTickets"}
    >
      {(loading: boolean) => {
        return (
          <Fragment>
            <TableHeader />
            <ScrollTableBody ref={scrollContainer}>
              <TableRows holdTickets={holdTickets} />
            </ScrollTableBody>
          </Fragment>
        );
      }}
    </ScrollTable>
  );
};

export default TicketHoldsTable;
