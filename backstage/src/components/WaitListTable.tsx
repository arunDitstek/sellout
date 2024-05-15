import React, { Fragment} from "react";
import styled from "styled-components";
import * as Time from "@sellout/utils/.dist/time";
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
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";

export const NoContentHead = styled.div`
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
  padding: 10px 0px;
`;

type CheckBox = {
  checked?: boolean;
  disabled?: boolean;
  id?: number;
};
const Label = styled.label<CheckBox>`
  position: relative;
  cursor: pointer;
  &:before {
    content: "";
    -webkit-appearance: none;
    background-color: transparent;
    border: 2px solid #ff700f;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05),
      inset 0px -15px 10px -12px rgba(0, 0, 0, 0.05);
    padding: 6px;
    display: inline-block;
    position: relative;
    vertical-align: middle;
    cursor: pointer;
    margin-right: 5px;
    border-radius: 3px;
  }
  &:after {
    content: "";
    display: ${(props) => (props.checked ? "block" : "none")};
    position: absolute;
    top: 2px;
    left: 5.5px;
    width: 2px;
    height: 6px;
    border: solid #ff700f;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }
`;

interface WaitListProps {
  createdAt: number
  email: number | string
  name: number | string
  phoneNumber: number
  __typename: string
}

const TableHeader: React.FC= ({
}) => {
  return (
    <ScrollTableHeader>
     
      <ScrollTableHeaderCell flex="1">Name</ScrollTableHeaderCell>
      <ScrollTableSpace />


      <ScrollTableHeaderCell flex="1">Email</ScrollTableHeaderCell>
      <ScrollTableSpace />

      <ScrollTableHeaderCell flex="1">Phone</ScrollTableHeaderCell>
      <ScrollTableSpace />

      <ScrollTableHeaderCell flex="1">Date/Time</ScrollTableHeaderCell>
      <ScrollTableSpace />
     
    </ScrollTableHeader>
  );
};

type TableRowsProps = {
  waitList: any;
  timeZone:string
} 

const TableRows: React.FC<TableRowsProps> = ({
  waitList,
  timeZone
}) => {
  return (
    <>
      {waitList?.waitList?.map((eventWaitList:WaitListProps,index:number) => {
        const {createdAt } = eventWaitList;
        const isTimeZone = timeZone

        const timezones = isTimeZone? timeZone: undefined;
        const dateAndTime: string = Time.format(createdAt,
          "ddd, MMM DD, YYYY [at] h:mma",
          timezones
        );
        return (
          <ScrollTableBodyRow key={index}
          >
            <ScrollTableBodyCell flex="1">
              {eventWaitList.name}
            </ScrollTableBodyCell>
            <ScrollTableSpace />

            <ScrollTableBodyCell flex="1">
            {eventWaitList.email}
            </ScrollTableBodyCell>

            <ScrollTableSpace />
            <ScrollTableBodyCell flex="1">
            {eventWaitList.phoneNumber}
              </ScrollTableBodyCell>
            <ScrollTableSpace />

            <ScrollTableSpace />
            <ScrollTableBodyCell flex="1">{dateAndTime}</ScrollTableBodyCell>
            <ScrollTableSpace />
         
          </ScrollTableBodyRow>
        );
      })}
    </>
  );
};

type TableProps = {
  fetchMore?: Function;
  refetch?: Function;
  paginationType?: PaginationTypes;
  waitList:any
  timeZone:any
} 

const WaitListTable: React.FC<TableProps> = ({
  waitList,
  timeZone
}) => {
  const scrollContainer = React.useRef<any>(null);
  /** Render */
  if (waitList?.waitList?.length<=0) {
    return (
      <ScrollTable>
        <TableHeader
        />
          <ScrollTableBody>
            <ScrollTableNoContent>
              <NoContentHead>No Wait List</NoContentHead>
            </ScrollTableNoContent>
          </ScrollTableBody>
      </ScrollTable>
    );
  }

  return (
    <ScrollTable>
      {(loading: boolean) => {
        return (
          <Fragment>
            <TableHeader
            />
            <ScrollTableBody ref={scrollContainer}>
              <TableRows
                waitList={waitList}
                timeZone={timeZone}
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
  );
};

export default WaitListTable;
