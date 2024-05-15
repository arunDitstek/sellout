import React, { Fragment, useEffect, useState } from "react";
import styled from "styled-components";
import * as AppActions from "../redux/actions/app.actions";
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
} from "../components/ScrollableTable";
import { useDispatch } from "react-redux";
import { PaginationTypes } from "@sellout/models/.dist/interfaces/IPagination";
import { ModalTypes } from "../components/modal/Modal";
import * as FeeActions from "../redux/actions/fee.actions";
import { FeePaymentMethodEnum } from "@sellout/models/.dist/interfaces/IFee";

export const NoContentHead = styled.div`
  font-weight: 600;
  font-size: 1.8rem;
  color: ${Colors.Grey1};
  margin-bottom: 5px;
`;

const Ellipsis = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 120px;
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

const TexCenter = styled.div`
  text-align: center;
  width: 120px;
`;

type CheckBox = {
  checked?: boolean;
  disabled?: boolean;
  id?: number;
};

type TableProps = {
  showEvent?: boolean;
  showCheckedIn?: boolean;
  batchPrint?: boolean;
};

const TableHeader: React.FC<TableProps> = () => {
  return (
    <ScrollTableHeader>
      <ScrollTableHeaderCell width="140px">Fee name</ScrollTableHeaderCell>
      <ScrollTableHeaderCell width="90px">Fee applied by</ScrollTableHeaderCell>
      <ScrollTableSpace />
      <Fragment>
        <ScrollTableHeaderCell width="90px">
          Fee applied to
        </ScrollTableHeaderCell>
        <ScrollTableSpace />
      </Fragment>

      <ScrollTableHeaderCell width="80px">Filters</ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="180px">
        Payment method
      </ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="120px">
        Min price applied to
      </ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="120px">
        Max price applied to
      </ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="70px">Fee type</ScrollTableHeaderCell>
      <ScrollTableSpace />
      <ScrollTableHeaderCell width="72px">Amount</ScrollTableHeaderCell>
      <ScrollTableSpace />
    </ScrollTableHeader>
  );
};

type TableRowsProps = {
  fees: any;
  updateFee?: any;
  deleteFee?: any;
  orgId?: any;
  eventId?: string;
  seasonId?: string;
} & TableProps;
const TableRows: React.FC<TableRowsProps> = ({
  fees,
  updateFee,
  deleteFee,
  orgId,
  eventId,
  seasonId,
}) => {
  const dispatch = useDispatch();
  return (
    <>
      {fees.map((fee: any, index: number) => {
        let { value } = fee;
        const isFlat = fee.type === "Flat";
        const paymentMethod = fee?.paymentMethods?.map(
          (method: string, index: number) => {
            return method === FeePaymentMethodEnum.CardReader
              ? FeePaymentMethodEnum.CardReaderWifi
              : method;
          }
        );
        const onClick = () => {
          dispatch(FeeActions.setFeeId(fee._id as string));
          dispatch(
            AppActions.pushModal(ModalTypes.FeeModal, {
              updateFee,
              deleteFee,
              orgId,
              eventId,
              seasonId,
            })
          );
        };
        return (
          <ScrollTableBodyRow
            key={fee._id}
            height="40px"
            onClick={(e) => onClick()}
          >
            <>
              <ScrollTableBodyCell width="140px">
                {fee.name}
              </ScrollTableBodyCell>
            </>
            <ScrollTableBodyCell width="90px">
              {fee.appliedBy}
            </ScrollTableBodyCell>
            <ScrollTableSpace />

            <ScrollTableBodyCell width="90px">
              {fee.appliedTo}{" "}
            </ScrollTableBodyCell>
            <ScrollTableSpace />

            <ScrollTableBodyCell width="80px">
              {fee.filters[0]}
            </ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell width="180px">
              {/* <Ellipsis title={paymentMethod}> */}
              {paymentMethod.join(", ")}
              {/* </Ellipsis> */}
            </ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell width="120px">
              <TexCenter>
                ${Price.output(fee.minAppliedToPrice, true)}
              </TexCenter>
            </ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell width="120px">
              <TexCenter>
                ${Price.output(fee.maxAppliedToPrice, true)}
              </TexCenter>
            </ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell width="70px">{fee.type}</ScrollTableBodyCell>
            <ScrollTableSpace />
            <ScrollTableBodyCell width="72px">
              {isFlat ? "$" + `${Price.output(value, true)}` : `${value}%`}
            </ScrollTableBodyCell>
          </ScrollTableBodyRow>
        );
      })}
    </>
  );
};

type FeesTableProps = {
  fees: any;
  fetchMore?: Function;
  refetch?: Function;
  paginationType?: PaginationTypes;
  createFee?: any;
  updateFee?: any;
  deleteFee?: any;
  orgId?: any;
  eventId?: string;
  seasonId?: string;
  feesLength?: any;
} & TableProps;

const FeesTable: React.FC<FeesTableProps> = ({
  fees,
  fetchMore,
  paginationType,
  updateFee,
  deleteFee,
  orgId,
  eventId,
  seasonId,
  feesLength,
}) => {
  const scrollContainer = React.useRef<any>(null);
  const [sortedData, setSortedData] = useState([] as any);

  const handleSorting = (data: any) => {
    const sorted = [...data]; // Make a copy of the original data array
    sorted.sort((a, b) => {
      const a_appliedBy = a.appliedBy.toLowerCase();
      const b_appliedBy = b.appliedBy.toLowerCase();
      const a_appliedTo = a.appliedTo.toLowerCase();
      const b_appliedTo = b.appliedTo.toLowerCase();
      const a_name = a.name.toLowerCase();
      const b_name = b.name.toLowerCase();
      const a_minAppliedToPrice = a.minAppliedToPrice;
      const b_minAppliedToPrice = b.minAppliedToPrice;
      // Compare two elements based on a specific property
      // Modify the comparison logic according to your requirements
      if (a_appliedBy > b_appliedBy) {
        return 1;
      }
      if (a_appliedBy < b_appliedBy) {
        return -1;
      }
      if (a_appliedTo > b_appliedTo) {
        return 1;
      }
      if (a_appliedTo < b_appliedTo) {
        return -1;
      }
      if (a_name > b_name) {
        return 1;
      }
      if (a_name < b_name) {
        return -1;
      }
      if (a_minAppliedToPrice) {
        return a_minAppliedToPrice - b_minAppliedToPrice;
      }
      return 0;
    });
    setSortedData(sorted);
  };

  useEffect(() => {
    if (fees.length > 0) {
      handleSorting(fees);
    }
  }, [fees, sortedData.length]);

  /** Render */
  if (feesLength?.length <= 0) {
    return (
      <ScrollTable>
        <TableHeader />
        <ScrollTableBody>
          <ScrollTableNoContent>
            <NoContentHead>No Fees</NoContentHead>
          </ScrollTableNoContent>
        </ScrollTableBody>
      </ScrollTable>
    );
  }

  return (
    <ScrollTable
      // fetchMore={fetchMore}
      paginationType={paginationType}
      updateQuery={(prev: any, { fetchMoreResult }: any) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          fees: [...prev.platformFees, ...fetchMoreResult.platformFees],
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
                fees={sortedData}
                updateFee={updateFee}
                deleteFee={deleteFee}
                orgId={orgId}
                eventId={eventId}
                seasonId={seasonId}
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

export default FeesTable;
